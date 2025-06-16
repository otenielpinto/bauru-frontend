import { z } from "zod";

/**
 * Schema de validação para encerramento de MDFe
 */
export const EncerrarMdfeSchema = z.object({
  mdfeId: z.string().min(1, "ID do MDFe é obrigatório"),
  ufEncerramento: z.string().length(2, "UF deve ter 2 caracteres"),
  municipioEncerramento: z.string().min(1, "Município é obrigatório"),
  codigoMunicipio: z.number().min(1, "Código do município é obrigatório"),
  dataEncerramento: z.string().datetime().optional(),
  horaEncerramento: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
});

/**
 * Interface para requisição de encerramento
 */
export interface EncerrarMdfeRequest {
  mdfeId: string;
  ufEncerramento: string;
  municipioEncerramento: string;
  codigoMunicipio: number;
  dataEncerramento?: string;
  horaEncerramento?: string;
}

/**
 * Interface para resposta da SEFAZ no encerramento
 */
export interface SefazEncerraResponse {
  data: {
    protocolo: string;
    cStat: number;
    xMotivo: string;
    chave: string;
    dataProcessamento: string;
    xml?: string;
    pdfBase64?: string;
  };
}

/**
 * Interface para payload enviado à SEFAZ
 */
export interface EncerraEventoPayload {
  chave: string;
  tpEvento: "110112";
  nSeqEvento: number;
  detEvento: {
    nProt: string;
    cUFEncerramento: string;
    cMunEncerramento: number;
    dtEncerramento: string;
  };
}

/**
 * Type inference from Zod schema
 */
export type EncerrarMdfeData = z.infer<typeof EncerrarMdfeSchema>;

/**
 * Interface para resposta da API de encerramento
 */
export interface EncerrarMdfeResponse {
  success: boolean;
  message: string;
  data?: SefazEncerraResponse["data"];
  error?: string;
}

/**
 * Códigos UF para validação
 */
export const UF_CODES: Record<string, string> = {
  AC: "12",
  AL: "17",
  AP: "16",
  AM: "13",
  BA: "29",
  CE: "23",
  DF: "53",
  ES: "32",
  GO: "52",
  MA: "21",
  MT: "51",
  MS: "50",
  MG: "31",
  PA: "15",
  PB: "25",
  PR: "41",
  PE: "26",
  PI: "22",
  RJ: "33",
  RN: "24",
  RS: "43",
  RO: "11",
  RR: "14",
  SC: "42",
  SP: "35",
  SE: "28",
  TO: "27",
};

/**
 * Helper function to get UF code
 */
export function getUFCode(uf: string): string {
  return UF_CODES[uf.toUpperCase()] || "35"; // Default to SP
}

/**
 * Validate if MDFe can be encerrado
 */
export function canEncerrarMdfe(
  status: string,
  dataAutorizacao?: Date
): {
  canEncerrar: boolean;
  reason?: string;
} {
  if (status !== "autorizado") {
    return {
      canEncerrar: false,
      reason: "MDFe deve estar AUTORIZADO para encerramento",
    };
  }

  if (dataAutorizacao) {
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - dataAutorizacao.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays > 30) {
      return {
        canEncerrar: false,
        reason: "Prazo legal para encerramento expirado (30 dias)",
      };
    }
  }

  return { canEncerrar: true };
}
