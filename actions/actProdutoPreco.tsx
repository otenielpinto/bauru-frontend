"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";
import { de } from "date-fns/locale";

/**
 * Interface para o item de log de preço
 */
interface ProdutoPrecoLogItem {
  id: string | number;
  preco: number;
}

/**
 * Interface para resposta da operação
 */
interface ProdutoPrecoLogResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Salva log de alteração de preços de produtos
 * @param items Array com os campos id e preco dos produtos
 * @returns Response com resultado da operação
 */
export async function saveProdutoPrecoLog(
  items: ProdutoPrecoLogItem[]
): Promise<ProdutoPrecoLogResponse> {
  try {
    const user = await getUser();
    if (!user?.id_tenant) {
      return {
        success: false,
        message: "Usuário não autenticado ou sem tenant associado",
        error: "UNAUTHORIZED",
      };
    }

    if (!items || items.length === 0) {
      return {
        success: false,
        message: "Nenhum item fornecido para gravar o log",
        error: "NO_ITEMS",
      };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Preparar os dados para inserção
    const currentDate = new Date();
    const logItems = items.map((item) => ({
      id: item.id,
      preco: item.preco,
      codigo: null,
      descricao: null,
      usuario_alteracao: user.codigo || user.email || "unknown",
      nome_usuario: user.name || user.email || "unknown",
      id_tenant: Number(user.id_tenant),
      id_empresa: user.id_empresa ? Number(user.id_empresa) : undefined,
      createdAt: currentDate,
      updatedAt: currentDate,
    }));

    // Inserir todos os itens de uma vez
    const result = await clientdb
      .collection("tmp_produto_log_preco")
      .insertMany(logItems);

    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: `${result.insertedCount} log(s) de preço salvos com sucesso`,
      data: {
        insertedCount: result.insertedCount,
        insertedIds: Object.values(result.insertedIds).map((id) =>
          id.toString()
        ),
      },
    };
  } catch (error) {
    console.error("Erro ao salvar log de preços:", error);
    return {
      success: false,
      message: "Erro ao salvar log de preços",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
