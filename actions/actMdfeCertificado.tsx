"use server";

import { TMongo } from "@/infra/mongoClient";
import { ObjectId } from "mongodb";
import {
  MdfeCertificado,
  MdfeCertificadoResponse,
} from "@/types/MdfeCertificadoTypes";
import { getUser } from "./actSession";
import { v4 as uuidv4 } from "uuid";

/**
 * Get all MDF-e certificates
 * @returns Response with array of MDF-e certificates
 */
export async function getAllMdfeCertificados(): Promise<MdfeCertificadoResponse> {
  try {
    const user: any = await getUser();
    if (!user) {
      return {
        success: false,
        message: "Usuário não autenticado",
        error: "UNAUTHORIZED",
      };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Build filter based on user permissions
    const filter: any = {};
    if (user.id_tenant) {
      filter.id_tenant = user.id_tenant;
    }
    if (user.emp_acesso && user.emp_acesso.length > 0) {
      filter.id_empresa = { $in: user.emp_acesso };
    }

    const certificados = await clientdb
      .collection("mdfe_certificado")
      .find(filter)
      .toArray();
    await TMongo.mongoDisconnect(client);

    // Don't return the binary data in the list view and serialize _id
    const certificadosSemArquivo = certificados.map((cert) => {
      const { arquivoBase64, ...certSemArquivo } = cert;
      return {
        ...certSemArquivo,
        _id: cert._id.toString(), // Convert ObjectId to string
      };
    });

    return {
      success: true,
      message: "Certificados encontrados com sucesso",
      data: certificadosSemArquivo as MdfeCertificado[],
    };
  } catch (error) {
    console.error("Erro ao buscar certificados:", error);
    return {
      success: false,
      message: "Erro ao buscar certificados",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get MDF-e certificate by ID
 * @param id Certificate ID
 * @returns Response with MDF-e certificate object
 */
export async function getMdfeCertificadoById(
  id: string
): Promise<MdfeCertificadoResponse> {
  try {
    const user: any = await getUser();
    if (!user) {
      return {
        success: false,
        message: "Usuário não autenticado",
        error: "UNAUTHORIZED",
      };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Build filter based on user permissions
    const filter: any = { id: id };
    if (user.id_tenant) {
      filter.id_tenant = user.id_tenant;
    }
    if (user.emp_acesso && user.emp_acesso.length > 0) {
      filter.id_empresa = { $in: user.emp_acesso };
    }

    const certificado = await clientdb
      .collection("mdfe_certificado")
      .findOne(filter);
    await TMongo.mongoDisconnect(client);

    if (!certificado) {
      return {
        success: false,
        message: "Certificado não encontrado",
        data: null,
      };
    }

    return {
      success: true,
      message: "Certificado encontrado com sucesso",
      data: certificado as MdfeCertificado,
    };
  } catch (error) {
    console.error(`Erro ao buscar certificado com ID ${id}:`, error);
    return {
      success: false,
      message: "Erro ao buscar certificado",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get MDF-e certificate by MongoDB ObjectId
 * @param id MongoDB ObjectId
 * @returns Response with MDF-e certificate object
 */
export async function getMdfeCertificadoByObjectId(
  id: string
): Promise<MdfeCertificadoResponse> {
  try {
    const user: any = await getUser();
    if (!user) {
      return {
        success: false,
        message: "Usuário não autenticado",
        error: "UNAUTHORIZED",
      };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Build filter based on user permissions
    const filter: any = { _id: new ObjectId(id) };
    if (user.id_tenant) {
      filter.id_tenant = user.id_tenant;
    }
    if (user.emp_acesso && user.emp_acesso.length > 0) {
      filter.id_empresa = { $in: user.emp_acesso };
    }

    const certificado = await clientdb
      .collection("mdfe_certificado")
      .findOne(filter);
    await TMongo.mongoDisconnect(client);

    if (!certificado) {
      return {
        success: false,
        message: "Certificado não encontrado",
        data: null,
      };
    }

    // Serialize MongoDB document for Client Components
    const serializedCertificado = {
      ...certificado,
      _id: certificado._id.toString(),
    };

    return {
      success: true,
      message: "Certificado encontrado com sucesso",
      data: serializedCertificado as MdfeCertificado,
    };
  } catch (error) {
    console.error(`Erro ao buscar certificado com ObjectId ${id}:`, error);
    return {
      success: false,
      message: "Erro ao buscar certificado",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get MDF-e certificate by CNPJ/CPF
 * @param cpfcnpj CNPJ/CPF number
 * @returns Response with MDF-e certificate object
 */
export async function getMdfeCertificadoByCpfCnpj(
  cpfcnpj: string
): Promise<MdfeCertificadoResponse> {
  try {
    const user: any = await getUser();
    if (!user) {
      return {
        success: false,
        message: "Usuário não autenticado",
        error: "UNAUTHORIZED",
      };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Build filter based on user permissions
    const filter: any = { cpfcnpj };
    if (user.id_tenant) {
      filter.id_tenant = user.id_tenant;
    }
    if (user.emp_acesso && user.emp_acesso.length > 0) {
      filter.id_empresa = { $in: user.emp_acesso };
    }

    const certificado = await clientdb
      .collection("mdfe_certificado")
      .findOne(filter);
    await TMongo.mongoDisconnect(client);

    if (!certificado) {
      return {
        success: false,
        message: "Certificado não encontrado",
        data: null,
      };
    }

    return {
      success: true,
      message: "Certificado encontrado com sucesso",
      data: certificado as MdfeCertificado,
    };
  } catch (error) {
    console.error(`Erro ao buscar certificado com CNPJ/CPF ${cpfcnpj}:`, error);
    return {
      success: false,
      message: "Erro ao buscar certificado",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Create a new MDF-e certificate
 * @param data Certificate data
 * @returns Response with created MDF-e certificate
 */
export async function createMdfeCertificado(
  data: MdfeCertificado
): Promise<MdfeCertificadoResponse> {
  try {
    const user: any = await getUser();
    if (!user) {
      return {
        success: false,
        message: "Usuário não autenticado",
        error: "UNAUTHORIZED",
      };
    }

    if (!user.id_tenant) {
      return {
        success: false,
        message: "Usuário não possui tenant válido",
        error: "MISSING_TENANT",
      };
    }

    // Automatically set id_empresa from user
    const dataWithEmpresa = {
      ...data,
      id: uuidv4(), // Generate a new UUID for the ID
      id_empresa: user.id_empresa,
    };

    // Check if user has access to the specified company
    if (user.emp_acesso && user.emp_acesso.length > 0) {
      const hasAccess = user.emp_acesso.includes(
        Number(dataWithEmpresa.id_empresa)
      );
      if (!hasAccess) {
        return {
          success: false,
          message: "Acesso negado para esta empresa",
          error: "ACCESS_DENIED",
        };
      }
    } else {
      return {
        success: false,
        message: "Usuário não possui acesso a nenhuma empresa",
        error: "NO_COMPANY_ACCESS",
      };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Check if CNPJ/CPF already exists (with user filter)
    if (dataWithEmpresa.cpfcnpj) {
      const filter: any = {
        cpfcnpj: dataWithEmpresa.cpfcnpj,
        id_tenant: user.id_tenant,
      };

      const existingCertificado = await clientdb
        .collection("mdfe_certificado")
        .findOne(filter);

      if (existingCertificado) {
        await TMongo.mongoDisconnect(client);
        return {
          success: false,
          message: "Já existe um certificado para este CNPJ/CPF",
          error: "CNPJ_ALREADY_EXISTS",
        };
      }
    }

    // Add user context to the data - always use the logged user's tenant
    const dataWithTimestamps = {
      ...dataWithEmpresa,
      id_tenant: user.id_tenant, // Always use user's tenant for security
      id_empresa: Number(dataWithEmpresa.id_empresa), // Ensure it's a number
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await clientdb
      .collection("mdfe_certificado")
      .insertOne(dataWithTimestamps);
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "Certificado criado com sucesso",
      data: {
        ...dataWithTimestamps,
        _id: result.insertedId.toString(),
      } as MdfeCertificado,
    };
  } catch (error) {
    console.error("Erro ao criar certificado:", error);
    return {
      success: false,
      message: "Erro ao criar certificado",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Update an existing MDF-e certificate
 * @param id Certificate ID
 * @param data Updated certificate data
 * @returns Response with update result
 */
export async function updateMdfeCertificado(
  id: string,
  data: Partial<MdfeCertificado>
): Promise<MdfeCertificadoResponse> {
  try {
    const user: any = await getUser();
    if (!user) {
      return {
        success: false,
        message: "Usuário não autenticado",
        error: "UNAUTHORIZED",
      };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Build filter based on user permissions
    const filter: any = { id: id };
    if (user.id_tenant) {
      filter.id_tenant = user.id_tenant;
    }
    if (user.emp_acesso && user.emp_acesso.length > 0) {
      filter.id_empresa = { $in: user.emp_acesso };
    }

    // Check if certificate exists and user has access
    const existingCertificado = await clientdb
      .collection("mdfe_certificado")
      .findOne(filter);

    if (!existingCertificado) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "Certificado não encontrado ou acesso negado",
        error: "CERTIFICADO_NOT_FOUND",
      };
    }

    // Check if user has access to the new company (if being changed)
    if (data.id_empresa && user.emp_acesso && user.emp_acesso.length > 0) {
      const hasAccess = user.emp_acesso.includes(Number(data.id_empresa));
      if (!hasAccess) {
        await TMongo.mongoDisconnect(client);
        return {
          success: false,
          message: "Acesso negado para esta empresa",
          error: "ACCESS_DENIED",
        };
      }
    }

    // Prevent tenant modification for security
    const { id_tenant: _, ...safeData } = data;

    // Add updated timestamp and ensure id_empresa is a number if provided
    const dataWithTimestamp = {
      ...safeData,
      ...(safeData.id_empresa && { id_empresa: Number(safeData.id_empresa) }),
      updatedAt: new Date(),
    };

    await clientdb
      .collection("mdfe_certificado")
      .updateOne({ id: id }, { $set: dataWithTimestamp });
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "Certificado atualizado com sucesso",
      data: {
        ...existingCertificado,
        ...dataWithTimestamp,
      } as MdfeCertificado,
    };
  } catch (error) {
    console.error(`Erro ao atualizar certificado com ID ${id}:`, error);
    return {
      success: false,
      message: "Erro ao atualizar certificado",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Update an MDF-e certificate by MongoDB ObjectId
 * @param id MongoDB ObjectId
 * @param data Updated certificate data
 * @returns Response with update result
 */
export async function updateMdfeCertificadoByObjectId(
  id: string,
  data: Partial<MdfeCertificado>
): Promise<MdfeCertificadoResponse> {
  try {
    const user: any = await getUser();
    if (!user) {
      return {
        success: false,
        message: "Usuário não autenticado",
        error: "UNAUTHORIZED",
      };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Build filter based on user permissions
    const filter: any = { _id: new ObjectId(id) };
    if (user.id_tenant) {
      filter.id_tenant = user.id_tenant;
    }
    if (user.emp_acesso && user.emp_acesso.length > 0) {
      filter.id_empresa = { $in: user.emp_acesso };
    }

    // Check if certificate exists and user has access
    const existingCertificado = await clientdb
      .collection("mdfe_certificado")
      .findOne(filter);

    if (!existingCertificado) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "Certificado não encontrado ou acesso negado",
        error: "CERTIFICADO_NOT_FOUND",
      };
    }

    // Check if user has access to the new company (if being changed)
    if (data.id_empresa && user.emp_acesso && user.emp_acesso.length > 0) {
      const hasAccess = user.emp_acesso.includes(Number(data.id_empresa));
      if (!hasAccess) {
        await TMongo.mongoDisconnect(client);
        return {
          success: false,
          message: "Acesso negado para esta empresa",
          error: "ACCESS_DENIED",
        };
      }
    }

    // Add updated timestamp
    const dataWithTimestamp = {
      ...data,
      updatedAt: new Date(),
    };

    await clientdb
      .collection("mdfe_certificado")
      .updateOne({ _id: new ObjectId(id) }, { $set: dataWithTimestamp });
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "Certificado atualizado com sucesso",
      data: {
        ...existingCertificado,
        ...dataWithTimestamp,
      } as MdfeCertificado,
    };
  } catch (error) {
    console.error(`Erro ao atualizar certificado com ObjectId ${id}:`, error);
    return {
      success: false,
      message: "Erro ao atualizar certificado",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Delete an MDF-e certificate
 * @param id Certificate ID
 * @returns Response with delete result
 */
export async function deleteMdfeCertificado(
  id: string
): Promise<MdfeCertificadoResponse> {
  try {
    const user: any = await getUser();
    if (!user) {
      return {
        success: false,
        message: "Usuário não autenticado",
        error: "UNAUTHORIZED",
      };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Build filter based on user permissions
    const filter: any = { id: id };
    if (user.id_tenant) {
      filter.id_tenant = user.id_tenant;
    }
    if (user.emp_acesso && user.emp_acesso.length > 0) {
      filter.id_empresa = { $in: user.emp_acesso };
    }

    // Check if certificate exists and user has access
    const existingCertificado = await clientdb
      .collection("mdfe_certificado")
      .findOne(filter);

    if (!existingCertificado) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "Certificado não encontrado ou acesso negado",
        error: "CERTIFICADO_NOT_FOUND",
      };
    }

    await clientdb.collection("mdfe_certificado").deleteOne(filter);
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "Certificado excluído com sucesso",
      data: existingCertificado as MdfeCertificado,
    };
  } catch (error) {
    console.error(`Erro ao excluir certificado com ID ${id}:`, error);
    return {
      success: false,
      message: "Erro ao excluir certificado",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Delete an MDF-e certificate by MongoDB ObjectId
 * @param id MongoDB ObjectId
 * @returns Response with delete result
 */
export async function deleteMdfeCertificadoByObjectId(
  id: string
): Promise<MdfeCertificadoResponse> {
  try {
    const user: any = await getUser();
    if (!user) {
      return {
        success: false,
        message: "Usuário não autenticado",
        error: "UNAUTHORIZED",
      };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Build filter based on user permissions
    const filter: any = { _id: new ObjectId(id) };
    if (user.id_tenant) {
      filter.id_tenant = user.id_tenant;
    }
    if (user.emp_acesso && user.emp_acesso.length > 0) {
      filter.id_empresa = { $in: user.emp_acesso };
    }

    // Check if certificate exists and user has access
    const existingCertificado = await clientdb
      .collection("mdfe_certificado")
      .findOne(filter);

    if (!existingCertificado) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "Certificado não encontrado ou acesso negado",
        error: "CERTIFICADO_NOT_FOUND",
      };
    }

    await clientdb.collection("mdfe_certificado").deleteOne(filter);
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "Certificado excluído com sucesso",
      data: existingCertificado as MdfeCertificado,
    };
  } catch (error) {
    console.error(`Erro ao excluir certificado com ObjectId ${id}:`, error);
    return {
      success: false,
      message: "Erro ao excluir certificado",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
