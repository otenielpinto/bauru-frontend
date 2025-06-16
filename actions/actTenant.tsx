"use server";

import { TMongo } from "@/infra/mongoClient";
import { ObjectId } from "mongodb";
import {
  Tenant,
  TenantResponse,
  CreateTenantData,
  UpdateTenantData,
  TenantFilter,
  TenantStatus,
} from "@/types/TenantTypes";
import { gen_id } from "./actGenerator";

const COLLECTION_NAME = "tenant";

/**
 * Create a new tenant
 */
export async function createTenant(
  data: CreateTenantData
): Promise<TenantResponse> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Set default status if not provided
    const tenantData: Tenant = {
      ...data,
      status: data.status || TenantStatus.ATIVO,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await clientdb
      .collection(COLLECTION_NAME)
      .insertOne(tenantData);

    await TMongo.mongoDisconnect(client);

    if (result.insertedId) {
      return {
        success: true,
        message: "Tenant criado com sucesso",
        data: { ...tenantData, _id: result.insertedId },
      };
    }

    return {
      success: false,
      message: "Erro ao criar tenant",
      error: "Falha na inserção",
    };
  } catch (error) {
    console.error("Error creating tenant:", error);
    return {
      success: false,
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get tenant by ID
 */
export async function getTenantById(id: string): Promise<TenantResponse> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    if (!ObjectId.isValid(id)) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "ID inválido",
        error: "O ID fornecido não é válido",
      };
    }

    const tenant = await clientdb
      .collection(COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });

    await TMongo.mongoDisconnect(client);

    if (tenant) {
      // Serialize MongoDB document for Client Components
      const serializedTenant = {
        ...tenant,
        _id: tenant._id.toString(),
      };

      return {
        success: true,
        message: "Tenant encontrado",
        data: serializedTenant as Tenant,
      };
    }

    return {
      success: false,
      message: "Tenant não encontrado",
      error: "Nenhum tenant encontrado com o ID fornecido",
    };
  } catch (error) {
    console.error("Error getting tenant by ID:", error);
    return {
      success: false,
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get all tenants with optional filtering
 */
export async function getTenants(
  filter?: TenantFilter
): Promise<TenantResponse> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Build query based on filter
    const query: any = {};

    if (filter) {
      if (filter.name) {
        query.name = { $regex: filter.name, $options: "i" };
      }
      if (filter.domain) {
        query.domain = { $regex: filter.domain, $options: "i" };
      }
      if (filter.status) {
        query.status = filter.status;
      }
      if (filter.plan_id) {
        query.plan_id = filter.plan_id;
      }
      if (filter.created_at) {
        query.created_at = {};
        if (filter.created_at.from) {
          query.created_at.$gte = filter.created_at.from;
        }
        if (filter.created_at.to) {
          query.created_at.$lte = filter.created_at.to;
        }
      }
    }

    const tenants = await clientdb
      .collection(COLLECTION_NAME)
      .find(query)
      .sort({ created_at: -1 })
      .toArray();

    await TMongo.mongoDisconnect(client);

    // Serialize MongoDB documents for Client Components
    const serializedTenants = tenants.map((tenant) => ({
      ...tenant,
      _id: tenant._id.toString(),
    }));

    return {
      success: true,
      message: `${tenants.length} tenant(s) encontrado(s)`,
      data: serializedTenants as Tenant[],
    };
  } catch (error) {
    console.error("Error getting tenants:", error);
    return {
      success: false,
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Update tenant by ID
 */
export async function updateTenant(
  id: string,
  data: UpdateTenantData
): Promise<TenantResponse> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    if (!ObjectId.isValid(id)) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "ID inválido",
        error: "O ID fornecido não é válido",
      };
    }

    const updateData = {
      ...data,
      updated_at: new Date(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const result = await clientdb
      .collection(COLLECTION_NAME)
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "Tenant não encontrado",
        error: "Nenhum tenant encontrado com o ID fornecido",
      };
    }

    // Get updated tenant
    const updatedTenant = await clientdb
      .collection(COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });

    await TMongo.mongoDisconnect(client);

    // Serialize MongoDB document for Client Components
    const serializedTenant = updatedTenant
      ? {
          ...updatedTenant,
          _id: updatedTenant._id.toString(),
        }
      : null;

    return {
      success: true,
      message: "Tenant atualizado com sucesso",
      data: serializedTenant as Tenant,
    };
  } catch (error) {
    console.error("Error updating tenant:", error);
    return {
      success: false,
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Delete tenant by ID
 */
export async function deleteTenant(id: string): Promise<TenantResponse> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    if (!ObjectId.isValid(id)) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "ID inválido",
        error: "O ID fornecido não é válido",
      };
    }

    // Get tenant before deletion to return in response
    const tenant = await clientdb
      .collection(COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });

    if (!tenant) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "Tenant não encontrado",
        error: "Nenhum tenant encontrado com o ID fornecido",
      };
    }

    const result = await clientdb
      .collection(COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(id) });

    await TMongo.mongoDisconnect(client);

    if (result.deletedCount > 0) {
      return {
        success: true,
        message: "Tenant excluído com sucesso",
        data: tenant as Tenant,
      };
    }

    return {
      success: false,
      message: "Erro ao excluir tenant",
      error: "Falha na exclusão",
    };
  } catch (error) {
    console.error("Error deleting tenant:", error);
    return {
      success: false,
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get tenant by domain
 */
export async function getTenantByDomain(
  domain: string
): Promise<TenantResponse> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    const tenant = await clientdb
      .collection(COLLECTION_NAME)
      .findOne({ domain: domain });

    await TMongo.mongoDisconnect(client);

    if (tenant) {
      // Serialize MongoDB document for Client Components
      const serializedTenant = {
        ...tenant,
        _id: tenant._id.toString(),
      };

      return {
        success: true,
        message: "Tenant encontrado",
        data: serializedTenant as Tenant,
      };
    }

    return {
      success: false,
      message: "Tenant não encontrado",
      error: "Nenhum tenant encontrado com o domínio fornecido",
    };
  } catch (error) {
    console.error("Error getting tenant by domain:", error);
    return {
      success: false,
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Update tenant status
 */
export async function updateTenantStatus(
  id: string,
  status: TenantStatus
): Promise<TenantResponse> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    if (!ObjectId.isValid(id)) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "ID inválido",
        error: "O ID fornecido não é válido",
      };
    }

    const result = await clientdb.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: status,
          updated_at: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "Tenant não encontrado",
        error: "Nenhum tenant encontrado com o ID fornecido",
      };
    }

    // Get updated tenant
    const updatedTenant = await clientdb
      .collection(COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });

    await TMongo.mongoDisconnect(client);

    // Serialize MongoDB document for Client Components
    const serializedTenant = updatedTenant
      ? {
          ...updatedTenant,
          _id: updatedTenant._id.toString(),
        }
      : null;

    return {
      success: true,
      message: "Status do tenant atualizado com sucesso",
      data: serializedTenant as Tenant,
    };
  } catch (error) {
    console.error("Error updating tenant status:", error);
    return {
      success: false,
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function autoCreateTenant() {
  const row = await gen_id(COLLECTION_NAME);
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const tenantData: Tenant = {
      id: Number(row.data),
      name: "Tenant Padrão",
      domain: "app.tenant.com",
      plan_id: "",
      status: TenantStatus.ATIVO,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await clientdb
      .collection(COLLECTION_NAME)
      .insertOne(tenantData);

    if (result.insertedId) {
      console.log("Tenant padrão criado com sucesso");
    } else {
      console.error("Erro ao criar tenant padrão");
    }
  } catch (error) {
    console.error("Erro ao criar tenant padrão:", error);
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}
