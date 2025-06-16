"use server";

import { TMongo } from "@/infra/mongoClient";
import { Empresa } from "@/types/EmpresaTypes";
import { gen_id } from "@/actions/actGenerator";
import { v4 as uuidv4 } from "uuid";
import { getUser } from "@/actions/actSession";

export async function getAllEmpresas() {
  let user: any = await getUser();
  const { client, clientdb } = await TMongo.connectToDatabase();
  const response = await clientdb
    .collection("empresa")
    .find({ id_tenant: user.id_tenant })
    .toArray();
  await TMongo.mongoDisconnect(client);

  // Serialize MongoDB documents for Client Components
  const serializedResponse = response.map((empresa) => ({
    ...empresa,
    _id: empresa._id.toString(),
  }));

  return serializedResponse;
}

export async function getEmpresaById(id: Number) {
  let user: any = await getUser();
  const { client, clientdb } = await TMongo.connectToDatabase();
  const response = await clientdb
    .collection("empresa")
    .findOne({ id: Number(id), id_tenant: user.id_tenant });
  await TMongo.mongoDisconnect(client);

  // Serialize MongoDB document for Client Components
  if (response) {
    return {
      ...response,
      _id: response._id.toString(),
    };
  }
  return response;
}



export async function createEmpresa(data: any) {
  let user: any = await getUser();
  const { client, clientdb } = await TMongo.connectToDatabase();
  const empresaData = { ...data, id_tenant: user.id_tenant };
  const response = await clientdb.collection("empresa").insertOne(empresaData);
  await TMongo.mongoDisconnect(client);
  return response;
}

export async function updateEmpresa(id: Number, data: any) {
  let user: any = await getUser();
  const { client, clientdb } = await TMongo.connectToDatabase();
  const response = await clientdb
    .collection("empresa")
    .updateOne({ id: Number(id), id_tenant: user.id_tenant }, { $set: data });
  await TMongo.mongoDisconnect(client);
  return response;
}

export async function deleteEmpresa(id: Number) {
  let user: any = await getUser();
  const { client, clientdb } = await TMongo.connectToDatabase();
  const response = await clientdb
    .collection("empresa")
    .deleteOne({ id: Number(id), id_tenant: user.id_tenant });
  await TMongo.mongoDisconnect(client);
  return response;
}

export async function getEmpresaByCnpj(cnpj: String) {
  let user: any = await getUser();
  const { client, clientdb } = await TMongo.connectToDatabase();
  const response = await clientdb
    .collection("empresa")
    .findOne({ cpfcnpj: cnpj, id_tenant: user.id_tenant });
  await TMongo.mongoDisconnect(client);

  // Serialize MongoDB document for Client Components
  if (response) {
    return {
      ...response,
      _id: response._id.toString(),
    };
  }
  return response;
}

//vai ser usado para criar a empresa padrão
export async function autoCreateEmpresa() {
  let rows = await getAllEmpresas();
  if (rows.length > 0) {
    return;
  }

  let row = await gen_id("empresa");
  if (!row.success) {
    throw new Error("Failed to generate ID");
  }

  const Empresa: Empresa = {
    id: parseInt(row.data ? String(row.data) : "0"),
    nome: "empresa " + uuidv4(),
    fantasia: "empresa " + uuidv4(),
    rua: "",
    nro: "",
    bairro: "",
    cep: "",
    cidade: "",
    uf: "",
    ddd: 0,
    telefone: "",
    fax: "",
    email: "",
    website: "",
    cpfCnpj: "",
    ie: "",
    im: "",
    crt: 0,
    multa: 0,
    multaDias: 0,
    juros1: 0,
    juros2: 0,
    juros3: 0,
    jurosDias1: 0,
    jurosDias2: 0,
    jurosDias3: 0,
    tipoJuro: "",
    carta1: 0,
    carta2: 0,
    carta3: 0,
    carta4: 0,
    ativo: "",
    cnae: 0,
    txPis: 0,
    txCofins: 0,
    xIbge: 0,
    usuario: "",
    logo: "",
    filial: "",
    estoquePorEmpresa: "",
    revenda: "",
    tabelaPreco: 0,
    id_tenant: 0,
    ultAtualizacao: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return await createEmpresa(Empresa);
}
