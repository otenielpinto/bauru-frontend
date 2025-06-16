/**
 * SEFAZ Status Types
 * Types for SEFAZ service status consultation
 */

/**
 * SEFAZ Status Response Interface
 */
export interface SefazStatusResponse {
  tpAmb: "1" | "2"; // Environment (1-Production, 2-Testing)
  verAplic: string; // Application version
  cStat: number; // Status code
  xMotivo: string; // Status description
  cUF: number; // State code
  dhRecbto: string; // Reception timestamp (ISO 8601)
  tMed: string; // Average response time
  dhRetorno: string; // Return timestamp (ISO 8601)
  xObs?: string; // Optional observations
}

/**
 * SEFAZ Status API Response
 */
export interface SefazStatusApiResponse {
  success: boolean;
  message: string;
  data?: SefazStatusResponse;
  cached?: boolean;
  error?: string;
  code?: string;
  details?: any;
}

/**
 * SEFAZ Environment Types
 */
export enum SefazAmbiente {
  PRODUCAO = "1",
  HOMOLOGACAO = "2",
}

/**
 * Common SEFAZ Status Codes
 */
export enum SefazStatusCode {
  SERVICO_EM_OPERACAO = 107,
  SERVICO_PARALISADO_MOMENTANEAMENTE = 108,
  SERVICO_PARALISADO_SEM_PREVISAO = 109,
}

/**
 * UF Codes for Brazil
 */
export const UF_CODES = {
  AC: 12, // Acre
  AL: 17, // Alagoas
  AP: 16, // Amapá
  AM: 23, // Amazonas
  BA: 29, // Bahia
  CE: 23, // Ceará
  DF: 53, // Distrito Federal
  ES: 32, // Espírito Santo
  GO: 52, // Goiás
  MA: 21, // Maranhão
  MT: 51, // Mato Grosso
  MS: 50, // Mato Grosso do Sul
  MG: 31, // Minas Gerais
  PA: 15, // Pará
  PB: 25, // Paraíba
  PR: 41, // Paraná
  PE: 26, // Pernambuco
  PI: 22, // Piauí
  RJ: 33, // Rio de Janeiro
  RN: 24, // Rio Grande do Norte
  RS: 43, // Rio Grande do Sul
  RO: 11, // Rondônia
  RR: 14, // Roraima
  SC: 42, // Santa Catarina
  SP: 35, // São Paulo
  SE: 28, // Sergipe
  TO: 17, // Tocantins
} as const;

/**
 * Helper function to get UF code by state abbreviation
 */
export function getUFCode(uf: keyof typeof UF_CODES): number {
  return UF_CODES[uf];
}

/**
 * Helper function to get UF abbreviation by code
 */
export function getUFByCode(code: number): string | null {
  const entry = Object.entries(UF_CODES).find(([, value]) => value === code);
  return entry ? entry[0] : null;
}

/**
 * Helper function to format SEFAZ status message
 */
export function formatSefazStatus(status: SefazStatusResponse): string {
  const ufName = getUFByCode(status.cUF) || `UF-${status.cUF}`;
  const ambiente = status.tpAmb === "1" ? "Produção" : "Homologação";

  return `${ufName} (${ambiente}): ${status.xMotivo} (${status.cStat})`;
}

/**
 * Helper function to check if SEFAZ is operational
 */
export function isSefazOperational(status: SefazStatusResponse): boolean {
  return status.cStat === SefazStatusCode.SERVICO_EM_OPERACAO;
}

/**
 * Request parameters for SEFAZ status consultation
 */
export interface SefazStatusRequest {
  uf?: string; // UF code (default: "35" - SP)
  ambiente?: SefazAmbiente; // Environment (default: "2" - Homologation)
}
