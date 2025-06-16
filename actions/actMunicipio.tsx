"use server";

import { TMongo } from "@/infra/mongoClient";

//lista de cidades do Brasil
const CIBGE_URL_MUN =
  "https://servicodados.ibge.gov.br/api/v1/localidades/municipios";
const CIBGE_URL_MUN_UF =
  "https://servicodados.ibge.gov.br/api/v1/localidades/estados/{idUF}/municipios";

export async function createAllMunicipios() {
  const { client, clientdb } = await TMongo.connectToDatabase();
  let result: any = { success: false, message: "Erro ao criar municípios" };

  try {
    const response = await fetch(CIBGE_URL_MUN);
    const data = await response.json();

    const municipios = data.map((municipio: any) => {
      // Function to remove accents
      const removeAccents = (str: string) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      };

      const nome = municipio?.nome?.toUpperCase();
      const descricao = removeAccents(nome); // Apply removeAccents after converting to uppercase

      return {
        descricao: descricao,
        nome: nome,
        codigoIbge: municipio.id,
        uf: municipio?.microrregiao?.mesorregiao?.UF?.sigla,
      };
    });

    result = await clientdb.collection("municipio").insertMany(municipios);
  } catch (error) {
    console.error("Erro ao criar municípios:", error);
  } finally {
    await TMongo.mongoDisconnect(client);
  }
  return result;
}

export async function getMunicipioByUfAndDescricao(
  uf: string,
  descricao: string
) {
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const municipio = await clientdb.collection("municipio").findOne(
      {
        uf: uf.toUpperCase().trim(),
        descricao: descricao.toUpperCase().trim(),
      },
      { projection: { _id: 0 } }
    );

    return municipio;
  } catch (error) {
    console.error("Erro ao buscar município:", error);
    return null;
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

export async function getMunicipioByDescricao(descricao: string) {
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const municipio = await clientdb.collection("municipio").findOne(
      {
        descricao: { $regex: descricao.toUpperCase(), $options: "i" },
      },
      { projection: { _id: 0 } }
    );

    return municipio;
  } catch (error) {
    console.error("Erro ao buscar município:", error);
    return null;
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

//lista de cidades do Brasil por UF
export async function getMunicipiosByUf(uf: string) {
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const municipios = await clientdb
      .collection("municipio")
      .find({ uf: uf.toUpperCase() })
      .toArray();

    return municipios;
  } catch (error) {
    console.error("Erro ao buscar municípios por UF:", error);
    return null;
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}
