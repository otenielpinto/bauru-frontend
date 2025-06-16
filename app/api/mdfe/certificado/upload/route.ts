import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/actions/actSession";
import { getMdfeCertificadoByObjectId } from "@/actions/actMdfeCertificado";

/**
 * API endpoint to sync certificate with external SEFAZ server
 * POST /api/mdfe/certificado/upload
 */
export async function POST(req: NextRequest) {
  try {
    // Verify user authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Usuário não autenticado",
          error: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id } = body;

    // Validate required fields - only ID is needed
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Campo obrigatório: id",
          error: "MISSING_ID",
        },
        { status: 400 }
      );
    }

    // Get certificate data by ID
    const certificateResponse = await getMdfeCertificadoByObjectId(id);

    if (!certificateResponse.success || !certificateResponse.data) {
      return NextResponse.json(
        {
          success: false,
          message: "Certificado não encontrado",
          error: "CERTIFICATE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const certificate: any = certificateResponse.data;

    // Validate that certificate has all required data
    if (
      !certificate.cpfcnpj ||
      !certificate.senha ||
      !certificate.arquivoBase64
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Certificado não possui todos os dados necessários (cpfcnpj, senha, arquivoBase64)",
          error: "INCOMPLETE_CERTIFICATE_DATA",
        },
        { status: 400 }
      );
    }

    // Prepare certificate data for external API
    const certificateData = {
      id: certificate.id || certificate._id,
      cpfcnpj: certificate.cpfcnpj,
      senha: certificate.senha,
      arquivoBase64: certificate.arquivoBase64,
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa,
      sync_timestamp: new Date().toISOString(),
    };

    // Get the external API URL from environment variables
    const sefazApiUrl =
      process.env.MDFE_API_URL || "http://192.168.3.160:9000/api/v1/mdfe";

    // Call external SEFAZ API to sync certificate
    const sefazResponse = await fetch(`${sefazApiUrl}/certificado/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MDFE_TOKEN || ""}`,
        "User-Agent": "MDFe-SaaS-Front/1.0",
      },
      body: JSON.stringify(certificateData),
    });
    const result = await sefazResponse.json();

    if (!sefazResponse.ok) {
      console.error("SEFAZ API Error:", result);
      return NextResponse.json(
        {
          success: false,
          message:
            result.message || "Erro ao sincronizar certificado com SEFAZ",
          error: "SEFAZ_API_ERROR",
          details: result,
        },
        { status: sefazResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Certificado sincronizado com sucesso",
      data: {
        id: certificate.id || certificate._id,
        cpfcnpj: certificate.cpfcnpj,
        sync_status: "SUCCESS",
      },
    });
  } catch (error: any) {
    console.error("Certificate sync error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Erro interno ao sincronizar certificado",
        error: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS request for CORS
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}
