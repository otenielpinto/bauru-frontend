"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/actions/actSession";

/**
 * @name gen_id
 * @description Generates unique sequential numbers for collections.
 *
 * @param {string} collectionName - The name of the collection to generate a sequence for.
 *
 * @example
 * ```typescript
 * const nextNumber = await gen_id('mdfe');
 * // Returns the next sequential number for the MDFe collection
 * ```
 *
 * @returns {Promise<{ success: boolean; message: string; data: number | null; error?: string }>}
 *  A promise that resolves to an object with the following properties:
 *   - success: boolean - Indicates whether the operation was successful.
 *   - message: string - A message describing the result of the operation.
 *   - data: number | null - The next available sequence number for the collection, or null if an error occurred.
 *   - error: string | undefined - An error message if the operation was not successful.
 */
const listaEspecial = ["empresa", "tenant"];
export async function gen_id(collectionName: string): Promise<{
  success: boolean;
  message: string;
  data: number | null;
  error?: string;
}> {
  let user = await getUser();
  let sequenceDocument = null;

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    if (listaEspecial.includes(collectionName)) {
      sequenceDocument = await clientdb
        .collection("tmp_generator")
        .findOneAndUpdate(
          { table_name: collectionName },
          { $inc: { value: 1 } },
          { upsert: true, returnDocument: "after" }
        );
    } else {
      sequenceDocument = await clientdb
        .collection("tmp_generator")
        .findOneAndUpdate(
          {
            table_name: collectionName,
            id_tenant: user?.id_tenant,
            id_empresa: user?.id_empresa,
          },
          { $inc: { value: 1 } },
          { upsert: true, returnDocument: "after" }
        );
    }

    await TMongo.mongoDisconnect(client);

    if (!sequenceDocument) {
      return {
        success: false,
        message: "Falha ao gerar sequência",
        data: null,
        error: "Não foi possível obter o documento de sequência",
      };
    }

    return {
      success: true,
      message: "Sequência gerada com sucesso",
      data: sequenceDocument.value,
    };
  } catch (error) {
    console.error("Erro ao gerar sequência:", error);
    return {
      success: false,
      message: "Erro ao gerar sequência",
      error: error instanceof Error ? error.message : "Erro desconhecido",
      data: null,
    };
  }
}
