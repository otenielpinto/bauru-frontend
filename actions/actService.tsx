"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";

interface GetAllServicesParams {
  name?: string;
}

export async function getAllServices(filters?: GetAllServicesParams) {
  let user: any = await getUser();
  const { client, clientdb } = await TMongo.connectToDatabase();

  // Build the query object
  let query: any = {};

  // Always filter by user's tenant
  query.id_tenant = user.id_tenant;

  // Add name filter if provided
  if (filters?.name !== undefined && filters.name !== "") {
    query.name = { $regex: filters.name, $options: "i" }; // Case-insensitive partial match
  }

  const response = await clientdb
    .collection("tmp_service")
    .find(query)
    .toArray();

  await TMongo.mongoDisconnect(client);

  // Serialize MongoDB documents for Client Components
  const serializedResponse = response.map((service) => ({
    ...service,
    _id: service._id.toString(),
  }));

  return serializedResponse;
}

export async function getServiceByName(name: string) {
  let user: any = await getUser();
  const { client, clientdb } = await TMongo.connectToDatabase();

  // Build the query object
  let query: any = {};

  // Always filter by user's tenant
  query.id = user.id_tenant;

  // Filter by exact name match
  query.name = name;

  const response = await clientdb.collection("tmp_service").findOne(query);

  await TMongo.mongoDisconnect(client);

  // Return null if no service found
  if (!response) {
    return null;
  }

  // Serialize MongoDB document for Client Components
  const serializedResponse = {
    ...response,
    _id: response._id.toString(),
  };

  return serializedResponse;
}
