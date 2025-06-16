/**
 * Utilitários para API MDFe seguindo o padrão estabelecido em docs/00-padrao-envio-evento.md
 * Este arquivo centraliza funções utilitárias para uso no SERVIDOR (API routes)
 */

import {
  type MdfeCancelamentoRequest,
  type CancelamentoRespostaMDFe,
  type CancelamentoApiResponse,
  validarJustificativaCancelamento,
} from "@/types/MdfeCancelamentoTypes";

// ==================== TIPOS E INTERFACES GERAIS ====================

/**
 * Dados específicos retornados pela API MDfe após o processamento
 */
export interface RespostaMDFeData {
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
 * Estrutura padrão de resposta da API MDfe
 */
export interface RespostaMDFe {
  /** Código de status HTTP da resposta */
  status: number;
  /** Mensagem descritiva da operação */
  message: string;
  /** Dados específicos do MDfe (null em caso de erro) */
  data: RespostaMDFeData | null;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  protocolo?: string;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// ==================== TIPOS DE EVENTOS (PARA TIPAGEM APENAS) ====================

/**
 * Encerramento de MDfe
 */
export interface MdfeEncerramentoRequest {
  cnpjcpf: string;
  chaveMdfe: string;
  dtEnc: string;
  cUF: string;
  cMun: string;
  nSeqEvento: number;
  nProt: string;
}

/**
 * Inclusão de Condutor
 */
export interface MdfeInclusaoCondutorRequest {
  cnpjcpf: string;
  chaveMdfe: string;
  nSeqEvento: number;
  nProt: string;
  condutor: {
    xNome: string;
    cpf: string;
  };
}

/**
 * Pagamento de Operação de Transporte
 */
export interface MdfePagamentoOperacaoRequest {
  cnpjcpf: string;
  chaveMdfe: string;
  nSeqEvento: number;
  nProt: string;
  pagamento: {
    indPag: "0" | "1";
    vPag: string;
    indAntecipacao: "0" | "1";
    infPag: {
      PIX?: {
        qrCodPix: string;
      };
      cartao?: {
        tpIntegra: "1" | "2";
        CNPJ: string;
        bandeira?: string;
        cAut?: string;
      };
    };
  };
}

/**
 * Alteração de Pagamento de Serviço
 */
export interface MdfeAlteracaoPagamentoRequest {
  cnpjcpf: string;
  chaveMdfe: string;
  nSeqEvento: number;
  nProt: string;
  alteracao: {
    grupoAlteracao: "1" | "2" | "3";
    responsavelPagamento?: {
      respPag: "1" | "2" | "3" | "4";
      CNPJ?: string;
      CPF?: string;
    };
    componentesPagamento?: {
      vComp: string;
      xComp: string;
    }[];
  };
}

/**
 * Confirmação de Operação de Transporte
 */
export interface MdfeConfirmacaoOperacaoRequest {
  cnpjcpf: string;
  chaveMdfe: string;
  nSeqEvento: number;
  nProt: string;
  confirmacao: {
    cOrgao: string;
    tpEvento: "110112";
    nSeqEvento: number;
    dhEvento: string;
  };
}

// ==================== CONFIGURAÇÃO DA API EXTERNA ====================

/**
 * Configuração padrão da API externa MDfe (para uso no servidor)
 */
export const MDFE_API_CONFIG = {
  baseURL: process.env.MDFE_API_URL,
  token: process.env.MDFE_TOKEN,
  userAgent: "MDFe-SaaS-Front/1.0",
  timeout: 30000,
} as const;

/**
 * Headers padrão para requisições à API externa MDfe
 */
export const getDefaultHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${MDFE_API_CONFIG.token}`,
  "User-Agent": MDFE_API_CONFIG.userAgent,
});

// ==================== FUNÇÕES UTILITÁRIAS PARA SERVIDOR ====================

/**
 * Extrai dados base obrigatórios de um MDfe
 * @param mdfe - Objeto MDfe com dados já validados
 * @returns Dados base para envio de eventos
 */
export function extrairDadosBase(mdfe: any) {
  const cnpjcpf = mdfe.emit?.CNPJ;
  const chaveMdfe = mdfe.chave || mdfe.chMDFe;
  const nProt = mdfe.protocolo;

  if (!cnpjcpf || !chaveMdfe || !nProt) {
    throw new Error("Dados obrigatórios ausentes no MDfe");
  }

  return {
    cnpjcpf,
    chaveMdfe,
    nProt,
  };
}

/**
 * Função genérica para envio de eventos à API externa
 * IMPORTANTE: Esta função faz requisições à API EXTERNA, não aos endpoints internos
 */
export async function enviarEventoComTratamento<T = any>(
  endpoint: string,
  payload: any
): Promise<ApiResponse<T>> {
  try {
    const url = `${MDFE_API_CONFIG.baseURL}/evento/${endpoint}`;

    const response = await fetch(url, {
      method: "POST",
      headers: getDefaultHeaders(),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(MDFE_API_CONFIG.timeout),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: `HTTP_${response.status}`,
          message: result.message || "Erro desconhecido",
          details: result,
        },
      };
    }

    return {
      success: true,
      data: result,
      protocolo: result.data?.nProt,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        success: false,
        error: {
          code: "TIMEOUT_ERROR",
          message: "Timeout na comunicação com a API MDfe",
          details: error,
        },
      };
    }

    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Erro de comunicação com o servidor",
        details: error,
      },
    };
  }
}

/**
 * Verifica se a resposta MDfe indica sucesso
 */
export function isRespostaSucesso(resposta: RespostaMDFe): boolean {
  return resposta.status === 200 && resposta.data !== null;
}

/**
 * Verifica se o evento foi autorizado pela SEFAZ
 */
export function isEventoAutorizado(
  resposta: RespostaMDFe | CancelamentoRespostaMDFe
): boolean {
  if (!resposta.data) return false;

  const statusSucesso = [100, 101, 135, 136];
  return statusSucesso.includes(resposta.data.cStat);
}

/**
 * Extrai informações essenciais da resposta
 */
export function extrairInfoResposta(
  resposta: RespostaMDFe | CancelamentoRespostaMDFe
) {
  if (!resposta.data) {
    return {
      sucesso: false,
      erro: resposta.message,
      protocolo: null,
      dataProcessamento: null,
      statusSefaz: null,
    };
  }

  return {
    sucesso: isEventoAutorizado(resposta),
    erro: !isEventoAutorizado(resposta) ? resposta.data.xMotivo : null,
    protocolo: resposta.data.nProt,
    dataProcessamento: resposta.data.dataProcessamento,
    chave: resposta.data.chMDFe,
    statusSefaz: resposta.data.cStat,
  };
}

/**
 * Validação de justificativa (delega para função específica)
 */
export function validarJustificativa(justificativa: string): boolean {
  return validarJustificativaCancelamento(justificativa);
}

// ==================== CONSTANTES ====================

/**
 * Códigos de status SEFAZ mais comuns
 */
export const STATUS_SEFAZ = {
  AUTORIZADO: 100,
  CANCELADO: 101,
  EVENTO_REGISTRADO: 135,
  ENCERRADO: 136,
  DUPLICIDADE_EVENTO: 204,
  EVENTO_NAO_PERMITIDO: 573,
} as const;

/**
 * Tipos de ambiente SEFAZ
 */
export const AMBIENTE_SEFAZ = {
  PRODUCAO: "1",
  HOMOLOGACAO: "2",
} as const;
