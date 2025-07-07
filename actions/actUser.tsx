"use server";

import { TMongo } from "@/infra/mongoClient";

export async function getUserEmpresas(userId: string) {
  if (!userId) {
    return [];
  }
  const { client, clientdb } = await TMongo.connectToDatabase();
  const user: any = await clientdb.collection("user").findOne({ id: userId });

  if (!user) {
    await TMongo.mongoDisconnect(client);
    console.log("User not found");
    return [];
  }
  //Sempre gravar o array com int32 para evitar problemas de comparação ****
  const empresas = await clientdb
    .collection("tmp_empresa")
    .find({ id_tenant: user.id_tenant })
    .toArray();
  const filteredEmpresas = empresas.filter((empresa: any) =>
    user.emp_acesso.includes(Number(empresa.id))
  );

  // Serialize MongoDB documents for Client Components
  const serializedEmpresas = filteredEmpresas.map((empresa) => ({
    ...empresa,
    _id: empresa._id.toString(),
  }));

  const response = serializedEmpresas ? serializedEmpresas : [];
  await TMongo.mongoDisconnect(client);
  return response;
}
