"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";

export async function getAllMarcas() {
  let user: any = await getUser();
  const { client, clientdb } = await TMongo.connectToDatabase();

  // Build the query object
  let query: any = {
    id_tenant: user.id_tenant,
  };

  const response = await clientdb.collection("tmp_marca").find(query).toArray();

  await TMongo.mongoDisconnect(client);

  // Serialize MongoDB documents for Client Components
  const serializedResponse = response.map((marca) => ({
    ...marca,
    _id: marca._id.toString(),
  }));

  return serializedResponse;
}
