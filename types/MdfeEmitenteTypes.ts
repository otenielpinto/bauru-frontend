/**
 * MDF-e Emitente type definition
 * Based on the NFE_EMITENTE table structure
 */
export interface MdfeEmitente {
  _id?: any; // MongoDB ObjectId
  id?: number;
  id_tenant?: number; // Tenant ID for multi-tenancy
  empresa?: number;
  cpfcnpj?: string;
  razao_social?: string;
  fantasia?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  codigo_municipio?: number;
  nome_municipio?: string;
  uf?: string;
  cep?: string;
  codigo_pais?: number;
  nome_pais?: string;
  telefone?: string;
  ie?: string;
  im?: string;
  cnae?: number;
  crt?: number;
  email?: string;

  geral_mensagem?: string;
  geral_danfe?: number;
  geral_formatoemissao?: number;
  geral_logomarca?: string;
  geral_salvar?: number;
  geral_pathsalvar?: string;
  webservice_uf?: string;
  webservice_ambiente?: number;
  webservice_visualizar?: number;

  mail_host?: string;
  mail_port?: string;
  mail_user?: string;
  mail_pass?: string;
  mail_assunto?: string;
  mail_ssl?: number;
  mail_tls?: number;
  mail_mensagem?: string;
  mail_responder?: string;

  msg_simples_nacional?: string;
  msg_substituicao?: string;
  msg_bc_reduzida?: string;
  msg_isento?: string;
  msg_suspensao?: string;
  msg_diferimento?: string;
  msg_outros?: string;

  site?: string;
  idtoken?: string;
  token?: string;
  modcertificado?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * MDF-e Emitente environment types
 */
export enum MdfeAmbiente {
  PRODUCAO = 1,
  HOMOLOGACAO = 2,
}

/**
 * MDF-e Emitente CRT (Código de Regime Tributário) types
 */
export enum MdfeCrt {
  SIMPLES_NACIONAL = 1,
  SIMPLES_NACIONAL_EXCESSO = 2,
  REGIME_NORMAL = 3,
}

/**
 * MDF-e Emitente response type for database operations
 */
export interface MdfeEmitenteResponse {
  success: boolean;
  message: string;
  data?: MdfeEmitente | MdfeEmitente[] | null;
  error?: string;
}

/**
 * MDF-e Emitente response type for single object operations
 */
export interface MdfeEmitenteSingleResponse {
  success: boolean;
  message: string;
  data?: MdfeEmitente | null;
  error?: string;
}

/**
 * MDF-e Emitente response type for array operations
 */
export interface MdfeEmitenteArrayResponse {
  success: boolean;
  message: string;
  data?: MdfeEmitente[];
  error?: string;
}
