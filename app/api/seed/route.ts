import { NextRequest, NextResponse } from "next/server";
import { createAllMunicipios } from "@/actions/actMunicipio";
import { autoCreateEmpresa } from "@/actions/actEmpresa";
import { autoCreateTenant } from "@/actions/actTenant";

export async function GET(req: NextRequest) {
  try {
    //const responseData = await createAllMunicipios();
    //const empresaData = await autoCreateEmpresa();
    //const tenantData = await autoCreateTenant();
    const responseData = { success: true, date: new Date() };

    return NextResponse.json({ success: true, data: responseData });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Erro interno no servidor",
      },
      { status: 500 }
    );
  }
}
