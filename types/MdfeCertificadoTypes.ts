/**
 * MDF-e Certificado type definition
 * Based on the MDFE_CERTIFICADO table structure
 */
export interface MdfeCertificado {
  _id?: any; // MongoDB ObjectId
  id?: string;
  cpfcnpj?: string;
  arquivoBase64?: Buffer | string; // Binary data for certificate file
  senha?: string;
  data_vencimento?: Date; // Certificate expiration date
  createdAt?: Date;
  updatedAt?: Date;
  id_tenant?: number; // Tenant ID for multi-tenancy support
  id_empresa?: number; // Company ID for multi-tenancy support
}

/**
 * MDF-e Certificado response type for database operations
 */
export interface MdfeCertificadoResponse {
  success: boolean;
  message: string;
  data?: MdfeCertificado | MdfeCertificado[] | null;
  error?: string;
}
