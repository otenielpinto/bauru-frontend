"use server";

import { TMongo } from "@/infra/mongoClient";
import { ObjectId } from "mongodb";
import { Motorista, MotoristaResponse } from "@/types/MotoristaTypes";
import { getUser } from "./actSession";
import { gen_id } from "./actGenerator";

/**
 * Get all drivers
 * @returns Response with array of drivers
 */
export async function getAllMotoristas(): Promise<MotoristaResponse> {
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
      id_tenant: Number(user.id_tenant),
    };

    // Add company filter if user has specific company access
    if (user.id_empresa) {
      query.id_empresa = Number(user.id_empresa);
    }

    const motoristas = await clientdb
      .collection("mdfe_motorista")
      .find(query)
      .toArray();
    await TMongo.mongoDisconnect(client);

    // Serialize MongoDB documents for Client Components
    const serializedMotoristas = motoristas.map((motorista) => ({
      ...motorista,
      _id: motorista._id.toString(),
    }));

    return {
      success: true,
      message: "Motoristas encontrados com sucesso",
      data: serializedMotoristas as Motorista[],
    };
  } catch (error) {
    console.error("Erro ao buscar motoristas:", error);
    return {
      success: false,
      message: "Erro ao buscar motoristas",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get driver by ID
 * @param id Driver ID
 * @returns Response with driver object
 */
export async function getMotoristaById(id: number): Promise<MotoristaResponse> {
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
      id: Number(id),
      id_tenant: Number(user.id_tenant),
    };

    // Add company filter if user has specific company access
    if (user.id_empresa) {
      query.id_empresa = Number(user.id_empresa);
    }

    const motorista = await clientdb
      .collection("mdfe_motorista")
      .findOne(query);
    await TMongo.mongoDisconnect(client);

    if (!motorista) {
      return {
        success: false,
        message: "Motorista não encontrado",
        data: null,
      };
    }

    // Serialize MongoDB document for Client Components
    const serializedMotorista = {
      ...motorista,
      _id: motorista._id.toString(),
    };

    return {
      success: true,
      message: "Motorista encontrado com sucesso",
      data: serializedMotorista as Motorista,
    };
  } catch (error) {
    console.error(`Erro ao buscar motorista com ID ${id}:`, error);
    return {
      success: false,
      message: "Erro ao buscar motorista",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get driver by MongoDB ObjectId
 * @param id MongoDB ObjectId
 * @returns Response with driver object
 */
export async function getMotoristaByObjectId(
  id: string
): Promise<MotoristaResponse> {
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
      _id: new ObjectId(id),
      id_tenant: Number(user.id_tenant),
    };

    // Add company filter if user has specific company access
    if (user.id_empresa) {
      query.id_empresa = Number(user.id_empresa);
    }

    const motorista = await clientdb
      .collection("mdfe_motorista")
      .findOne(query);
    await TMongo.mongoDisconnect(client);

    if (!motorista) {
      return {
        success: false,
        message: "Motorista não encontrado",
        data: null,
      };
    }

    // Serialize MongoDB document for Client Components
    const serializedMotorista = {
      ...motorista,
      _id: motorista._id.toString(),
    };

    return {
      success: true,
      message: "Motorista encontrado com sucesso",
      data: serializedMotorista as Motorista,
    };
  } catch (error) {
    console.error(`Erro ao buscar motorista com ObjectId ${id}:`, error);
    return {
      success: false,
      message: "Erro ao buscar motorista",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get driver by cpf
 * @param cpf cpf number
 * @returns Response with driver object
 */
export async function getMotoristaBycpf(
  cpf: string
): Promise<MotoristaResponse> {
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
      cpf: cpf,
      id_tenant: Number(user.id_tenant),
    };

    // Add company filter if user has specific company access
    if (user.id_empresa) {
      query.id_empresa = Number(user.id_empresa);
    }

    const motorista = await clientdb
      .collection("mdfe_motorista")
      .findOne(query);
    await TMongo.mongoDisconnect(client);

    if (!motorista) {
      return {
        success: false,
        message: "Motorista não encontrado",
        data: null,
      };
    }

    // Serialize MongoDB document for Client Components
    const serializedMotorista = {
      ...motorista,
      _id: motorista._id.toString(),
    };

    return {
      success: true,
      message: "Motorista encontrado com sucesso",
      data: serializedMotorista as Motorista,
    };
  } catch (error) {
    console.error(`Erro ao buscar motorista com cpf ${cpf}:`, error);
    return {
      success: false,
      message: "Erro ao buscar motorista",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Create a new driver
 * @param data Driver data
 * @returns Response with created driver
 */
export async function createMotorista(
  data: Motorista
): Promise<MotoristaResponse> {
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

    // Validate required fields
    if (!data.xNome || !data.cpf) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "Nome e cpf são obrigatórios",
        error: "MISSING_REQUIRED_FIELDS",
      };
    }

    // Check if ID already exists within the tenant
    if (data.id) {
      const existingMotorista = await clientdb
        .collection("mdfe_motorista")
        .findOne({
          id: Number(data.id),
          id_tenant: Number(user.id_tenant),
          id_empresa: Number(user.id_empresa),
        });

      if (existingMotorista) {
        await TMongo.mongoDisconnect(client);
        return {
          success: false,
          message: "Já existe um motorista com este ID",
          error: "ID_ALREADY_EXISTS",
        };
      }
    }

    // Check if cpf already exists within the tenant
    const existingMotorista = await clientdb
      .collection("mdfe_motorista")
      .findOne({
        cpf: data.cpf,
        id_tenant: Number(user.id_tenant),
      });

    if (existingMotorista) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "Já existe um motorista com este cpf",
        error: "cpf_ALREADY_EXISTS",
      };
    }
    let row = await gen_id("mdfe_motorista");
    data.id = row.data as number;

    // Add timestamps and tenant/company information
    const dataWithMetadata = {
      ...data,
      id_tenant: Number(user.id_tenant),
      id_empresa: user.id_empresa ? Number(user.id_empresa) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await clientdb
      .collection("mdfe_motorista")
      .insertOne(dataWithMetadata);
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "Motorista criado com sucesso",
      data: {
        ...dataWithMetadata,
        _id: result.insertedId,
      } as Motorista,
    };
  } catch (error) {
    console.error("Erro ao criar motorista:", error);
    return {
      success: false,
      message: "Erro ao criar motorista",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Update an existing driver
 * @param id Driver ID
 * @param data Updated driver data
 * @returns Response with update result
 */
export async function updateMotorista(
  id: number,
  data: Partial<Motorista>
): Promise<MotoristaResponse> {
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
      id: Number(id),
      id_tenant: Number(user.id_tenant),
    };

    // Add company filter if user has specific company access
    if (user.id_empresa) {
      query.id_empresa = Number(user.id_empresa);
    }

    // Check if driver exists within the user's scope
    const existingMotorista = await clientdb
      .collection("mdfe_motorista")
      .findOne(query);

    if (!existingMotorista) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "Motorista não encontrado",
        error: "MOTORISTA_NOT_FOUND",
      };
    }

    // Add updated timestamp
    const dataWithTimestamp = {
      ...data,
      updatedAt: new Date(),
    };

    await clientdb
      .collection("mdfe_motorista")
      .updateOne(query, { $set: dataWithTimestamp });
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "Motorista atualizado com sucesso",
      data: {
        ...existingMotorista,
        ...dataWithTimestamp,
      } as Motorista,
    };
  } catch (error) {
    console.error(`Erro ao atualizar motorista com ID ${id}:`, error);
    return {
      success: false,
      message: "Erro ao atualizar motorista",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Update a driver by MongoDB ObjectId
 * @param id MongoDB ObjectId
 * @param data Updated driver data
 * @returns Response with update result
 */
export async function updateMotoristaByObjectId(
  id: string,
  data: Partial<Motorista>
): Promise<MotoristaResponse> {
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
      _id: new ObjectId(id),
      id_tenant: Number(user.id_tenant),
    };

    // Add company filter if user has specific company access
    if (user.id_empresa) {
      query.id_empresa = Number(user.id_empresa);
    }

    // Check if driver exists within the user's scope
    const existingMotorista = await clientdb
      .collection("mdfe_motorista")
      .findOne(query);

    if (!existingMotorista) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "Motorista não encontrado",
        error: "MOTORISTA_NOT_FOUND",
      };
    }

    // Add updated timestamp
    const dataWithTimestamp = {
      ...data,
      updatedAt: new Date(),
    };

    await clientdb
      .collection("mdfe_motorista")
      .updateOne(query, { $set: dataWithTimestamp });
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "Motorista atualizado com sucesso",
      data: {
        ...existingMotorista,
        ...dataWithTimestamp,
      } as Motorista,
    };
  } catch (error) {
    console.error(`Erro ao atualizar motorista com ObjectId ${id}:`, error);
    return {
      success: false,
      message: "Erro ao atualizar motorista",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Delete a driver
 * @param id Driver ID
 * @returns Response with delete result
 */
export async function deleteMotorista(id: number): Promise<MotoristaResponse> {
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
      id: Number(id),
      id_tenant: Number(user.id_tenant),
    };

    // Add company filter if user has specific company access
    if (user.id_empresa) {
      query.id_empresa = Number(user.id_empresa);
    }

    // Check if driver exists within the user's scope
    const existingMotorista = await clientdb
      .collection("mdfe_motorista")
      .findOne(query);

    if (!existingMotorista) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "Motorista não encontrado",
        error: "MOTORISTA_NOT_FOUND",
      };
    }

    await clientdb.collection("mdfe_motorista").deleteOne(query);
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "Motorista excluído com sucesso",
      data: existingMotorista as Motorista,
    };
  } catch (error) {
    console.error(`Erro ao excluir motorista com ID ${id}:`, error);
    return {
      success: false,
      message: "Erro ao excluir motorista",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Delete a driver by MongoDB ObjectId
 * @param id MongoDB ObjectId
 * @returns Response with delete result
 */
export async function deleteMotoristaByObjectId(
  id: string
): Promise<MotoristaResponse> {
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
      _id: new ObjectId(id),
      id_tenant: Number(user.id_tenant),
    };

    // Add company filter if user has specific company access
    if (user.id_empresa) {
      query.id_empresa = Number(user.id_empresa);
    }

    // Check if driver exists within the user's scope
    const existingMotorista = await clientdb
      .collection("mdfe_motorista")
      .findOne(query);

    if (!existingMotorista) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "Motorista não encontrado",
        error: "MOTORISTA_NOT_FOUND",
      };
    }

    await clientdb.collection("mdfe_motorista").deleteOne(query);
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "Motorista excluído com sucesso",
      data: existingMotorista as Motorista,
    };
  } catch (error) {
    console.error(`Erro ao excluir motorista com ObjectId ${id}:`, error);
    return {
      success: false,
      message: "Erro ao excluir motorista",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
