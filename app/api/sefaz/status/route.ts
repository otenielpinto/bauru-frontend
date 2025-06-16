import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/actions/actSession";
import { getMdfeEmitentesByEmpresa } from "@/actions/actMdfeEmitente";
import { z } from "zod";

/**
 * SEFAZ Status Response Schema for validation
 */
const SefazStatusResponseSchema = z.object({
  tpAmb: z.enum(["1", "2"]),
  verAplic: z.string(),
  cStat: z.number(),
  xMotivo: z.string(),
  cUF: z.number(),
  dhRecbto: z.string(),
  tMed: z.string(),
  dhRetorno: z.string(),
  xObs: z.string().optional(),
});

/**
 * SEFAZ Status Response Interface
 */
interface SefazStatusResponse {
  tpAmb: "1" | "2";
  verAplic: string;
  cStat: number;
  xMotivo: string;
  cUF: number;
  dhRecbto: string;
  tMed: string;
  dhRetorno: string;
  xObs?: string;
}

/**
 * GET /api/sefaz/status
 * Consulta o status do serviço SEFAZ para MDF-e
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verificar autenticação
    const user: any = await getUser();
    if (!user?.id_tenant) {
      return NextResponse.json(
        {
          error: "Usuário não autenticado",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }
    let emit: any = await getMdfeEmitentesByEmpresa(user.id_empresa);
    let cnpjcpf = emit?.data?.cpfcnpj || "";

    // Extract query parameters for UF and ambiente
    const { searchParams } = new URL(request.url);
    const uf = searchParams.get("uf") || "35"; // Default to SP if not provided
    const ambiente = searchParams.get("ambiente") || "1"; // Default to production

    // Validate UF parameter
    const ufNumber = parseInt(uf);
    if (isNaN(ufNumber) || ufNumber < 11 || ufNumber > 53) {
      return NextResponse.json(
        {
          error: "Código UF inválido. Deve ser um número entre 11 e 53.",
          code: "INVALID_UF",
        },
        { status: 400 }
      );
    }

    // Validate ambiente parameter
    if (!["1", "2"].includes(ambiente)) {
      return NextResponse.json(
        {
          error:
            "Ambiente inválido. Use '1' para Produção ou '2' para Homologação.",
          code: "INVALID_AMBIENTE",
        },
        { status: 400 }
      );
    }

    // Prepare SEFAZ status consultation payload
    const statusPayload = {
      cnpjcpf: cnpjcpf,
      tpAmb: ambiente,
      cUF: ufNumber,
      versao: "3.00",
    };

    // Get SEFAZ API configuration
    const sefazApiUrl =
      process.env.MDFE_API_URL || "http://192.168.3.160:9000/api/v1/mdfe";
    const statusEndpoint = `${sefazApiUrl}/status`;

    // Make request to SEFAZ API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

    try {
      const sefazResponse = await fetch(statusEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MDFE_TOKEN || ""}`,
          "User-Agent": "MDFe-SaaS-Front/1.0",
        },
        body: JSON.stringify(statusPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!sefazResponse.ok) {
        console.error(
          "Erro na resposta da SEFAZ:",
          sefazResponse.status,
          sefazResponse.statusText
        );

        // Try to extract error message
        let errorMessage = "Erro na comunicação com a SEFAZ";
        try {
          const errorData = await sefazResponse.json();
          errorMessage = errorData?.message || errorData?.error || errorMessage;
        } catch (parseError) {
          // If can't parse error, use default message
          console.warn("Não foi possível parsear erro da SEFAZ:", parseError);
        }

        return NextResponse.json(
          {
            error: errorMessage,
            code: "SEFAZ_ERROR",
            status: sefazResponse.status,
          },
          { status: 502 }
        );
      }

      // Parse response
      const result = await sefazResponse.json();

      // Validate response structure
      if (!result || !result.data) {
        console.error("Resposta inválida da SEFAZ:", result);
        return NextResponse.json(
          {
            error: "Resposta inválida da SEFAZ",
            code: "INVALID_RESPONSE",
          },
          { status: 502 }
        );
      }

      // Validate response data with Zod
      const validatedData = SefazStatusResponseSchema.parse(result.data);

      const ambienteLabel = ambiente === "1" ? "Produção" : "Homologação";

      return NextResponse.json({
        success: true,
        message: `Status da SEFAZ obtido com sucesso (${ambienteLabel})`,
        data: validatedData,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("Timeout na consulta à SEFAZ");
        return NextResponse.json(
          {
            error:
              "Timeout na comunicação com a SEFAZ. Tente novamente em alguns minutos.",
            code: "TIMEOUT",
          },
          { status: 408 }
        );
      }

      throw fetchError; // Re-throw for outer catch block
    }
  } catch (error) {
    console.error("Erro interno na consulta de status da SEFAZ:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Resposta da SEFAZ não está no formato esperado",
          code: "VALIDATION_ERROR",
          details: error.errors,
        },
        { status: 502 }
      );
    }

    // Handle generic errors
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        code: "INTERNAL_ERROR",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
