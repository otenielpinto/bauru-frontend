import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/actions/actSession";
import { getAllServices } from "@/actions/actService";

export async function GET(request: NextRequest) {
  try {
    // Verificar se o usuário está autenticado
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    // Buscar dados com filtro fixo
    const services = await getAllServices({
      name: "importarProdutoTinyDiario_ultimos_7dias",
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Erro ao buscar dados do serviço:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
