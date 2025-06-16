//Nao usar o user server aqui

// Lista de UFs do Brasil
export const UF_DATA = [
  {
    id: "AC",
    descricao: "ACRE",
    codigoIbge: 12,
  },
  {
    id: "AL",
    descricao: "ALAGOAS",
    codigoIbge: 27,
  },
  {
    id: "AM",
    descricao: "AMAZONAS",
    codigoIbge: 13,
  },
  {
    id: "AP",
    descricao: "AMAPA",
    codigoIbge: 16,
  },
  {
    id: "BA",
    descricao: "BAHIA",
    codigoIbge: 29,
  },
  {
    id: "CE",
    descricao: "CEARA",
    codigoIbge: 23,
  },
  {
    id: "DF",
    descricao: "DISTRITO FEDERAL",
    codigoIbge: 53,
  },
  {
    id: "ES",
    descricao: "ESPIRITO SANTO",
    codigoIbge: 32,
  },
  {
    id: "GO",
    descricao: "GOIAS",
    codigoIbge: 52,
  },
  {
    id: "MA",
    descricao: "MARANHAO",
    codigoIbge: 21,
  },
  {
    id: "MG",
    descricao: "MINAS GERAIS",
    codigoIbge: 31,
  },
  {
    id: "MS",
    descricao: "MATO GROSSO DO SUL",
    codigoIbge: 50,
  },
  {
    id: "MT",
    descricao: "MATO GROSSO",
    codigoIbge: 51,
  },
  {
    id: "PA",
    descricao: "PARA",
    codigoIbge: 15,
  },
  {
    id: "PB",
    descricao: "PARAIBA",
    codigoIbge: 25,
  },
  {
    id: "PE",
    descricao: "PERNAMBUCO",
    codigoIbge: 26,
  },
  {
    id: "PI",
    descricao: "PIAUI",
    codigoIbge: 22,
  },
  {
    id: "PR",
    descricao: "PARANA",
    codigoIbge: 41,
  },
  {
    id: "RJ",
    descricao: "RIO DE JANEIRO",
    codigoIbge: 33,
  },
  {
    id: "RN",
    descricao: "RIO GRANDE DO NORTE",
    codigoIbge: 24,
  },
  {
    id: "RO",
    descricao: "RONDONIA",
    codigoIbge: 11,
  },
  {
    id: "RR",
    descricao: "RORAIMA",
    codigoIbge: 14,
  },
  {
    id: "RS",
    descricao: "RIO GRANDE DO SUL",
    codigoIbge: 43,
  },
  {
    id: "SC",
    descricao: "SANTA CATARINA",
    codigoIbge: 42,
  },
  {
    id: "SE",
    descricao: "SERGIPE",
    codigoIbge: 28,
  },
  {
    id: "SP",
    descricao: "SAO PAULO",
    codigoIbge: 35,
  },
  {
    id: "TO",
    descricao: "TOCANTINS",
    codigoIbge: 17,
  },
] as const;

export async function getUf() {
  return UF_DATA;
}

export async function getUfById(id: string) {
  return UF_DATA.find((uf) => uf.id === id);
}

export async function getUfByCodigoIbge(id: number) {
  return UF_DATA.find((uf) => uf.codigoIbge === id);
}
