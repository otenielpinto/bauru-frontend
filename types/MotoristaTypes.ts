/**
 * Motorista type definition
 */
export interface Motorista {
  _id?: any; // MongoDB ObjectId
  id?: number;
  id_tenant?: number; // Tenant ID for multi-tenancy
  id_empresa?: number; // Company ID
  xNome: string; // Nome do motorista (obrigatório)
  cpf: string; // cpf do motorista (obrigatório)
  cnh?: string; // CNH do motorista (obrigatório)
  status?: string; // Status do motorista (Ativo/Inativo)
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Motorista response type for database operations
 */
export interface MotoristaResponse {
  success: boolean;
  message: string;
  data?: Motorista | Motorista[] | null;
  error?: string;
}
