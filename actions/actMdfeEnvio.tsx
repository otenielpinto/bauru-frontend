"use server";

import { TMongo } from "@/infra/mongoClient";
import { ObjectId } from "mongodb";
import { MdfeResponse, MdfeStatus } from "@/types/MdfeEnvioTypes";
import { getUser } from "@/actions/actSession";
import { MdfeSearchForm } from "@/types/MdfeSearchFormTypes";
import { getBrazilDateTime, formatDateTimeBrazil } from "@/lib/brazil-datetime";
import { lib } from "@/lib/lib";
import { gen_id } from "@/actions/actGenerator";

const collectionName = "mdfe_envio";

/**
 * Get all MDFe with enhanced filtering and computed fields
 * @returns Response with array of enhanced MDFe documents
 */
export async function getAllMdfe(data: MdfeSearchForm): Promise<MdfeResponse> {
  const user = await getUser();
  if (!user?.id_tenant) {
    return {
      success: false,
      message: "Usuário não autenticado ou sem tenant associado",
      error: "UNAUTHORIZED",
    };
  }

  // Base filter with tenant
  const filter: any = { id_tenant: Number(user.id_tenant) };

  const {
    periodoEmissaoInicio,
    periodoEmissaoFim,
    serie,
    numeroInicial,
    numeroFinal,
    situacao,
    tipoEmissao,
    modalidade,
    ufCarregamento,
    ufDescarregamento,
    ufPercurso,
    chaveCte,
    chaveNfe,
  } = data;

  // Date range filter for emission period
  if (periodoEmissaoInicio || periodoEmissaoFim) {
    filter["ide.dtEmi"] = {};
    if (periodoEmissaoInicio) {
      const dtEmiStart = getBrazilDateTime(periodoEmissaoInicio);
      dtEmiStart.setUTCDate(dtEmiStart.getUTCDate() + 1); // Adjust to start of day
      filter["ide.dtEmi"].$gte = lib.setUTCHoursStart(dtEmiStart);
    }
    if (periodoEmissaoFim) {
      const dtEmiEnd = getBrazilDateTime(periodoEmissaoFim);
      dtEmiEnd.setUTCDate(dtEmiEnd.getUTCDate() + 1); // Adjust to start of day
      filter["ide.dtEmi"].$lte = lib.setUTCHoursEnd(dtEmiEnd);
    }
  }

  // Serie filter
  if (serie) {
    filter["ide.serie"] = serie;
  }

  // Number range filter
  if (numeroInicial || numeroFinal) {
    filter["ide.numero"] = {};
    if (numeroInicial) {
      filter["ide.numero"].$gte = numeroInicial;
    }
    if (numeroFinal) {
      filter["ide.numero"].$lte = numeroFinal;
    }
  }

  // Status/Situation filter
  if (situacao) {
    filter.status = situacao;
  }

  // Emission type filter
  if (tipoEmissao) {
    filter["ide.tpEmis"] = tipoEmissao;
  }

  // Modality filter
  if (modalidade) {
    filter["ide.tpModal"] = modalidade;
  }

  // UF filters
  if (ufCarregamento) {
    filter["ide.infMunCarrega.cMunCarrega"] = {
      $regex: `^${ufCarregamento}`,
    };
  }

  if (ufDescarregamento) {
    filter["ide.ufFim"] = ufDescarregamento;
  }

  if (ufPercurso) {
    filter["ide.infPercurso"] = { $regex: ufPercurso, $options: "i" };
  }

  // CTe key filter - search in documents array
  if (chaveCte) {
    filter["infDoc.cte.chave"] = {
      $regex: chaveCte,
      $options: "i",
    };
  }

  // NFe key filter - search in documents array
  if (chaveNfe) {
    filter["infDoc.nfe.chave"] = {
      $regex: chaveNfe,
      $options: "i",
    };
  }

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const mdfes = await clientdb
      .collection(collectionName)
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    await TMongo.mongoDisconnect(client);

    // Serialize MongoDB document for Client Components
    const rows = mdfes.map((mdfe) => {
      const row = {
        ...mdfe,
        _id: mdfe._id.toString(),
      };

      return row;
    });

    return {
      success: true,
      message: `${rows.length} MDFe(s) encontrado(s) com sucesso`,
      data: rows,
    };
  } catch (error) {
    console.error("Erro ao buscar MDFes:", error);
    return {
      success: false,
      message: "Erro ao buscar MDFes",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get MDFe by ID
 * @param id MDFe ID
 * @returns Response with MDFe object
 */
export async function getMdfeById(id: string): Promise<MdfeResponse> {
  const user = await getUser();
  if (!user?.id_tenant) {
    return {
      success: false,
      message: "Usuário não autenticado ou sem tenant associado",
      error: "UNAUTHORIZED",
    };
  }

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const mdfe = await clientdb.collection(collectionName).findOne({
      id: String(id),
      id_tenant: Number(user.id_tenant),
    });
    await TMongo.mongoDisconnect(client);

    if (!mdfe) {
      return {
        success: false,
        message: "MDFe não encontrado",
        data: null,
      };
    }

    // Serialize MongoDB document for Client Components
    const serializedMdfe = {
      ...mdfe,
      _id: mdfe._id.toString(),
    };

    return {
      success: true,
      message: "MDFe encontrado com sucesso",
      data: serializedMdfe,
    };
  } catch (error) {
    console.error(`Erro ao buscar MDFe com ID ${id}:`, error);
    return {
      success: false,
      message: "Erro ao buscar MDFe",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get MDFe by MongoDB ObjectId
 * @param id MongoDB ObjectId
 * @returns Response with MDFe object
 */
export async function getMdfeByObjectId(id: string): Promise<MdfeResponse> {
  const user = await getUser();
  if (!user?.id_tenant) {
    return {
      success: false,
      message: "Usuário não autenticado ou sem tenant associado",
      error: "UNAUTHORIZED",
    };
  }

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const mdfe = await clientdb.collection(collectionName).findOne({
      _id: new ObjectId(id),
      id_tenant: Number(user.id_tenant),
    });
    await TMongo.mongoDisconnect(client);

    if (!mdfe) {
      return {
        success: false,
        message: "MDFe não encontrado",
        data: null,
      };
    }

    // Serialize MongoDB document for Client Components
    const serializedMdfe = {
      ...mdfe,
      _id: mdfe._id.toString(),
    };

    return {
      success: true,
      message: "MDFe encontrado com sucesso",
      data: serializedMdfe,
    };
  } catch (error) {
    console.error(`Erro ao buscar MDFe com ObjectId ${id}:`, error);
    return {
      success: false,
      message: "Erro ao buscar MDFe",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get MDFe by chave (access key)
 * @param chave MDFe access key
 * @returns Response with MDFe object
 */
export async function getMdfeByChave(chave: string): Promise<MdfeResponse> {
  const user = await getUser();
  if (!user?.id_tenant) {
    return {
      success: false,
      message: "Usuário não autenticado ou sem tenant associado",
      error: "UNAUTHORIZED",
    };
  }

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const mdfe = await clientdb.collection(collectionName).findOne({
      chave,
      id_tenant: Number(user.id_tenant),
    });
    await TMongo.mongoDisconnect(client);

    if (!mdfe) {
      return {
        success: false,
        message: "MDFe não encontrado",
        data: null,
      };
    }

    return {
      success: true,
      message: "MDFe encontrado com sucesso",
      data: mdfe,
    };
  } catch (error) {
    console.error(`Erro ao buscar MDFe com chave ${chave}:`, error);
    return {
      success: false,
      message: "Erro ao buscar MDFe",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Create a new MDFe with validation and auto-generation
 * @param data MDFe creation data
 * @returns Response with created MDFe
 */
export async function createMdfe(data: any): Promise<MdfeResponse> {
  const user = await getUser();
  if (!user?.id_tenant) {
    return {
      success: false,
      message: "Usuário não autenticado ou sem tenant associado",
      error: "UNAUTHORIZED",
    };
  }

  // Add timestamps with Brazil timezone
  const currentDateTime = getBrazilDateTime();
  data.ide.dtEmi = getBrazilDateTime(data.ide.dtEmi);
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    const obj = {
      ...data,
      dt_movto: currentDateTime,
      createdAt: currentDateTime,
      updatedAt: currentDateTime,
      id_tenant: Number(user.id_tenant),
      id_empresa: Number(user.id_empresa),
    };

    const result = await clientdb.collection(collectionName).insertOne(obj);
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "MDFe criado com sucesso",
      data: {
        ...obj,
        _id: result.insertedId.toString(),
      },
    };
  } catch (error) {
    console.error("Erro ao criar MDFe:", error);
    return {
      success: false,
      message: "Erro ao criar MDFe",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Update an existing MDFe with validation
 * @param id MDFe ID
 * @param data Updated MDFe data
 * @returns Response with update result
 */
export async function updateMdfe(id: string, data: any): Promise<MdfeResponse> {
  const user = await getUser();
  if (!user?.id_tenant) {
    return {
      success: false,
      message: "Usuário não autenticado ou sem tenant associado",
      error: "UNAUTHORIZED",
    };
  }

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Check if MDFe exists
    const existingMdfe = await clientdb.collection(collectionName).findOne({
      id: id,
      id_tenant: Number(user.id_tenant),
    });

    if (!existingMdfe) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "MDFe não encontrado",
        error: "MDFE_NOT_FOUND",
      };
    }

    // Remove _id field from data to prevent MongoDB update errors
    const { _id, ...updateData } = data;

    await clientdb.collection(collectionName).updateOne(
      {
        id: String(id),
        id_tenant: Number(user.id_tenant),
      },
      { $set: updateData }
    );
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "MDFe atualizado com sucesso",
      data: updateData,
    };
  } catch (error) {
    console.error(`Erro ao atualizar MDFe com ID ${id}:`, error);

    return {
      success: false,
      message: "Erro ao atualizar MDFe",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Update MDFe by MongoDB ObjectId
 * @param id MongoDB ObjectId
 * @param data Updated MDFe data
 * @returns Response with update result
 */
export async function updateMdfeByObjectId(
  id: string,
  data: Partial<any>
): Promise<MdfeResponse> {
  const user = await getUser();
  if (!user?.id_tenant) {
    return {
      success: false,
      message: "Usuário não autenticado ou sem tenant associado",
      error: "UNAUTHORIZED",
    };
  }

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Check if MDFe exists
    const existingMdfe = await clientdb.collection(collectionName).findOne({
      _id: new ObjectId(id),
      id_tenant: Number(user.id_tenant),
    });

    if (!existingMdfe) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "MDFe não encontrado",
        error: "MDFE_NOT_FOUND",
      };
    }

    // Add updated timestamp
    const dataWithTimestamp = {
      ...data,
      updatedAt: new Date(),
    };

    await clientdb.collection(collectionName).updateOne(
      {
        _id: new ObjectId(id),
        id_tenant: Number(user.id_tenant),
      },
      { $set: dataWithTimestamp }
    );
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "MDFe atualizado com sucesso",
      data: {
        ...existingMdfe,
        ...dataWithTimestamp,
      },
    };
  } catch (error) {
    console.error(`Erro ao atualizar MDFe com ObjectId ${id}:`, error);
    return {
      success: false,
      message: "Erro ao atualizar MDFe",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Delete MDFe
 * @param id MDFe ID
 * @returns Response with delete result
 */
export async function deleteMdfe(id: string): Promise<MdfeResponse> {
  const user = await getUser();
  if (!user?.id_tenant) {
    return {
      success: false,
      message: "Usuário não autenticado ou sem tenant associado",
      error: "UNAUTHORIZED",
    };
  }

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Check if MDFe exists
    const existingMdfe = await clientdb.collection(collectionName).findOne({
      id: String(id),
      id_tenant: Number(user.id_tenant),
    });

    if (!existingMdfe) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "MDFe não encontrado",
        error: "MDFE_NOT_FOUND",
      };
    }

    await clientdb.collection(collectionName).deleteOne({
      id: String(id),
      id_tenant: Number(user.id_tenant),
    });
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "MDFe excluído com sucesso",
      data: existingMdfe,
    };
  } catch (error) {
    console.error(`Erro ao excluir MDFe com ID ${id}:`, error);
    return {
      success: false,
      message: "Erro ao excluir MDFe",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Delete MDFe by MongoDB ObjectId
 * @param id MongoDB ObjectId
 * @returns Response with delete result
 */
export async function deleteMdfeByObjectId(id: string): Promise<MdfeResponse> {
  const user = await getUser();
  if (!user?.id_tenant) {
    return {
      success: false,
      message: "Usuário não autenticado ou sem tenant associado",
      error: "UNAUTHORIZED",
    };
  }

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Check if MDFe exists
    const existingMdfe = await clientdb.collection(collectionName).findOne({
      _id: new ObjectId(id),
      id_tenant: Number(user.id_tenant),
    });

    if (!existingMdfe) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "MDFe não encontrado",
        error: "MDFE_NOT_FOUND",
      };
    }

    await clientdb.collection(collectionName).deleteOne({
      _id: new ObjectId(id),
      id_tenant: Number(user.id_tenant),
    });
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "MDFe excluído com sucesso",
      data: existingMdfe,
    };
  } catch (error) {
    console.error(`Erro ao excluir MDFe com ObjectId ${id}:`, error);
    return {
      success: false,
      message: "Erro ao excluir MDFe",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get MDFe's by company ID
 * @param empresaId Company ID
 * @returns Response with array of MDFe
 */
export async function getMdfesByEmpresa(
  empresaId: number
): Promise<MdfeResponse> {
  const user = await getUser();
  if (!user?.id_tenant) {
    return {
      success: false,
      message: "Usuário não autenticado ou sem tenant associado",
      error: "UNAUTHORIZED",
    };
  }

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const mdfes = await clientdb
      .collection(collectionName)
      .find({
        empresa: Number(empresaId),
        id_tenant: Number(user.id_tenant),
      })
      .sort({ createdAt: -1 })
      .toArray();
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "MDFes encontrados com sucesso",
      data: mdfes,
    };
  } catch (error) {
    console.error(`Erro ao buscar MDFes da empresa ${empresaId}:`, error);
    return {
      success: false,
      message: "Erro ao buscar MDFes",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Update MDFe status
 * @param id MDFe ID or ObjectId
 * @param status New status
 * @returns Response with update result
 */
export async function updateMdfeStatus(
  id: string,
  status: string
): Promise<MdfeResponse> {
  const user = await getUser();
  if (!user?.id_tenant) {
    return {
      success: false,
      message: "Usuário não autenticado ou sem tenant associado",
      error: "UNAUTHORIZED",
    };
  }

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    let filter;

    filter = {
      id: String(id),
      id_tenant: Number(user.id_tenant),
    };

    // Check if MDFe exists
    const existingMdfe = await clientdb
      .collection(collectionName)
      .findOne(filter);

    if (!existingMdfe) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "MDFe não encontrado",
        error: "MDFE_NOT_FOUND",
      };
    }

    await clientdb.collection(collectionName).updateOne(filter, {
      $set: {
        status,
        updatedAt: new Date(),
      },
    });

    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "Status do MDFe atualizado com sucesso",
      data: {
        ...existingMdfe,
        _id: existingMdfe._id.toString(),
        status,
        updatedAt: new Date(),
      },
    };
  } catch (error) {
    console.error(`Erro ao atualizar status do MDFe ${id}:`, error);
    return {
      success: false,
      message: "Erro ao atualizar status do MDFe",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Generate sequential number for MDFe and update status to VALIDADO
 * @param id MDFe ID
 * @returns Response with updated MDFe
 */
export async function generateMdfeNumber(id: string): Promise<MdfeResponse> {
  const user = await getUser();
  if (!user?.id_tenant) {
    return {
      success: false,
      message: "Usuário não autenticado ou sem tenant associado",
      error: "UNAUTHORIZED",
    };
  }

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // First, check if MDFe exists and get current data
    const existingMdfe = await clientdb.collection(collectionName).findOne({
      id: String(id),
      id_tenant: Number(user.id_tenant),
    });

    if (!existingMdfe) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "MDFe não encontrado",
        error: "MDFE_NOT_FOUND",
      };
    }

    // Check if ide.nMDF already exists

    if (existingMdfe.ide?.nMDF && existingMdfe.ide.nMDF > 0) {
      await TMongo.mongoDisconnect(client);
      return {
        success: true,
        message: `MDFe já possui número gerado: ${existingMdfe.ide.nMDF}`,
        data: {
          "ide.nMDF": existingMdfe.ide.nMDF,
          status: existingMdfe.status,
        },
      };
    }

    // Generate sequential number using gen_id
    let colectionName = "mdfe_numero_" + existingMdfe.ide.tpAmb;
    const sequenceResult = await gen_id(colectionName);

    if (!sequenceResult.success || !sequenceResult.data) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        message: "Erro ao gerar número sequencial",
        error: sequenceResult.error || "Falha na geração do número",
      };
    }

    const numeroGerado = sequenceResult.data;

    // Update MDFe with new number and status
    const updateData = {
      "ide.nMDF": numeroGerado,
      status: "VALIDADO",
      updatedAt: getBrazilDateTime(),
    };

    await clientdb.collection(collectionName).updateOne(
      {
        id: String(id),
        id_tenant: Number(user.id_tenant),
      },
      { $set: updateData }
    );

    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: `MDFe validado com sucesso. Número gerado: ${numeroGerado}`,
      data: {
        ...updateData,
      },
    };
  } catch (error) {
    console.error(`Erro ao gerar número para MDFe ${id}:`, error);
    return {
      success: false,
      message: "Erro ao gerar número para MDFe",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Update MDFe status, protocolo, and chave
 * @param id MDFe ID
 * @param status New status
 * @param protocolo Protocol number
 * @param chave Access key
 * @returns Response with update result
 */
export async function updateMdfeStatusProtocoloChave(
  id: string,
  status?: string,
  protocolo?: string,
  chave?: string
): Promise<MdfeResponse> {
  const user = await getUser();
  if (!user?.id_tenant) {
    return {
      success: false,
      message: "Usuário não autenticado ou sem tenant associado",
      error: "UNAUTHORIZED",
    };
  }

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: getBrazilDateTime(),
    };

    if (status !== undefined) {
      updateData.status = status;
    }

    if (protocolo !== undefined) {
      updateData.protocolo = protocolo;
    }

    if (chave !== undefined) {
      updateData.chave = chave;
    }

    // Update MDFe
    const result = await clientdb.collection(collectionName).updateOne(
      {
        id: String(id),
        id_tenant: Number(user.id_tenant),
      },
      { $set: updateData }
    );

    await TMongo.mongoDisconnect(client);

    if (result.matchedCount === 0) {
      return {
        success: false,
        message: "MDFe não encontrado",
        error: "MDFE_NOT_FOUND",
      };
    }

    const updatedFields = Object.keys(updateData).filter(
      (key) => key !== "updatedAt"
    );

    return {
      success: true,
      message: `MDFe atualizado com sucesso. Campos alterados: ${updatedFields.join(
        ", "
      )}`,
      data: updateData,
    };
  } catch (error) {
    console.error(`Erro ao atualizar MDFe ${id}:`, error);
    return {
      success: false,
      message: "Erro ao atualizar MDFe",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
