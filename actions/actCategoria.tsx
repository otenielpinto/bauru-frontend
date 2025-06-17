"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";

interface GetAllCategoriasParams {
  nivel?: number;
}

export async function getAllCategorias(filters?: GetAllCategoriasParams) {
  let user: any = await getUser();
  const { client, clientdb } = await TMongo.connectToDatabase();

  // Build the query object
  let query: any = {};

  // Always filter by user's tenant if no specific id_tenant is provided
  query.id_tenant = user.id_tenant;

  // Add nivel filter if provided
  if (filters?.nivel !== undefined) {
    query.nivel = filters.nivel;
  }

  const response = await clientdb
    .collection("tmp_categoria")
    .find(query)
    .toArray();

  await TMongo.mongoDisconnect(client);

  // Serialize MongoDB documents for Client Components
  const serializedResponse = response.map((categoria) => ({
    ...categoria,
    _id: categoria._id.toString(),
  }));

  return serializedResponse;
}
