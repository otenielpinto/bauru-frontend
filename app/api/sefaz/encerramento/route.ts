import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/actions/actSession";
import {
  getMdfeById,
  updateMdfeStatusProtocoloChave,
} from "@/actions/actMdfeEnvio";
import { saveMdfeEvento } from "@/actions/actMdfeEvento";
import { saveMdfeRetorno } from "@/actions/actMdfeRetorno";

import {
  EncerrarMdfeSchema,
  getUFCode,
  canEncerrarMdfe,
  type EncerrarMdfeRequest,
  type SefazEncerraResponse,
} from "@/types/MdfeEncerramentoTypes";
import { z } from "zod";

/**
 * POST /api/sefaz/encerramento
 * Encerra um MDFe autorizado na SEFAZ
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Verificar autenticação
    const user = await getUser();
    if (!user?.id_tenant) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    // 2. Validar entrada com Zod
    const body = await request.json();
    const validatedData = EncerrarMdfeSchema.parse(body);

    // 3. Buscar e validar MDFe
    const mdfeResponse = await getMdfeById(validatedData.mdfeId);
    if (!mdfeResponse.success || !mdfeResponse.data) {
      return NextResponse.json(
        { error: "MDFe não encontrado" },
        { status: 404 }
      );
    }
    const mdfe = mdfeResponse.data;

    // 4. Validações de negócio
    const validation = canEncerrarMdfe(mdfe.status, mdfe.dataHoraAutorizacao);
    if (!validation.canEncerrar) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    // Verificar se possui protocolo de autorização
    if (!mdfe.protocolo) {
      return NextResponse.json(
        { error: "MDFe não possui protocolo de autorização" },
        { status: 400 }
      );
    }

    // Verificar se possui chave de acesso
    if (!mdfe.chave) {
      return NextResponse.json(
        { error: "MDFe não possui chave de acesso" },
        { status: 400 }
      );
    }

    // 5. Preparar payload SEFAZ
    const dataEncerramento =
      validatedData.dataEncerramento || new Date().toISOString();
    const payload = {
      mdfe: mdfe,
      evento: {
        chave: mdfe.chave,
        tpEvento: "110112" as const,
        nSeqEvento: 1,
        nProt: mdfe.protocolo,
        cUFEncerramento: getUFCode(validatedData.ufEncerramento),
        cMunEncerramento: validatedData.codigoMunicipio,
        dtEncerramento: dataEncerramento,
      },
    };

    // 6. Enviar para SEFAZ
    const sefazApiUrl =
      process.env.MDFE_API_URL || "http://192.168.3.160:9000/api/v1/mdfe";
    const sefazEndpoint = `${sefazApiUrl}/evento/encerramento`;

    const sefazResponse = await fetch(sefazEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MDFE_TOKEN || ""}`,
        "User-Agent": "MDFe-SaaS-Front/1.0",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000), // 30 seconds timeout
    });

    if (!sefazResponse.ok) {
      console.error(
        "Erro na resposta da SEFAZ:",
        sefazResponse.status,
        sefazResponse.statusText
      );

      let errorMessage = "Erro na comunicação com a SEFAZ";
      try {
        const errorData = await sefazResponse.json();
        errorMessage = errorData?.message || errorData?.error || errorMessage;
      } catch (parseError) {
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

    const result: SefazEncerraResponse = await sefazResponse.json();

    // 7. Validar estrutura da resposta
    if (!result.data) {
      console.error("Resposta inválida da SEFAZ:", result);
      return NextResponse.json(
        { error: "Resposta inválida da SEFAZ" },
        { status: 502 }
      );
    }

    // Salvar evento de encerramento
    await saveMdfeEvento({
      mdfeId: validatedData.mdfeId,
      chave: result.data.chave,
      tpEvento: "110112",
      nSeqEvento: 1,
      tipoEvento: "encerramento",
      protocolo: result.data.protocolo,
      cStat: result.data.cStat,
      xMotivo: result.data.xMotivo,
      dhEvento: result.data.dataProcessamento,
      xml: result.data.xml,
      pdfBase64: result.data?.pdfBase64,
    });

    // Salvar retorno
    await saveMdfeRetorno({
      ...result.data,
      mdfeId: validatedData.mdfeId,
      tipoOperacao: "encerramento",
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa,
    });

    let isEncerrado = result.data.cStat === 135 || result.data.cStat === 631;

    // Atualizar status do MDFe para ENCERRADO
    if (isEncerrado) {
      // Código de encerramento autorizado
      await updateMdfeStatusProtocoloChave(
        validatedData.mdfeId,
        "encerrado",
        undefined,
        undefined
      );
    }

    // 9. Retornar resultado
    return NextResponse.json({
      success: isEncerrado,
      message: isEncerrado
        ? "Encerramento processado com sucesso"
        : "Encerramento rejeitado pela SEFAZ",
      data: result.data,
    });
  } catch (error) {
    console.error("Erro no encerramento do MDFe:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Dados de entrada inválidos",
          code: "VALIDATION_ERROR",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle timeout errors
    if (error instanceof Error && error?.name === "AbortError") {
      return NextResponse.json(
        {
          error:
            "Timeout na comunicação com a SEFAZ. Tente novamente em alguns minutos.",
          code: "TIMEOUT",
        },
        { status: 408 }
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
