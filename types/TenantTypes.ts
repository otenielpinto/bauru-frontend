/**
 * Tenant type definition
 */
export interface Tenant {
  _id?: any; // MongoDB ObjectId
  id?: number; // UUID or auto-increment ID
  name: string; // Nome do tenant (ex: "Acme Corp")
  domain?: string; // Domínio personalizado (ex: "acme.com")
  status: TenantStatus; // Status do tenant
  plan_id?: string; // FK para a tabela de planos de assinatura
  created_at?: Date; // Data de criação
  updated_at?: Date; // Data de última atualização
  createdAt?: Date; // Alias para compatibilidade
  updatedAt?: Date; // Alias para compatibilidade
}

/**
 * Tenant status enum
 */
export enum TenantStatus {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
  SUSPENSO = "SUSPENSO",
}

/**
 * Tenant response type for database operations
 */
export interface TenantResponse {
  success: boolean;
  message: string;
  data?: Tenant | Tenant[] | null;
  error?: string;
}

/**
 * Tenant form data type for create/update operations
 */
export interface TenantFormData {
  name: string;
  domain?: string;
  status: TenantStatus;
  plan_id?: string;
}

/**
 * Tenant creation data type
 */
export interface CreateTenantData {
  name: string;
  domain?: string;
  status?: TenantStatus;
  plan_id?: string;
}

/**
 * Tenant update data type
 */
export interface UpdateTenantData {
  name?: string;
  domain?: string;
  status?: TenantStatus;
  plan_id?: string;
}

/**
 * Tenant filter type for search/listing operations
 */
export interface TenantFilter {
  name?: string;
  domain?: string;
  status?: TenantStatus;
  plan_id?: string;
  created_at?: {
    from?: Date;
    to?: Date;
  };
}
