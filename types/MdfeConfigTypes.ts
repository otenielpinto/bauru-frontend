export interface MunCarrega {
  cMunCarrega: string;
  xMunCarrega: string;
}

export interface Percurso {
  UFPer: string;
}

export interface MdfeConfigData {
  cUF: string;
  tpAmb: string;
  tpEmit: string;
  tpTransp: string;
  mod: string;
  serie: string;
  modal: string;
  UFIni: string;
  UFFim: string;
  infMunCarrega: MunCarrega[];
  infPercurso: Percurso[];
  // Campos do veículo
  codigoAgregacao: string;
  placaVeiculo: string;
  renavam: string;
  tara: string;
  capacidadeKG: string;
  capacidadeM3: string;
  tpCar: string;
  tpRod: string;
  // Campos do motorista
  xNome: string;
  cpf: string;
}

// Interface for conductor data
export interface Condutor {
  xNome: string;
  cpf: string;
}

// Interface for form data
export interface MdfeRodoviarioFormData {
  codigoAgregacao: string;
  placaVeiculo: string;
  renavam: string;
  tara: string;
  capacidadeKG: string;
  capacidadeM3: string;
  tpCar: string;
  tpRod: string;
  condutores: Condutor[];
}
