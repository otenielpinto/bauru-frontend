"use server";

import { TMongo } from "@/infra/mongoClient";
import { ObjectId } from "mongodb";
import {
  MdfeEmitente,
  MdfeEmitenteSingleResponse,
  MdfeEmitenteArrayResponse,
} from "@/types/MdfeEmitenteTypes";
import { getUser } from "@/actions/actSession";
import { getMunicipioByUfAndDescricao } from "@/actions/actMunicipio";
import { gen_id } from "@/actions/actGenerator";

/**
 * Get MDF-e emitente by ID
 * @param id Emitente ID
 * @returns Response with MDF-e emitente object
 */
export async function getMdfeEmitenteById(
  id: number
): Promise<MdfeEmitenteSingleResponse> {
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
    const emitente = await clientdb.collection("mdfe_emitente").findOne({
      id: Number(id),
      id_tenant: Number(user.id_tenant),
    });
    await TMongo.mongoDisconnect(client);

    if (!emitente) {
      return {
        success: false,
        message: "Emitente não encontrado",
        data: null,
      };
    }

    // Serialize MongoDB document for Client Components
    const serializedEmitente = {
      ...emitente,
      _id: emitente._id.toString(),
    };

    return {
      success: true,
      message: "Emitente encontrado com sucesso",
      data: serializedEmitente as unknown as MdfeEmitente,
    };
  } catch (error) {
    console.error(`Erro ao buscar emitente com ID ${id}:`, error);
    return {
      success: false,
      message: "Erro ao buscar emitente",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get MDF-e emitente by MongoDB ObjectId
 * @param id MongoDB ObjectId
 * @returns Response with MDF-e emitente object
 */
export async function getMdfeEmitenteByObjectId(
  id: string
): Promise<MdfeEmitenteSingleResponse> {
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
    const emitente = await clientdb.collection("mdfe_emitente").findOne({
      _id: new ObjectId(id),
      id_tenant: Number(user.id_tenant),
    });
    await TMongo.mongoDisconnect(client);

    if (!emitente) {
      return {
        success: false,
        message: "Emitente não encontrado",
        data: null,
      };
    }

    // Serialize MongoDB document for Client Components
    const serializedEmitente = {
      ...emitente,
      _id: emitente._id.toString(),
    };

    return {
      success: true,
      message: "Emitente encontrado com sucesso",
      data: serializedEmitente as unknown as MdfeEmitente,
    };
  } catch (error) {
    console.error(`Erro ao buscar emitente com ObjectId ${id}:`, error);
    return {
      success: false,
      message: "Erro ao buscar emitente",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get all MDF-e emitentes
 * @returns Response with array of MDF-e emitentes
 */
export async function getAllMdfeEmitentes(): Promise<MdfeEmitenteArrayResponse> {
  try {
    const user = await getUser();

    if (!user?.id_tenant) {
      return {
        success: false,
        message:
          "Usuário não autenticado ou sem tenant associado" +
          JSON.stringify(user),
        error: "UNAUTHORIZED",
      };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const emitentes = await clientdb
      .collection("mdfe_emitente")
      .find({
        id_tenant: Number(user.id_tenant),
        empresa: Number(user.id_empresa),
      })
      .toArray();
    await TMongo.mongoDisconnect(client);

    // Serialize MongoDB documents for Client Components
    const serializedEmitentes = emitentes.map((emitente) => ({
      ...emitente,
      _id: emitente._id.toString(),
    }));

    return {
      success: true,
      message: "Emitentes encontrados com sucesso",
      data: serializedEmitentes,
    };
  } catch (error) {
    console.error("Erro ao buscar emitentes:", error);
    return {
      success: false,
      message: "Erro ao buscar emitentes",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Create a new MDF-e emitente
 * @param data Emitente data
 * @returns Response with created MDF-e emitente
 */
export async function createMdfeEmitente(
  data: MdfeEmitente
): Promise<MdfeEmitenteSingleResponse> {
  try {
    const user = await getUser();
    if (!user?.id_tenant) {
      return {
        success: false,
        message: "Usuário não autenticado ou sem tenant associado",
        error: "UNAUTHORIZED",
      };
    }

    if (data.id == null || Number.isNaN(Number(data.id))) {
      data.id = Number(await gen_id("mdfe_emitente"));
    }

    let row = await getMunicipioByUfAndDescricao(
      data?.uf || "RS",
      data?.nome_municipio || ""
    );
    data.codigo_municipio = row?.codigoIbge || 0;

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Check if ID already exists within the tenant
    if (data.id) {
      const existingEmitente = await clientdb
        .collection("mdfe_emitente")
        .findOne({
          id: Number(data.id),
          id_tenant: Number(user.id_tenant),
        });

      if (existingEmitente) {
        await TMongo.mongoDisconnect(client);
        return {
          success: false,
          message: "Já existe um emitente com este ID",
          error: "ID_ALREADY_EXISTS",
        };
      }
    }

    // Check if CNPJ already exists within the tenant
    if (data.cpfcnpj) {
      const existingEmitente = await clientdb
        .collection("mdfe_emitente")
        .findOne({
          cpfcnpj: data.cpfcnpj,
          id_tenant: Number(user.id_tenant),
        });

      if (existingEmitente) {
        await TMongo.mongoDisconnect(client);
        return {
          success: false,
          message: "Já existe um emitente com este CNPJ/CPF",
          error: "CNPJ_ALREADY_EXISTS",
        };
      }
    }

    // Add timestamps and tenant ID
    const dataWithTimestamps = {
      ...data,
      id_tenant: Number(user.id_tenant),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await clientdb
      .collection("mdfe_emitente")
      .insertOne(dataWithTimestamps);
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "Emitente criado com sucesso",
      data: {
        ...dataWithTimestamps,
        _id: result.insertedId,
      } as unknown as MdfeEmitente,
    };
  } catch (error) {
    console.error("Erro ao criar emitente:", error);
    return {
      success: false,
      message: "Erro ao criar emitente",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Update an existing MDF-e emitente
 * @param id Emitente ID
 * @param data Updated emitente data
 * @returns Response with update result
 */
export async function updateMdfeEmitente(
  id: number,
  data: Partial<MdfeEmitente>
): Promise<MdfeEmitenteSingleResponse> {
  let row = await getMunicipioByUfAndDescricao(
    data?.uf || "RS",
    data?.nome_municipio || ""
  );
  data.codigo_municipio = row?.codigoIbge || 0;

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Check if emitente exists
    const existingEmitente = await clientdb
      .collection("mdfe_emitente")
      .findOne({ id: Number(id) });

    if (!existingEmitente) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "Emitente não encontrado",
        error: "EMITENTE_NOT_FOUND",
      };
    }

    // Add updated timestamp
    const dataWithTimestamp = {
      ...data,
      updatedAt: new Date(),
    };

    await clientdb
      .collection("mdfe_emitente")
      .updateOne({ id: Number(id) }, { $set: dataWithTimestamp });
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "Emitente atualizado com sucesso",
      data: {
        ...existingEmitente,
        ...dataWithTimestamp,
      } as unknown as MdfeEmitente,
    };
  } catch (error) {
    console.error(`Erro ao atualizar emitente com ID ${id}:`, error);
    return {
      success: false,
      message: "Erro ao atualizar emitente",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Update an MDF-e emitente by MongoDB ObjectId
 * @param id MongoDB ObjectId
 * @param data Updated emitente data
 * @returns Response with update result
 */
export async function updateMdfeEmitenteByObjectId(
  id: string,
  data: Partial<MdfeEmitente>
): Promise<MdfeEmitenteSingleResponse> {
  let row = await getMunicipioByUfAndDescricao(
    data?.uf || "RS",
    data?.nome_municipio || ""
  );
  data.codigo_municipio = row?.codigoIbge || 0;

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Check if emitente exists
    const existingEmitente = await clientdb
      .collection("mdfe_emitente")
      .findOne({ _id: new ObjectId(id) });

    if (!existingEmitente) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "Emitente não encontrado",
        error: "EMITENTE_NOT_FOUND",
      };
    }

    // Add updated timestamp
    const dataWithTimestamp = {
      ...data,
      updatedAt: new Date(),
    };

    await clientdb
      .collection("mdfe_emitente")
      .updateOne({ _id: new ObjectId(id) }, { $set: dataWithTimestamp });
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "Emitente atualizado com sucesso",
      data: {
        ...existingEmitente,
        ...dataWithTimestamp,
      } as unknown as MdfeEmitente,
    };
  } catch (error) {
    console.error(`Erro ao atualizar emitente com ObjectId ${id}:`, error);
    return {
      success: false,
      message: "Erro ao atualizar emitente",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Delete an MDF-e emitente
 * @param id Emitente ID
 * @returns Response with delete result
 */
export async function deleteMdfeEmitente(
  id: number
): Promise<MdfeEmitenteSingleResponse> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Check if emitente exists
    const existingEmitente = await clientdb
      .collection("mdfe_emitente")
      .findOne({ id: Number(id) });

    if (!existingEmitente) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "Emitente não encontrado",
        error: "EMITENTE_NOT_FOUND",
      };
    }

    await clientdb.collection("mdfe_emitente").deleteOne({ id: Number(id) });
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "Emitente excluído com sucesso",
      data: existingEmitente as unknown as MdfeEmitente,
    };
  } catch (error) {
    console.error(`Erro ao excluir emitente com ID ${id}:`, error);
    return {
      success: false,
      message: "Erro ao excluir emitente",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Delete an MDF-e emitente by MongoDB ObjectId
 * @param id MongoDB ObjectId
 * @returns Response with delete result
 */
export async function deleteMdfeEmitenteByObjectId(
  id: string
): Promise<MdfeEmitenteSingleResponse> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Check if emitente exists
    const existingEmitente = await clientdb
      .collection("mdfe_emitente")
      .findOne({ _id: new ObjectId(id) });

    if (!existingEmitente) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "Emitente não encontrado",
        error: "EMITENTE_NOT_FOUND",
      };
    }

    await clientdb
      .collection("mdfe_emitente")
      .deleteOne({ _id: new ObjectId(id) });
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "Emitente excluído com sucesso",
      data: existingEmitente as unknown as MdfeEmitente,
    };
  } catch (error) {
    console.error(`Erro ao excluir emitente com ObjectId ${id}:`, error);
    return {
      success: false,
      message: "Erro ao excluir emitente",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get MDF-e emitente by CNPJ
 * @param cnpj CNPJ number
 * @returns Response with MDF-e emitente object
 */
export async function getMdfeEmitenteByCnpj(
  cnpj: string
): Promise<MdfeEmitenteSingleResponse> {
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
    const emitente = await clientdb.collection("mdfe_emitente").findOne({
      cpfcnpj: cnpj,
      id_tenant: Number(user.id_tenant),
    });
    await TMongo.mongoDisconnect(client);

    if (!emitente) {
      return {
        success: false,
        message: "Emitente não encontrado",
        data: null,
      };
    }

    // Serialize MongoDB document for Client Components
    const serializedEmitente = {
      ...emitente,
      _id: emitente._id.toString(),
    };

    return {
      success: true,
      message: "Emitente encontrado com sucesso",
      data: serializedEmitente as unknown as MdfeEmitente,
    };
  } catch (error) {
    console.error(`Erro ao buscar emitente com CNPJ ${cnpj}:`, error);
    return {
      success: false,
      message: "Erro ao buscar emitente",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get MDF-e emitente related to current user's company
 * @returns Response with MDF-e emitente object related to user's company
 */
export async function getMdfeEmitenteByUserCompany(): Promise<MdfeEmitenteSingleResponse> {
  try {
    const user = await getUser();
    if (!user?.id_tenant) {
      return {
        success: false,
        message: "Usuário não autenticado ou sem tenant associado",
        error: "UNAUTHORIZED",
      };
    }

    if (!user?.id_empresa) {
      return {
        success: false,
        message: "Usuário não possui empresa associada",
        error: "NO_COMPANY_ASSOCIATED",
      };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const emitente = await clientdb.collection("mdfe_emitente").findOne({
      empresa: Number(user.id_empresa),
      id_tenant: Number(user.id_tenant),
    });
    await TMongo.mongoDisconnect(client);

    if (!emitente) {
      return {
        success: false,
        message: "Emitente não encontrado para a empresa do usuário",
        data: null,
      };
    }

    // Serialize MongoDB document for Client Components
    const serializedEmitente = {
      ...emitente,
      _id: emitente._id.toString(),
    };

    return {
      success: true,
      message: "Emitente da empresa do usuário encontrado com sucesso",
      data: serializedEmitente as unknown as MdfeEmitente,
    };
  } catch (error) {
    console.error("Erro ao buscar emitente da empresa do usuário:", error);
    return {
      success: false,
      message: "Erro ao buscar emitente da empresa do usuário",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get MDF-e emitente by company ID
 * @param empresaId Company ID
 * @returns Response with array of MDF-e emitentes
 */
export async function getMdfeEmitentesByEmpresa(
  empresaId: number
): Promise<MdfeEmitenteSingleResponse> {
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
    const emitente: any =
      (await clientdb.collection("mdfe_emitente").findOne({
        empresa: Number(empresaId),
        id_tenant: Number(user.id_tenant),
      })) || null;

    await TMongo.mongoDisconnect(client);
    if (emitente) {
      emitente._id = emitente._id.toString();
    }

    const serializedEmitentes = emitente
      ? {
          ...emitente,
        }
      : null;

    if (!serializedEmitentes) {
      return {
        success: false,
        message: "Emitente não encontrado",
        data: null,
      };
    }

    return {
      success: true,
      message: "Emitentes encontrados com sucesso",
      data: serializedEmitentes as unknown as MdfeEmitente,
    };
  } catch (error) {
    console.error(`Erro ao buscar emitentes da empresa ${empresaId}:`, error);
    return {
      success: false,
      message: "Erro ao buscar emitentes",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get MDF-e emitentes by UF (state)
 * @param uf State code (UF)
 * @returns Response with array of MDF-e emitentes
 */
export async function getMdfeEmitentesByUf(
  uf: string
): Promise<MdfeEmitenteArrayResponse> {
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
    const emitentes = await clientdb
      .collection("mdfe_emitente")
      .find({ uf: uf.toUpperCase(), id_tenant: Number(user.id_tenant) })
      .toArray();
    await TMongo.mongoDisconnect(client);

    // Serialize MongoDB documents for Client Components
    const serializedEmitentes = emitentes.map((emitente) => ({
      ...emitente,
      _id: emitente._id.toString(),
    }));

    return {
      success: true,
      message: "Emitentes encontrados com sucesso",
      data: serializedEmitentes as unknown as MdfeEmitente[],
    };
  } catch (error) {
    console.error(`Erro ao buscar emitentes do estado ${uf}:`, error);
    return {
      success: false,
      message: "Erro ao buscar emitentes",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
