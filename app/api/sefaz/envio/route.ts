import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/actions/actSession";
import { saveMdfeRetorno } from "@/actions/actMdfeRetorno";
import {
  updateMdfeStatusProtocoloChave,
  getMdfeById,
} from "@/actions/actMdfeEnvio";
import { cStatusToMdfeStatus } from "@/types/MdfeEnvioTypes";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await getUser();
    if (!user?.id_tenant) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const { mdfeId } = await request.json();
    const mdfeData = await getMdfeById(mdfeId);

    if (!mdfeId || !mdfeData?.data) {
      return NextResponse.json(
        { error: "Dados do MDFe não fornecidos" },
        { status: 400 }
      );
    }

    // Preparar dados para envio à SEFAZ
    const sefazPayload = {
      ...mdfeData.data,
    };

    // Enviar para API da SEFAZ
    const sefazApiUrl =
      process.env.MDFE_API_URL || "http://192.168.3.160:9000/api/v1/mdfe";

    const sefazResponse = await fetch(sefazApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MDFE_TOKEN || ""}`,
        "User-Agent": "MDFe-SaaS-Front/1.0",
      },
      body: JSON.stringify(sefazPayload),
    });
    const result = await sefazResponse.json();

    //salvar retorno no banco de dados
    await saveMdfeRetorno({
      ...result?.data,
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa,
    });

    await updateMdfeStatusProtocoloChave(
      mdfeId,
      cStatusToMdfeStatus(result?.data?.cStat || 0),
      result?.data?.protocolo || undefined,
      result?.data?.chave || undefined
    );

    if (!sefazResponse.ok) {
      console.error(
        "Erro na resposta da SEFAZ:",
        sefazResponse?.status,
        sefazResponse?.statusText
      );

      let errorMessage = "Erro na comunicação com a SEFAZ";
      try {
        const errorData = await sefazResponse.json();
        errorMessage = errorData?.message || errorData?.error || errorMessage;
      } catch (e) {
        // Se não conseguir parsear o erro, usar mensagem padrão
      }

      return NextResponse.json(
        {
          error: errorMessage,
          status: sefazResponse.status,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: result?.data?.cStat === 100,
      message: result?.data?.xMotivo || "MDFe autorizado com sucesso",
      data: result?.data,
    });
  } catch (error) {
    console.error("Erro interno no envio para SEFAZ:", error);

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
