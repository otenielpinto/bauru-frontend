import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema for CNPJ validation
const cnpjSchema = z
  .string()
  .regex(/^\d{14}$/, "CNPJ deve conter exatamente 14 dígitos")
  .refine(validateCnpj, "CNPJ inválido");

// Type for ReceitaWS API response
interface ReceitaWSResponse {
  cnpj: string;
  identificador_matriz_filial: number;
  descricao_matriz_filial: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: string;
  descricao_situacao_cadastral: string;
  data_situacao_cadastral: string;
  motivo_situacao_cadastral: number;
  nome_cidade_exterior?: string;
  codigo_natureza_juridica: number;
  data_inicio_atividade: string;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  descricao_tipo_logradouro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  uf: string;
  codigo_municipio: number;
  municipio: string;
  ddd_telefone_1: string;
  ddd_telefone_2: string;
  ddd_fax: string;
  qualificacao_do_responsavel: number;
  capital_social: number;
  porte: string;
  opcao_pelo_mei: boolean;
  opcao_pelo_simples: boolean;
  data_opcao_pelo_simples?: string;
  data_exclusao_do_simples?: string;
  opcao_pelo_simei: boolean;
  data_opcao_pelo_simei?: string;
  data_exclusao_do_simei?: string;
  cnaes_secundarios: Array<{
    codigo: number;
    descricao: string;
  }>;
  qsa: Array<{
    identificador_de_socio: number;
    nome_socio: string;
    cnpj_cpf_do_socio: string;
    codigo_qualificacao_socio: number;
    percentual_capital_social: number;
    data_entrada_sociedade: string;
    cpf_representante_legal?: string;
    nome_representante_legal?: string;
    codigo_qualificacao_representante_legal?: number;
  }>;
  status?: string;
  message?: string;
}

// Error response type
interface ErrorResponse {
  error: string;
  details?: string;
  status: number;
}

/**
 * Validates CNPJ using the official algorithm
 */
function validateCnpj(cnpj: string): boolean {
  if (!cnpj || cnpj.length !== 14) return false;

  // Check if all digits are the same
  if (/^(\d)\1+$/.test(cnpj)) return false;

  // Calculate first check digit
  let sum = 0;
  let weight = 5;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }

  const firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (firstDigit !== parseInt(cnpj[12])) return false;

  // Calculate second check digit
  sum = 0;
  weight = 6;

  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }

  const secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return secondDigit === parseInt(cnpj[13]);
}

/**
 * Formats CNPJ removing non-numeric characters
 */
function formatCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, "");
}

/**
 * Creates standardized error response
 */
function createErrorResponse(
  message: string,
  status: number = 400,
  details?: string
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      error: message,
      details,
      status,
    },
    { status }
  );
}

/**
 * GET /api/receita?cnpj={cnpj}
 * Consulta dados de CNPJ através da API ReceitaWS
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract CNPJ from query parameters
    const { searchParams } = new URL(request.url);
    const cnpjParam = searchParams.get("cnpj");

    // Early return for missing CNPJ
    if (!cnpjParam) {
      return createErrorResponse("Parâmetro CNPJ é obrigatório", 400);
    }

    // Format and validate CNPJ
    const cnpj = formatCnpj(cnpjParam);

    const validation = cnpjSchema.safeParse(cnpj);
    if (!validation.success) {
      return createErrorResponse(
        "CNPJ inválido",
        400,
        validation.error.issues[0]?.message
      );
    }

    // Fetch data from ReceitaWS API
    const receitaUrl = `https://receitaws.com.br/v1/cnpj/${cnpj}`;

    const response = await fetch(receitaUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "MDFe-SAAS-Application",
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 seconds timeout
    });

    // Handle non-200 responses
    if (!response.ok) {
      if (response.status === 429) {
        return createErrorResponse(
          "Limite de requisições excedido. Tente novamente em alguns minutos.",
          429
        );
      }

      return createErrorResponse(
        "Erro ao consultar CNPJ na Receita Federal",
        response.status
      );
    }

    const data: ReceitaWSResponse = await response.json();

    // Handle API errors in response body
    if (data.status === "ERROR") {
      return createErrorResponse(data.message || "CNPJ não encontrado", 404);
    }

    // Return successful response
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Handle timeout errors
    if (error instanceof Error && error.name === "TimeoutError") {
      return createErrorResponse("Timeout na consulta à Receita Federal", 408);
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return createErrorResponse(
        "Erro de conectividade com o serviço da Receita Federal",
        503
      );
    }

    // Generic error handling
    console.error("Error in CNPJ consultation:", error);
    return createErrorResponse(
      "Erro interno do servidor",
      500,
      process.env.NODE_ENV === "development" ? String(error) : undefined
    );
  }
}
