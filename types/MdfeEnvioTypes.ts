// Base response interface
export interface MdfeResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// Status enum for better type safety
export enum MdfeStatus {
  PENDENTE = "pendente",
  AUTORIZADO = "autorizado",
  REJEITADO = "rejeitado",
  DENEGADO = "denegado",
  ENCERRADO = "encerrado",
  CANCELADO = "cancelado",
  ERRO = "erro",
}

// Modal types
export enum ModalType {
  RODOVIARIO = "1",
  AEREO = "2",
  AQUAVIARIO = "3",
  FERROVIARIO = "4",
}

// Emission environment
export enum TipoAmbiente {
  PRODUCAO = "1",
  HOMOLOGACAO = "2",
}

// Emission type
export enum TipoEmissao {
  NORMAL = "1",
  CONTINGENCIA = "2",
}

// Form mode type
export type MdfeFormMode = "create" | "edit";

export type MdfeStepAlias =
  | "ide"
  | "emit"
  | "rodo"
  | "aquav"
  | "infDoc"
  | "tot"
  | "infAdic";

// Individual step types for better organization
export interface MdfeIde {
  cUF: string;
  tpEmit: string;
  tpTransp: string;
  tpAmb: TipoAmbiente;
  tpEmis: TipoEmissao;
  mod: string;
  serie: string;
  nMDF: string;
  cMDF: string;
  cDV: string;
  dhEmi: string;
  dtEmi: Date;
  hora: string;
  tpModal: ModalType;
  ufIni: string;
  ufFim: string;
  dhIniViagem?: string;
  indCanalVerde: boolean;
  indCarregaPosterior: boolean;
  infMunCarrega: Array<{
    cMunCarrega: string;
    xMunCarrega: string;
  }>;
  infPercurso: string;
}

export interface MdfeEmitente {
  CNPJ: string;
  IE: string;
  xNome: string;
  xFant?: string;
  enderEmit: {
    xLgr: string;
    nro: string;
    xCpl?: string;
    xBairro: string;
    cMun: string;
    xMun: string;
    CEP: string;
    UF: string;
    fone?: string;
    email?: string;
  };
}

export interface MdfeRodoviario {
  codigoAgregacao?: string;
  placaVeiculo: string;
  renavam?: string;
  tara?: string;
  capacidadeKG?: string;
  capacidadeM3?: string;
  tpCar: string;
  tpRod: string;
  condutores: Array<{
    xNome: string;
    cpf: string;
  }>;
}

export interface MdfeAquaviario {
  irin?: string;
  nomeEmbarcacao?: string;
  codigoEmbarcacao?: string;
  balsa: Array<any>;
}

export interface MdfeInfDoc {
  nfe: Array<{
    chave: string;
    segCodBarra?: string;
    indReentrega: boolean;
    pesoTotal: string;
    valor: string;
    cMunCarrega: string;
    xMunCarrega: string;
    cMunDescarga: string;
    xMunDescarga: string;
    ufDescarga: string;
  }>;
  cte: Array<{
    chave: string;
    segCodBarra?: string;
    indReentrega: boolean;
    pesoTotal: string;
    valor: string;
    cMunCarrega: string;
    xMunCarrega: string;
    cMunDescarga: string;
    xMunDescarga: string;
    ufDescarga: string;
  }>;
  mdf: Array<{
    chave: string;
    segCodBarra?: string;
    indReentrega: boolean;
    pesoTotal: string;
    valor: string;
    cMunCarrega: string;
    xMunCarrega: string;
    cMunDescarga: string;
    xMunDescarga: string;
    ufDescarga: string;
  }>;
}

export interface MdfeTotalizadores {
  qCTe: string;
  qNFe: string;
  qMDFe: string;
  vCarga: string;
  cUnid: string;
  qCarga: string;
}

export interface MdfeinfAdic {
  infAdFisco?: string;
  infCpl?: string;
}

export interface MdfeProdPred {
  tpCarga: string;
  xProd: string;
  cEAN: string;
  ncm: string;
  infLocalCarrega: {};
  infLocalDescarrega: {};
}

export interface MdfeSeg {
  respSeg: any;
  CNPJCPF: string;
  xSeg: string;
  CNPJ: string;
  nApol: string;
  aver: any;
}

/**
 * Optimized MDFe document interface using aliases for MongoDB storage
 * This interface represents the actual structure stored in MongoDB
 */
export interface MdfeDocument {
  _id?: string;
  id: string;
  dt_movto: Date;

  // Optimized step data using aliases
  ide: MdfeIde;
  emit: MdfeEmitente;
  rodo?: MdfeRodoviario;
  aquav?: MdfeAquaviario;
  infDoc?: MdfeInfDoc;
  tot: MdfeTotalizadores;
  infAdic: MdfeinfAdic;
  seg?: Array<MdfeSeg>;
  prodPred?: Array<MdfeProdPred>; // Initialize as empty array
  autXML?: Array<{ CNPJCPF: string }>; // Change to Array for consistency
  lacres?: Array<{ nLacre: string }>; // Change to Array for consistency

  // Reference data
  referencia?: Record<string, any>;

  // Status and keys
  status?: MdfeStatus;
  qrCodMDFe?: string;
  chave?: string;
  protocolo?: string;

  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
  id_tenant: number;
  id_empresa: number;
}

/**
 * Form data interface for optimized MDFe forms
 * Extends MdfeDocument but makes timestamps optional for form handling
 */
export interface MdfeFormData
  extends Omit<MdfeDocument, "_id" | "createdAt" | "updatedAt"> {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  rodo?: MdfeRodoviario;
  aquav?: MdfeAquaviario;
  infDoc?: MdfeInfDoc;
  seg?: Array<MdfeSeg>;
  status?: MdfeStatus;
}

export function cStatusToMdfeStatus(cStat: number): MdfeStatus {
  switch (cStat) {
    case 100:
      return MdfeStatus.AUTORIZADO;
    case 101:
      return MdfeStatus.REJEITADO;
    case 102:
      return MdfeStatus.CANCELADO;
    default:
      return MdfeStatus.ERRO; // Default to ERRO for any other status
  }
}
