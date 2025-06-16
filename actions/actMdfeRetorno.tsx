"use server";
import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/actions/actSession";
const collectionName = "mdfe_retorno";

export async function saveMdfeRetorno(data: any): Promise<any> {
  const user: any = await getUser();

  try {
    //aqui eu insiro o retorno do MDF-e no banco de dados
    const { client, clientdb } = await TMongo.connectToDatabase();
    const mdfe = await clientdb.collection(collectionName).insertOne({
      ...data,
      createdAt: new Date(),
      id_tenant: Number(user.id_tenant),
    });

    // Atualizar o arquivo XML e PDFBase64 se existirem , fazendo aqui tenho ganho de performance
    if (data.chave && (data.xml || data.pdfBase64)) {
      const updateData: any = {};
      if (data?.xml) updateData.xml = data.xml;
      if (data?.pdfBase64) updateData.pdfBase64 = data.pdfBase64;
      updateData.updatedAt = new Date();
      updateData.id_tenant = Number(user.id_tenant);
      await clientdb.collection("mdfe_arquivo").updateOne(
        {
          chave: data.chave,
        },
        {
          $set: {
            ...updateData,
          },
        },
        { upsert: true }
      );
    }

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
