"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";
import { lib } from "@/lib/lib";

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
    const rows = [];
    for (const item of items) {
      if (!item.id || !item.preco) {
        continue; // Pular itens inválidos
      }
      // Buscar o produto para obter sys_total_preco_custo e outras informações
      const produto = await clientdb.collection("tmp_produto_tiny").findOne(
        {
          id: String(item.id),
          id_tenant: user.id_tenant,
        },
        {
          projection: {
            codigo: 1,
            nome: 1,
            unidade: 1,
            preco: 1,
            preco_custo: 1,
            preco_custo_medio: 1,
            preco_promocional: 1,
            sys_total_preco_custo: 1,
            sys_margem_atual: 1,
            sys_markup_atual: 1,
          },
        }
      );

      let precoVenda = Number(item?.preco);
      let sys_markup_atual = 0;
      let sys_margem_atual = 0;

      sys_markup_atual = lib.round(precoVenda / produto?.sys_total_preco_custo);
      sys_margem_atual = lib.round(precoVenda - produto?.sys_total_preco_custo);

      rows.push({
        id: String(item.id),
        codigo: produto?.codigo || null,
        nome: produto?.nome || null,
        unidade: produto?.unidade || null,
        preco_custo: produto?.preco_custo || 0,
        preco_custo_medio: produto?.preco_custo_medio || 0,
        preco_promocional: produto?.preco_promocional || 0,
        sys_total_preco_custo: produto?.sys_total_preco_custo || 0,
        sys_margem_atual: produto?.sys_margem_atual,
        sys_markup_atual: produto?.sys_markup_atual,
        preco: Number(produto?.preco),
        novo_preco: Number(item.preco),
        novo_sys_markup_atual: sys_markup_atual,
        novo_sys_margem_atual: sys_margem_atual,
        usuario_alteracao: user.codigo || user.email || "unknown",
        nome_usuario: user.name || user.email || "unknown",
        id_tenant: Number(user.id_tenant),
        id_empresa: user.id_empresa ? Number(user.id_empresa) : undefined,
        createdAt: currentDate,
        updatedAt: currentDate,
      });
    }

    // Inserir todos os itens de uma vez
    const result = await clientdb
      .collection("tmp_produto_log_preco")
      .insertMany(rows);

    for (const row of rows) {
      await clientdb.collection("tmp_produto_tiny").updateOne(
        { id: String(row.id), id_tenant: row.id_tenant },
        {
          $set: {
            preco: row.novo_preco,
            sys_markup_atual: row.novo_sys_markup_atual,
            sys_margem_atual: row.novo_sys_margem_atual,
            updatedAt: currentDate,
          },
        }
      );
    }

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
