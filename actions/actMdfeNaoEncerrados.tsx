"use server";

import { getUser } from "@/actions/actSession";
import {
  ConsultaMdfeNaoEncerradosData,
  ConsultaMdfeNaoEncerradosResponse,
  ConsultaMdfeNaoEncerradosSchema,
} from "@/types/MdfeNaoEncerradosTypes";

/**
 * Consulta MDF-e não encerrados na SEFAZ por CNPJ
 * @param data Dados da consulta contendo o CNPJ
 * @returns Response com lista de MDF-e não encerrados
 */
export async function consultarMdfeNaoEncerrados(
  data: ConsultaMdfeNaoEncerradosData
): Promise<ConsultaMdfeNaoEncerradosResponse> {
  try {
    // 1. Verificar autenticação
    const user = await getUser();
    if (!user?.id_tenant) {
      return {
        success: false,
        message: "Usuário não autenticado ou sem tenant associado",
        error: "UNAUTHORIZED",
      };
    }

    // 2. Validar dados de entrada
    const validatedData = ConsultaMdfeNaoEncerradosSchema.parse(data);

    // 3. Preparar URL da API SEFAZ
    const sefazApiUrl =
      process.env.MDFE_API_URL || "http://192.168.3.160:9000/api/v1/mdfe";
    const endpoint = `${sefazApiUrl}/consulta/nao-encerrados`;

    // 4. Fazer a consulta na SEFAZ
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MDFE_TOKEN || ""}`,
        "User-Agent": "MDFe-SaaS-Front/1.0",
      },
      body: JSON.stringify({
        cnpjcpf: validatedData.cnpj,
      }),
      signal: AbortSignal.timeout(30000), // 30 seconds timeout
    });

    if (!response.ok) {
      console.error(
        "Erro na resposta da SEFAZ:",
        response.status,
        response.statusText
      );

      let errorMessage = "Erro na comunicação com a SEFAZ";
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorData?.error || errorMessage;
      } catch (parseError) {
        console.warn("Não foi possível parsear erro da SEFAZ:", parseError);
      }

      return {
        success: false,
        message: "Erro na consulta",
        error: errorMessage,
      };
    }

    // 5. Processar resposta
    const result = await response.json();

    return {
      success: true,
      message: "Consulta realizada com sucesso",
      data: {
        items: result.data?.items || [],
      },
    };
  } catch (error) {
    console.error("Erro na consulta de MDF-e não encerrados:", error);

    // Handle validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return {
        success: false,
        message: "Dados de entrada inválidos",
        error: "VALIDATION_ERROR",
      };
    }

    // Handle timeout errors
    if (error instanceof Error && error?.name === "AbortError") {
      return {
        success: false,
        message: "Timeout na comunicação com a SEFAZ",
        error: "TIMEOUT",
      };
    }

    return {
      success: false,
      message: "Erro interno na consulta",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
