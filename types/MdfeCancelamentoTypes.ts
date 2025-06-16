import { z } from "zod";

// ==================== SCHEMAS DE VALIDAÇÃO ====================

/**
 * Schema de validação para cancelamento de MDFe (formato antigo - manter para compatibilidade)
 */
export const CancelarMdfeSchema = z.object({
  mdfeId: z.string().min(1, "ID do MDFe é obrigatório"),
  justificativa: z
    .string()
    .min(15, "Justificativa deve ter no mínimo 15 caracteres")
    .max(255, "Justificativa deve ter no máximo 255 caracteres"),
  dataEvento: z.string().datetime().optional(),
});

/**
 * Schema padronizado para cancelamento seguindo o padrão de eventos
 */
export const CancelarMdfePadraoSchema = z.object({
  cnpjcpf: z
    .string()
    .min(11, "CNPJ deve ter 14 dígitos ou CPF 11 dígitos")
    .max(14, "CNPJ deve ter 14 dígitos ou CPF 11 dígitos")
    .regex(/^\d+$/, "CNPJ/CPF deve conter apenas números"),
  chaveMdfe: z
    .string()
    .length(44, "Chave MDFe deve ter exatamente 44 dígitos")
    .regex(/^\d+$/, "Chave MDFe deve conter apenas números"),
  justificativa: z
    .string()
    .min(15, "Justificativa deve ter no mínimo 15 caracteres")
    .max(255, "Justificativa deve ter no máximo 255 caracteres"),
  nSeqEvento: z
    .number()
    .min(1, "Número sequencial deve ser no mínimo 1")
    .max(20, "Número sequencial deve ser no máximo 20"),
  nProt: z.string().min(1, "Protocolo de autorização é obrigatório"),
});

// ==================== INTERFACES PADRONIZADAS ====================

/**
 * Dados específicos retornados pela API MDfe após o processamento de cancelamento
 */
export interface CancelamentoRespostaMDFeData {
  /** Data e hora do processamento no formato ISO 8601 */
  dataProcessamento: string;
  /** Número do lote enviado para processamento */
  nLote: string;
  /** Tipo de ambiente (1-Produção, 2-Homologação) */
  TpAmb: string;
  /** Versão da aplicação que processou o evento */
  verAplic: string;
  /** Código do status da operação na SEFAZ */
  cStat: number;
  /** Descrição textual do status da operação */
  xMotivo: string;
  /** Chave de acesso do MDfe (44 dígitos) */
  chMDFe: string;
  /** Data e hora do registro do evento no formato ISO 8601 */
  dhRegEvento: string;
  /** Número do protocolo de autorização */
  nProt: string;
  /** PDF do documento em Base64 (quando disponível) */
  pdfBase64: string | null;
  /** XML de retorno da SEFAZ (quando disponível) */
  xml: string | null;
}

/**
 * Estrutura padrão de resposta da API MDfe para cancelamento
 */
export interface CancelamentoRespostaMDFe {
  /** Código de status HTTP da resposta */
  status: number;
  /** Mensagem descritiva da operação */
  message: string;
  /** Dados específicos do MDfe (null em caso de erro) */
  data: CancelamentoRespostaMDFeData | null;
}

/**
 * Interface padronizada para cancelamento de MDFe seguindo padrão estabelecido
 */
export interface MdfeCancelamentoRequest {
  cnpjcpf: string; // CNPJ (14 dígitos) ou CPF (11 dígitos) sem formatação
  chaveMdfe: string; // Chave de acesso (44 dígitos)
  justificativa: string; // Mínimo 15 caracteres, máximo 255
  nSeqEvento: number; // Número sequencial do evento (1-20)
  nProt: string; // Protocolo de autorização obrigatório
}

/**
 * Resposta de erro padronizada
 */
export interface CancelamentoErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Resposta de sucesso padronizada
 */
export interface CancelamentoSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  protocolo?: string;
  statusSefaz?: number;
}

/**
 * Tipo união para resposta da API de cancelamento
 */
export type CancelamentoApiResponse<T = any> =
  | CancelamentoSuccessResponse<T>
  | CancelamentoErrorResponse;

// ==================== INTERFACES DE COMPATIBILIDADE ====================

/**
 * Interface para requisição de cancelamento (formato antigo - compatibilidade)
 */
export interface CancelarMdfeRequest {
  mdfeId: string;
  justificativa: string;
  dataEvento?: string;
}

/**
 * Interface padronizada para cancelamento de MDFe (novo formato)
 */
export interface CancelarMdfePadraoRequest {
  cnpjcpf: string; // CNPJ (14 dígitos) ou CPF (11 dígitos) sem formatação
  chaveMdfe: string; // Chave de acesso (44 dígitos)
  justificativa: string; // Mínimo 15 caracteres, máximo 255
  nSeqEvento: number; // Número sequencial do evento (1-20)
}

/**
 * Interface para conversão entre formatos antigo e novo
 */
export interface CancelarMdfeConversaoRequest {
  mdfeId: string;
  justificativa: string;
  dataEvento?: string;
  // Campos adicionais necessários para o padrão
  cnpjcpf?: string;
  chaveMdfe?: string;
  nSeqEvento?: number;
}

/**
 * Interface para resposta da SEFAZ no cancelamento (formato antigo)
 */
export interface SefazCancelaResponse {
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
 * Interface para payload enviado à SEFAZ (formato antigo)
 */
export interface CancelaEventoPayload {
  chave: string;
  tpEvento: "110111"; // Código do evento de cancelamento
  nSeqEvento: number;
  detEvento: {
    nProt: string;
    xJust: string; // Justificativa do cancelamento
  };
}

// ==================== TYPE INFERENCE ====================

/**
 * Type inference from Zod schemas
 */
export type CancelarMdfeData = z.infer<typeof CancelarMdfeSchema>;
export type CancelarMdfePadraoData = z.infer<typeof CancelarMdfePadraoSchema>;

/**
 * Interface para resposta da API de cancelamento (formato antigo)
 */
export interface CancelarMdfeResponse {
  success: boolean;
  message: string;
  data?: SefazCancelaResponse;
  error?: string;
}

// ==================== UTILITÁRIOS DE VALIDAÇÃO ====================

/**
 * Validate if MDFe can be cancelado
 */
export function canCancelarMdfe(
  status: string,
  dataAutorizacao?: Date
): {
  canCancelar: boolean;
  reason?: string;
} {
  if (status !== "autorizado") {
    return {
      canCancelar: false,
      reason: "MDFe deve estar AUTORIZADO para cancelamento",
    };
  }

  if (dataAutorizacao) {
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - dataAutorizacao.getTime()) / (1000 * 60 * 60)
    );

    if (diffHours > 24) {
      return {
        canCancelar: false,
        reason: "Prazo legal para cancelamento expirado (24 horas)",
      };
    }
  }

  return { canCancelar: true };
}

/**
 * Validação de justificativa seguindo o padrão estabelecido
 */
export function validarJustificativaCancelamento(
  justificativa: string
): boolean {
  return justificativa.length >= 15 && justificativa.length <= 255;
}

// ==================== CONSTANTES ====================

/**
 * Códigos de status SEFAZ específicos para cancelamento
 */
export const CANCELAMENTO_STATUS_SEFAZ = {
  CANCELADO: 101,
  DUPLICIDADE_EVENTO: 204,
  EVENTO_NAO_PERMITIDO: 573,
} as const;

/**
 * Tipo de evento para cancelamento MDFe
 */
export const CANCELAMENTO_TIPO_EVENTO = "110111" as const;
