"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/actions/actSession";
import { ObjectId } from "mongodb";

const collectionName = "mdfe_evento";

/**
 * Interface for MDFe Event data
 */
export interface MdfeEvento {
  _id?: ObjectId;
  mdfeId: string;
  chave: string;
  tpEvento: string; // "110112" for encerramento
  nSeqEvento: number;
  tipoEvento: string; // "encerramento", "cancelamento", etc.
  protocolo?: string;
  cStat: number;
  xMotivo: string;
  dhEvento: string;
  xml?: string;
  pdfBase64?: string;
  id_tenant: number;
  id_empresa: number;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Response interface for MDFe Event operations
 */
export interface MdfeEventoResponse {
  success: boolean;
  message: string;
  data?: MdfeEvento | MdfeEvento[];
  error?: string;
}

/**
 * Save MDFe event (encerramento, cancelamento, etc.)
 * @param data Event data
 * @returns Response with save result
 */
export async function saveMdfeEvento(
  data: Partial<MdfeEvento>
): Promise<MdfeEventoResponse> {
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

    const eventoData = {
      ...data,
      id_tenant: Number(user.id_tenant),
      id_empresa: Number(user.id_empresa),
      createdAt: new Date(),
    };

    const result = await clientdb
      .collection(collectionName)
      .insertOne(eventoData);
    await TMongo.mongoDisconnect(client);

    return {
      success: true,
      message: "Evento salvo com sucesso",
      data: {
        ...eventoData,
        _id: result.insertedId,
      } as MdfeEvento,
    };
  } catch (error) {
    console.error("Erro ao salvar evento MDFe:", error);
    return {
      success: false,
      message: "Erro ao salvar evento",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Get events by MDFe ID
 * @param mdfeId MDFe ID
 * @returns Response with events
 */
export async function getMdfeEventos(
  mdfeId: string
): Promise<MdfeEventoResponse> {
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

    const eventos = await clientdb
      .collection(collectionName)
      .find({
        mdfeId: String(mdfeId),
        id_tenant: Number(user.id_tenant),
      })
      .sort({ createdAt: -1 })
      .toArray();

    await TMongo.mongoDisconnect(client);

    // Serialize MongoDB documents properly
    const serializedEventos = eventos.map((evento) => ({
      ...evento,
      _id: evento._id,
    })) as MdfeEvento[];

    return {
      success: true,
      message: "Eventos encontrados com sucesso",
      data: serializedEventos,
    };
  } catch (error) {
    console.error(`Erro ao buscar eventos do MDFe ${mdfeId}:`, error);
    return {
      success: false,
      message: "Erro ao buscar eventos",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Count events by MDFe ID and optionally by event type
 * @param mdfeId MDFe ID
 * @param tipoEvento Optional event type filter
 * @returns Response with event count
 */
export async function countMdfeEventos(
  mdfeId: string,
  tipoEvento?: string
): Promise<MdfeEventoResponse & { count?: number }> {
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

    const filter: any = {
      mdfeId: String(mdfeId),
      id_tenant: Number(user.id_tenant),
    };

    // Add tipoEvento filter if provided
    if (tipoEvento) {
      filter.tipoEvento = tipoEvento;
    }

    const count = await clientdb
      .collection(collectionName)
      .countDocuments(filter);

    await TMongo.mongoDisconnect(client);

    const message = tipoEvento
      ? `${count} evento(s) do tipo "${tipoEvento}" encontrado(s)`
      : `${count} evento(s) encontrado(s)`;

    return {
      success: true,
      message,
      count,
    };
  } catch (error) {
    console.error(`Erro ao contar eventos do MDFe ${mdfeId}:`, error);
    return {
      success: false,
      message: "Erro ao contar eventos",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
