import { NextRequest, NextResponse } from "next/server";
//import { validateForm } from "@/utils/validateFormData";

const DESTINATION_API = "https://api-destino.exemplo.com/endpoint";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validação
    //const validatedData = validateForm(body);
    const validatedData = body; // Substitua pela sua função de validação

    // Encaminhamento para API de destino
    const apiResponse = await fetch(DESTINATION_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validatedData),
    });

    const responseData = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: responseData.message || "Erro na API de destino",
        },
        { status: apiResponse.status }
      );
    }

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
