import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/actions/actSession";
import { getProdutoPrecoHistorico } from "@/actions/actProdutoPreco";

/**
 * GET /api/tiny/historico
 * Busca o histórico de alterações de preços de um produto
 * Query parameters:
 * - codigo: Código do produto (obrigatório)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Verificar autenticação
    const user = await getUser();
    if (!user?.id_tenant) {
      return NextResponse.json(
        {
          error: "Usuário não autenticado",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    // 2. Obter parâmetros da URL
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get("codigo");

    // 3. Validar parâmetros obrigatórios
    if (!codigo) {
      return NextResponse.json(
        {
          error: "Parâmetro 'codigo' é obrigatório",
          code: "MISSING_CODIGO",
        },
        { status: 400 }
      );
    }

    // 4. Buscar histórico de preços
    const result = await getProdutoPrecoHistorico(codigo);

    // 5. Verificar se houve erro na busca
    if (!result.success) {
      const statusCode =
        result.error === "UNAUTHORIZED"
          ? 401
          : result.error === "NO_CODIGO"
          ? 400
          : 500;

      return NextResponse.json(
        {
          error: result.message,
          code: result.error || "UNKNOWN_ERROR",
        },
        { status: statusCode }
      );
    }

    // 6. Retornar dados de sucesso
    return NextResponse.json(
      {
        success: true,
        message: result.message,
        data: result.data || [],
        meta: {
          codigo: codigo,
          total_alteracoes: result.data?.length || 0,
          usuario: user.name || user.email,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro interno na busca de histórico de preços:", error);

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
