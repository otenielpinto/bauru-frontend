import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMdfeById } from "@/actions/actMdfeEnvio";

/**
 * Hook customizado para buscar dados de MDFe por ID usando React Query
 * @param id - ID do MDFe
 * @returns Query result com dados, estados de loading/error e funções utilitárias
 */
export const useMdfeById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["mdfeEnvio", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("ID do MDFe não fornecido");
      }

      const mdfeResponse = await getMdfeById(id);

      if (!mdfeResponse.success) {
        throw new Error("MDFe não encontrado");
      }

      return mdfeResponse.data;
    },
    enabled: !!id, // Only run query if id exists
    staleTime: 1000 * 60 * 2, // 2 minutes - data considered fresh
    gcTime: 1000 * 60 * 10, // 10 minutes - cache garbage collection time
    retry: (failureCount, error) => {
      // Don't retry for client errors (4xx), but retry for server errors (5xx)
      if (error instanceof Error && error.message.includes("não encontrado")) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

/**
 * Hook para invalidar cache do MDFe específico
 * Útil após operações de update/delete
 */
export const useInvalidateMdfe = () => {
  const queryClient = useQueryClient();

  return {
    invalidateMdfe: (id: string) => {
      queryClient.invalidateQueries({ queryKey: ["mdfeEnvio", id] });
    },
    invalidateAllMdfe: () => {
      queryClient.invalidateQueries({ queryKey: ["mdfeEnvio"] });
    },
    refetchMdfe: (id: string) => {
      queryClient.refetchQueries({ queryKey: ["mdfeEnvio", id] });
    },
  };
};
