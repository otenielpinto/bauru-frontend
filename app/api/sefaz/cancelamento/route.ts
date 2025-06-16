import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/actions/actSession";
import {
  getMdfeById,
  updateMdfeStatusProtocoloChave,
} from "@/actions/actMdfeEnvio";

import { saveMdfeEvento } from "@/actions/actMdfeEvento";
import { saveMdfeRetorno } from "@/actions/actMdfeRetorno";
import {
  CancelarMdfeSchema,
  canCancelarMdfe,
  type MdfeCancelamentoRequest,
  type CancelamentoRespostaMDFe,
  type CancelamentoRespostaMDFeData,
  type CancelamentoApiResponse,
  type CancelamentoErrorResponse,
  type CancelamentoSuccessResponse,
  CancelarMdfePadraoSchema,
  validarJustificativaCancelamento,
  CANCELAMENTO_TIPO_EVENTO,
} from "@/types/MdfeCancelamentoTypes";

import {
  extrairDadosBase,
  enviarEventoComTratamento,
  isEventoAutorizado,
  extrairInfoResposta,
} from "@/lib/mdfe-api-utils";

/**
 * POST /api/sefaz/cancelamento
 * Cancela um MDFe autorizado na SEFAZ seguindo o padrão estabelecido
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Verificar autenticação
    const user = await getUser();
    if (!user?.id_tenant) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Usuário não autenticado",
          },
        } satisfies CancelamentoErrorResponse,
        { status: 401 }
      );
    }

    // 2. Validar entrada com Zod
    const body = await request.json();
    const validatedData = CancelarMdfeSchema.parse(body);

    // 3. Buscar e validar MDFe
    const mdfeResponse = await getMdfeById(validatedData.mdfeId);
    if (!mdfeResponse.success || !mdfeResponse.data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MDFE_NOT_FOUND",
            message: "MDFe não encontrado",
          },
        } satisfies CancelamentoErrorResponse,
        { status: 404 }
      );
    }
    const mdfe = mdfeResponse.data;

    // 4. Validações de negócio
    const validation = canCancelarMdfe(mdfe.status, mdfe.dataHoraAutorizacao);
    if (!validation.canCancelar) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BUSINESS_RULE_VIOLATION",
            message: validation.reason || "MDFe não pode ser cancelado",
          },
        } satisfies CancelamentoErrorResponse,
        { status: 400 }
      );
    }

    // 5. Extrair dados base usando função padronizada
    let dadosBase;
    try {
      dadosBase = extrairDadosBase(mdfe);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_REQUIRED_DATA",
            message:
              error instanceof Error
                ? error.message
                : "Dados obrigatórios ausentes",
          },
        } satisfies CancelamentoErrorResponse,
        { status: 400 }
      );
    }

    // 6. Preparar payload seguindo o padrão estabelecido
    const cancelamentoPayload: MdfeCancelamentoRequest = {
      ...dadosBase,
      justificativa: validatedData.justificativa,
      nSeqEvento: 1, // Primeiro evento de cancelamento
    };

    // 7. Validar payload com schema padronizado
    const validatedPayload =
      CancelarMdfePadraoSchema.parse(cancelamentoPayload);

    // 8. Validações adicionais usando funções padronizadas
    if (!validarJustificativaCancelamento(validatedPayload.justificativa)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_JUSTIFICATION",
            message: "Justificativa deve ter entre 15 e 255 caracteres",
          },
        } satisfies CancelamentoErrorResponse,
        { status: 400 }
      );
    }

    // 9. Enviar para SEFAZ usando função padronizada
    const sefazResult =
      await enviarEventoComTratamento<CancelamentoRespostaMDFe>(
        "cancelamento",
        validatedPayload
      );

    if (!sefazResult.success) {
      console.error("Erro na resposta da SEFAZ:", sefazResult.error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: sefazResult.error.code,
            message: sefazResult.error.message,
            details: sefazResult.error.details,
          },
        } satisfies CancelamentoErrorResponse,
        { status: 502 }
      );
    }

    const resposta = sefazResult.data as CancelamentoRespostaMDFe;

    // 10. Processar resposta usando funções padronizadas
    const infoResposta = extrairInfoResposta(resposta);
    const isCancelado = isEventoAutorizado(resposta);

    if (resposta.data) {
      // Salvar evento de cancelamento
      await saveMdfeEvento({
        mdfeId: validatedData.mdfeId,
        chave: resposta.data.chMDFe,
        tpEvento: CANCELAMENTO_TIPO_EVENTO,
        nSeqEvento: 1,
        tipoEvento: "cancelamento",
        protocolo: resposta.data.nProt,
        cStat: resposta.data.cStat,
        xMotivo: resposta.data.xMotivo,
        dhEvento: resposta.data.dhRegEvento,
        xml: resposta.data.xml || undefined,
        pdfBase64: resposta.data.pdfBase64 || undefined,
      });

      // Salvar retorno seguindo estrutura padrão
      await saveMdfeRetorno({
        mdfeId: validatedData.mdfeId,
        protocolo: resposta.data.nProt,
        cStat: resposta.data.cStat,
        xMotivo: resposta.data.xMotivo,
        chave: resposta.data.chMDFe,
        dataProcessamento: resposta.data.dataProcessamento,
        xml: resposta.data.xml || undefined,
        pdfBase64: resposta.data.pdfBase64 || undefined,
        tipoOperacao: "cancelamento",
        id_tenant: user.id_tenant,
        id_empresa: user.id_empresa,
      });
    }

    // 11. Atualizar status do MDFe se cancelado
    if (isCancelado) {
      await updateMdfeStatusProtocoloChave(
        validatedData.mdfeId,
        "cancelado",
        undefined,
        undefined
      );
    }

    // 12. Retornar resultado padronizado
    if (isCancelado && resposta.data) {
      return NextResponse.json({
        success: true,
        message: "Cancelamento processado com sucesso",
        data: resposta.data,
        protocolo: infoResposta.protocolo || undefined,
        statusSefaz: infoResposta.statusSefaz || undefined,
      } satisfies CancelamentoSuccessResponse<CancelamentoRespostaMDFeData>);
    } else {
      return NextResponse.json({
        success: false,
        error: {
          code: "SEFAZ_REJECTION",
          message: infoResposta.erro || "Cancelamento rejeitado pela SEFAZ",
          details: resposta.data,
        },
      } satisfies CancelamentoErrorResponse);
    }
  } catch (error) {
    console.error("Erro no cancelamento do MDFe:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Dados de entrada inválidos",
            details: error.errors,
          },
        } satisfies CancelamentoErrorResponse,
        { status: 400 }
      );
    }

    // Handle timeout errors
    if (error instanceof Error && error?.name === "AbortError") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TIMEOUT_ERROR",
            message:
              "Timeout na comunicação com a SEFAZ. Tente novamente em alguns minutos.",
          },
        } satisfies CancelamentoErrorResponse,
        { status: 504 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Erro interno do servidor",
          details: error instanceof Error ? error.message : "Erro desconhecido",
        },
      } satisfies CancelamentoErrorResponse,
      { status: 500 }
    );
  }
}
