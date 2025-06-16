import { useState, useCallback } from "react";
import type { ApiResponse } from "@/lib/mdfe-api-utils";

/**
 * Configuração padrão para requisições do frontend
 */
const FRONTEND_CONFIG = {
  timeout: 30000,
  userAgent: "MDFe-SaaS-Front/1.0",
} as const;

/**
 * Hook otimizado para envio de eventos MDFe
 * Responsabilidade: Interface React para APIs INTERNAS (/api/sefaz/*)
 */
interface UseEventoMdfeReturn {
  enviarEvento: <T = any>(
    endpoint: string,
    dados: any
  ) => Promise<ApiResponse<T> | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useEventoMdfe(): UseEventoMdfeReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviarEvento = useCallback(
    async <T = any>(
      endpoint: string,
      dados: any
    ): Promise<ApiResponse<T> | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/sefaz/${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": FRONTEND_CONFIG.userAgent,
          },
          body: JSON.stringify(dados),
          signal: AbortSignal.timeout(FRONTEND_CONFIG.timeout),
        });

        const result = await response.json();

        if (!response.ok) {
          const errorMessage =
            result.error?.message || result.message || "Erro desconhecido";
          setError(errorMessage);
          return {
            success: false,
            error: {
              code: `HTTP_${response.status}`,
              message: errorMessage,
              details: result,
            },
          };
        }

        return {
          success: true,
          data: result.data,
          protocolo: result.protocolo,
        };
      } catch (err) {
        let errorMessage = "Erro inesperado na comunicação";
        let errorCode = "NETWORK_ERROR";

        if (err instanceof Error && err.name === "AbortError") {
          errorMessage = "Timeout na comunicação com a API";
          errorCode = "TIMEOUT_ERROR";
        }

        setError(errorMessage);
        return {
          success: false,
          error: {
            code: errorCode,
            message: errorMessage,
            details: err,
          },
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    enviarEvento,
    isLoading,
    error,
    clearError,
  };
}

/**
 * Hook conveniente para métodos específicos de eventos
 * Wrapper em torno do useEventoMdfe com métodos tipados
 */
interface UseEventoMdfeEspecificoReturn extends UseEventoMdfeReturn {
  cancelarMdfe: (dados: {
    mdfeId: string;
    justificativa: string;
  }) => Promise<ApiResponse | null>;
  encerrarMdfe: (dados: {
    mdfeId: string;
    dtEnc: string;
    cUF: string;
    cMun: string;
  }) => Promise<ApiResponse | null>;
  incluirCondutor: (dados: {
    mdfeId: string;
    condutor: {
      xNome: string;
      cpf: string;
    };
  }) => Promise<ApiResponse | null>;
}

export function useEventoMdfeEspecifico(): UseEventoMdfeEspecificoReturn {
  const { enviarEvento, isLoading, error, clearError } = useEventoMdfe();

  const cancelarMdfe = useCallback(
    async (dados: { mdfeId: string; justificativa: string }) => {
      return enviarEvento("cancelamento", dados);
    },
    [enviarEvento]
  );

  const encerrarMdfe = useCallback(
    async (dados: {
      mdfeId: string;
      dtEnc: string;
      cUF: string;
      cMun: string;
    }) => {
      return enviarEvento("encerramento", dados);
    },
    [enviarEvento]
  );

  const incluirCondutor = useCallback(
    async (dados: {
      mdfeId: string;
      condutor: {
        xNome: string;
        cpf: string;
      };
    }) => {
      return enviarEvento("inclusao-condutor", dados);
    },
    [enviarEvento]
  );

  return {
    enviarEvento,
    isLoading,
    error,
    clearError,
    cancelarMdfe,
    encerrarMdfe,
    incluirCondutor,
  };
}
