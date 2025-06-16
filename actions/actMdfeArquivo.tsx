"use server";
import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/actions/actSession";
const collectionName = "mdfe_arquivo";

export async function saveArquivo(data: any): Promise<any> {
  const user: any = await getUser();

  try {
    // Inserir o arquivo MDF-e no banco de dados
    const { client, clientdb } = await TMongo.connectToDatabase();
    const mdfe = await clientdb.collection(collectionName).insertOne({
      ...data,
      createdAt: new Date(),
      id_tenant: Number(user.id_tenant),
    });

    await TMongo.mongoDisconnect(client);
    return {
      success: true,
      message: "MDFe saved successfully",
      data: mdfe,
    };
  } catch (error) {
    console.error(
      `Erro ao inserir MDFe no banco de dados com ID ${data?.id}:`,
      error
    );
    return {
      success: false,
      message: "Erro ao inserir MDFe no banco de dados",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function updatePDFBase64(data: any): Promise<any> {
  const user: any = await getUser();

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb.collection(collectionName).updateOne(
      {
        chave: data.chave,
      },
      {
        $set: {
          pdfBase64: data.pdfBase64,
          updatedAt: new Date(),
          id_tenant: Number(user.id_tenant),
        },
      }
    );

    await TMongo.mongoDisconnect(client);
    return {
      success: true,
      message: "PDF updated successfully",
      data: result,
    };
  } catch (error) {
    console.error(
      `Erro ao atualizar PDF no banco de dados com chave ${data?.chave}:`,
      error
    );
    return {
      success: false,
      message: "Erro ao atualizar PDF no banco de dados",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function updateXML(data: any): Promise<any> {
  const user: any = await getUser();

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb.collection(collectionName).updateOne(
      {
        chave: data.chave,
      },
      {
        $set: {
          xml: data.xml,
          updatedAt: new Date(),
          id_tenant: Number(user.id_tenant),
        },
      }
    );

    await TMongo.mongoDisconnect(client);
    return {
      success: true,
      message: "XML updated successfully",
      data: result,
    };
  } catch (error) {
    console.error(
      `Erro ao atualizar XML no banco de dados com chave ${data?.chave}:`,
      error
    );
    return {
      success: false,
      message: "Erro ao atualizar XML no banco de dados",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function getXmlById(id: string): Promise<any> {
  const user: any = await getUser();

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const result: any = await clientdb.collection(collectionName).findOne(
      {
        id: id,
        id_tenant: Number(user.id_tenant),
      },
      {
        projection: { xml: 1, chave: 1, id: 1, _id: 1 },
      }
    );

    await TMongo.mongoDisconnect(client);

    if (!result) {
      return {
        success: false,
        message: "MDFe não encontrado",
        data: null,
      };
    }
    result._id = result._id.toString(); // Convert ObjectId to string for consistency

    return {
      success: true,
      message: "XML retrieved successfully",
      data: result,
    };
  } catch (error) {
    console.error(`Erro ao buscar XML no banco de dados com ID ${id}:`, error);
    return {
      success: false,
      message: "Erro ao buscar XML no banco de dados",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function getXmlByChave(chave: string): Promise<any> {
  const user: any = await getUser();

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const result: any = await clientdb.collection(collectionName).findOne(
      {
        chave: chave,
        id_tenant: Number(user.id_tenant),
      },
      {
        projection: { xml: 1, chave: 1, _id: 1 },
      }
    );

    await TMongo.mongoDisconnect(client);

    if (!result) {
      return {
        success: false,
        message: "MDFe não encontrado",
        data: null,
      };
    }
    result._id = result._id.toString(); // Convert ObjectId to string for consistency

    return {
      success: true,
      message: "XML retrieved successfully",
      data: result,
    };
  } catch (error) {
    console.error(
      `Erro ao buscar XML no banco de dados com chave ${chave}:`,
      error
    );
    return {
      success: false,
      message: "Erro ao buscar XML no banco de dados",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function getPDFById(id: string): Promise<any> {
  const user: any = await getUser();

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const result: any = await clientdb.collection(collectionName).findOne(
      {
        id: id,
        id_tenant: Number(user.id_tenant),
      },
      {
        projection: { pdfBase64: 1, chave: 1, id: 1, _id: 1 },
      }
    );

    await TMongo.mongoDisconnect(client);

    if (!result) {
      return {
        success: false,
        message: "MDFe não encontrado",
        data: null,
      };
    }
    result._id = result._id.toString(); // Convert ObjectId to string for consistency

    return {
      success: true,
      message: "PDF retrieved successfully",
      data: result,
    };
  } catch (error) {
    console.error(`Erro ao buscar PDF no banco de dados com ID ${id}:`, error);
    return {
      success: false,
      message: "Erro ao buscar PDF no banco de dados",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function getPDFByChave(chave: string): Promise<any> {
  const user: any = await getUser();

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const result: any = await clientdb.collection(collectionName).findOne(
      {
        chave: chave,
        id_tenant: Number(user.id_tenant),
      },
      {
        projection: { pdfBase64: 1, chave: 1, _id: 1 },
      }
    );
    await TMongo.mongoDisconnect(client);

    if (!result) {
      return {
        success: false,
        message: "MDFe não encontrado",
        data: null,
      };
    }
    result._id = result._id.toString(); // Convert ObjectId to string for consistency

    return {
      success: true,
      message: "PDF retrieved successfully",
      data: result,
    };
  } catch (error) {
    console.error(
      `Erro ao buscar PDF no banco de dados com chave ${chave}:`,
      error
    );
    return {
      success: false,
      message: "Erro ao buscar PDF no banco de dados",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function getArquivosById(id: string): Promise<any> {
  const user: any = await getUser();

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const result: any = await clientdb.collection(collectionName).findOne(
      {
        id: id,
        id_tenant: Number(user.id_tenant),
      },
      {
        projection: { xml: 1, pdfBase64: 1, chave: 1, id: 1, _id: 1 },
      }
    );

    await TMongo.mongoDisconnect(client);

    if (!result) {
      return {
        success: false,
        message: "MDFe não encontrado",
        data: null,
      };
    }

    result._id = result._id.toString(); // Convert ObjectId to string for consistency

    return {
      success: true,
      message: "Arquivos retrieved successfully",
      data: result,
    };
  } catch (error) {
    console.error(
      `Erro ao buscar arquivos no banco de dados com ID ${id}:`,
      error
    );
    return {
      success: false,
      message: "Erro ao buscar arquivos no banco de dados",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

export async function getArquivosByChave(chave: string): Promise<any> {
  const user: any = await getUser();

  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const result: any = await clientdb.collection(collectionName).findOne(
      {
        chave: chave,
        id_tenant: Number(user.id_tenant),
      },
      {
        projection: { xml: 1, pdfBase64: 1, chave: 1, _id: 1 },
      }
    );

    await TMongo.mongoDisconnect(client);

    if (!result) {
      return {
        success: false,
        message: "MDFe não encontrado",
        data: null,
      };
    }

    result._id = result._id.toString(); // Convert ObjectId to string for consistency

    return {
      success: true,
      message: "Arquivos retrieved successfully",
      data: result,
    };
  } catch (error) {
    console.error(
      `Erro ao buscar arquivos no banco de dados com chave ${chave}:`,
      error
    );
    return {
      success: false,
      message: "Erro ao buscar arquivos no banco de dados",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
