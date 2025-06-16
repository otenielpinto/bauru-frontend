import { z } from "zod";

/**
 * Schema de validação para consulta de MDF-e não encerrados
 */
export const ConsultaMdfeNaoEncerradosSchema = z.object({
  cnpj: z
    .string()
    .min(1, "CNPJ é obrigatório")
    .regex(/^\d{14}$/, "CNPJ deve conter exatamente 14 dígitos"),
});

/**
 * Interface para um MDF-e não encerrado
 */
export interface MdfeNaoEncerrado {
  chMDFe: string;
  nProt: string;
}

/**
 * Interface para resposta da API de consulta
 */
export interface ConsultaMdfeNaoEncerradosResponse {
  success: boolean;
  message: string;
  data?: {
    items: MdfeNaoEncerrado[];
  };
  error?: string;
}

/**
 * Type inference from Zod schema
 */
export type ConsultaMdfeNaoEncerradosData = z.infer<
  typeof ConsultaMdfeNaoEncerradosSchema
>;
