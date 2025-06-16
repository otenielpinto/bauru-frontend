"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/actions/actSession";

/**
 * Interface para resposta da busca de MDFe Config
 */
export interface MdfeConfigResponse {
  success: boolean;
  message: string;
  data?: any | any[] | null;
  error?: string;
}

/**
 * Buscar todas as configurações MDFe do usuário logado
 */
export async function getMdfeConfig(): Promise<MdfeConfigResponse> {
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

    // Construir query base com filtro por tenant
    const query: any = {
      id_tenant: Number(user.id_tenant),
      id_empresa: Number(user.id_empresa), // Filtrar por empresa do usuário
    };

    const config = await clientdb.collection("mdfe_config").findOne(query);
    await TMongo.mongoDisconnect(client);

    // Serialize MongoDB document for Client Components
    const serializedConfig = config
      ? {
          ...config,
          _id: config._id.toString(),
        }
      : null;

    return {
      success: true,
      message: config
        ? "Configuração encontrada"
        : "Nenhuma configuração encontrada",
      data: serializedConfig,
    };
  } catch (error) {
    console.error("Error getting MDFe configs:", error);
    return {
      success: false,
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function saveMdfeConfig(data: any): Promise<MdfeConfigResponse> {
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
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const result = await clientdb.collection("mdfe_config").updateOne(
      {
        id_tenant: Number(user.id_tenant),
        id_empresa: Number(user.id_empresa),
      },
      { $set: updateData },
      { upsert: true } // Cria um novo documento se não existir
    );

    // Buscar configuração atualizada
    const updatedConfig = await clientdb.collection("mdfe_config").findOne({
      id_tenant: Number(user.id_tenant),
      id_empresa: Number(user.id_empresa),
    });

    await TMongo.mongoDisconnect(client);

    // Serialize MongoDB document for Client Components
    const serializedUpdatedConfig = updatedConfig
      ? {
          ...updatedConfig,
          _id: updatedConfig._id.toString(),
        }
      : null;

    return {
      success: true,
      message: "Configuração atualizada com sucesso",
      data: serializedUpdatedConfig,
    };
  } catch (error) {
    console.error("Error updating MDFe config:", error);
    return {
      success: false,
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Deletar configuração MDFe por ID
 */
export async function deleteMdfeConfig(): Promise<MdfeConfigResponse> {
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
    let config = await getMdfeConfig();

    if (!config) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "Configuração não encontrada",
        error: "Nenhuma configuração encontrada com o ID fornecido",
      };
    }

    const result = await clientdb.collection("mdfe_config").deleteOne({
      _id: config.data._id,
    });

    await TMongo.mongoDisconnect(client);

    if (result.deletedCount > 0) {
      return {
        success: true,
        message: "Configuração excluída com sucesso",
        data: config,
      };
    }

    return {
      success: false,
      message: "Erro ao excluir configuração",
      error: "Falha na exclusão",
    };
  } catch (error) {
    console.error("Error deleting MDFe config:", error);
    return {
      success: false,
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
