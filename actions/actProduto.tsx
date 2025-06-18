"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";

/**
 * Product search filters interface
 */
interface ProdutoSearchFilters {
  codigo?: string;
  nome?: string;
  categoria1?: string;
  categoria2?: string;
  categoria3?: string;
  grade?: string[];
  sys_has_estrutura_produto?: boolean;
}

/**
 * Product search response interface
 */
interface ProdutoSearchResponse {
  success: boolean;
  message: string;
  data?: any[] | null;
  error?: string;
}

/**
 * Search products in tmp_produto_tiny collection with filters
 * @param filters Search filters object
 * @returns Response with products array
 */
export async function searchProdutos(
  filters: ProdutoSearchFilters = {}
): Promise<ProdutoSearchResponse> {
  try {
    const user = await getUser();
    if (!user?.id_tenant) {
      return {
        success: false,
        message: "Usuário não autenticado ou sem tenant associado",
        error: "UNAUTHORIZED",
      };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Build query with tenant filter and search filters
    const query: any = {
      id_tenant: Number(user.id_tenant),
    };

    // // Add company filter if user has specific company access
    // if (user.id_empresa) {
    //   query.id_empresa = Number(user.id_empresa);
    // }

    // Apply search filters
    if (filters.codigo) {
      query.codigo = filters.codigo;
    }

    if (filters.nome) {
      query.nome = { $regex: filters.nome, $options: "i" };
    }

    if (filters.categoria1) {
      query.categoria1 = filters.categoria1;
    }

    if (filters.categoria2) {
      query.categoria2 = filters.categoria2;
    }

    if (filters.categoria3) {
      query.categoria3 = filters.categoria3;
    }

    if (filters.grade && filters.grade.length > 0) {
      query.grade = { $in: filters.grade };
    }

    if (filters.sys_has_estrutura_produto == true) {
      query.sys_has_estrutura_produto = filters.sys_has_estrutura_produto
        ? 1
        : 0;
    }
    // console.log("Query:", query);

    const produtos = await clientdb
      .collection("tmp_produto_tiny")
      .find(query)
      .sort({ nome: 1 })
      .toArray();

    await TMongo.mongoDisconnect(client);

    // Serialize MongoDB documents for Client Components
    const serializedProdutos = produtos.map((produto) => ({
      ...produto,
      _id: produto._id.toString(),
    }));

    return {
      success: true,
      message: `${produtos.length} produto(s) encontrado(s)`,
      data: serializedProdutos,
    };
  } catch (error) {
    console.error("Error searching products:", error);
    return {
      success: false,
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get product by codigo
 * @param codigo Product code
 * @returns Response with product object
 */
export async function getProdutoByCodigo(
  codigo: string
): Promise<ProdutoSearchResponse> {
  try {
    const user = await getUser();
    if (!user?.id_tenant) {
      return {
        success: false,
        message: "Usuário não autenticado ou sem tenant associado",
        error: "UNAUTHORIZED",
      };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Build query with tenant and company filters
    const query: any = {
      codigo: codigo,
      id_tenant: Number(user.id_tenant),
    };

    // Add company filter if user has specific company access
    if (user.id_empresa) {
      query.id_empresa = Number(user.id_empresa);
    }

    const produto = await clientdb
      .collection("tmp_produto_tiny")
      .findOne(query);

    await TMongo.mongoDisconnect(client);

    if (!produto) {
      return {
        success: false,
        message: "Produto não encontrado",
        data: null,
      };
    }

    // Serialize MongoDB document for Client Components
    const serializedProduto = {
      ...produto,
      _id: produto._id.toString(),
    };

    return {
      success: true,
      message: "Produto encontrado",
      data: [serializedProduto],
    };
  } catch (error) {
    console.error("Error getting product by codigo:", error);
    return {
      success: false,
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
