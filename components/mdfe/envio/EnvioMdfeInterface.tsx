"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Send, Loader2, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { generateMdfeNumber, updateMdfeStatus } from "@/actions/actMdfeEnvio";
import { MdfeDocument, MdfeStatus } from "@/types/MdfeEnvioTypes";

interface EnvioMdfeInterfaceProps {
  mdfe: MdfeDocument;
}

interface ErrorInfo {
  type: "api" | "network" | "validation";
  title: string;
  message: string;
  details?: string[];
  timestamp: Date;
}

export function EnvioMdfeInterface({ mdfe }: EnvioMdfeInterfaceProps) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  /**
   * Clear all errors
   */
  const clearErrors = () => {
    setErrors([]);
  };

  /**
   * Add error to the errors state
   */
  const addError = (error: Omit<ErrorInfo, "timestamp">) => {
    const newError: ErrorInfo = {
      ...error,
      timestamp: new Date(),
    };
    setErrors((prev) => [newError, ...prev]);
  };

  /**
   * Handle MDFe submission to SEFAZ
   * Automatically generates MDFe number if not present
   */
  const handleEnvioSefaz = () => {
    // Clear previous errors before starting new submission
    clearErrors();

    startTransition(async () => {
      try {
        if (!mdfe.id) {
          const errorInfo = {
            type: "validation" as const,
            title: "Erro de Validação",
            message: "ID do MDFe não encontrado",
            details: ["Verifique se o MDFe foi salvo corretamente"],
          };
          addError(errorInfo);
          toast({
            title: "Erro",
            description: "ID do MDFe não encontrado",
            variant: "destructive",
          });
          return;
        }

        // Check if MDFe number needs to be generated
        if (!hasNumber) {
          toast({
            title: "Gerando número",
            description: "Gerando número do MDFe automaticamente...",
          });

          const numberResponse = await generateMdfeNumber(mdfe.id);

          if (!numberResponse.success) {
            const errorInfo = {
              type: "api" as const,
              title: "Erro na Geração do Número",
              message: numberResponse.message || "Erro ao gerar número do MDFe",
              details: ["O número do MDFe é obrigatório para o envio"],
            };
            addError(errorInfo);

            toast({
              title: "Erro",
              description:
                numberResponse.message || "Erro ao gerar número do MDFe",
              variant: "destructive",
            });
            return;
          }

          toast({
            title: "Número gerado",
            description:
              "Número do MDFe gerado com sucesso. Prosseguindo com o envio...",
          });
        }

        // Make API call to SEFAZ
        const response = await fetch("/api/sefaz/envio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mdfeId: mdfe.id,
          }),
        });

        const result = await response.json();

        if (result.success) {
          if (result?.data?.cStat === 100) {
            toast({
              title: "Envio realizado",
              description: result.data.xMotivo || "MDFe enviado com sucesso",
            });
            router.push(`/mdfe/imprimir/?id=${mdfe.id}`);
          } else {
            // MDFe was rejected by SEFAZ
            const errorInfo = {
              type: "api" as const,
              title: "MDFe Rejeitado pela SEFAZ",
              message: result.data.xMotivo || "MDFe foi rejeitado",
              details: result?.message || [],
            };
            addError(errorInfo);

            toast({
              title: "MDFe Rejeitado",
              description: result?.data?.xMotivo || "MDFe rejeitado pela SEFAZ",
              variant: "destructive",
            });
          }
        } else {
          // API call failed
          const errorInfo = {
            type: "api" as const,
            title: "Erro na API",
            message: result?.message || "Erro ao enviar para SEFAZ",
            details: result?.message?.errors || [],
          };
          addError(errorInfo);

          toast({
            title: "Erro no envio",
            description: result?.data?.message || "Erro ao enviar para SEFAZ",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erro no envio:", error);

        // Network or unexpected error
        const errorInfo = {
          type: "network" as const,
          title: "Erro de Conexão",
          message: "Ocorreu um erro durante o envio",
          details: [
            error instanceof Error ? error.message : "Erro desconhecido",
            "Verifique sua conexão com a internet",
            "Tente novamente em alguns minutos",
          ],
        };
        addError(errorInfo);

        toast({
          title: "Erro",
          description: "Ocorreu um erro durante o envio",
          variant: "destructive",
        });
      }
    });
  };

  const hasNumber = mdfe.ide?.nMDF;

  const canSendToSefaz =
    mdfe.status?.includes(MdfeStatus.PENDENTE) ||
    mdfe.status?.includes(MdfeStatus.ERRO);

  return (
    <div className="space-y-4">
      {/* Error Cards */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-red-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Erros no Envio
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearErrors}
                className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {errors.map((error, index) => (
              <Alert key={index} variant="destructive" className="bg-white">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{error.title}</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>{error.message}</p>
                  {error.details && error.details.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Detalhes:</p>
                      <ul className="text-sm list-disc list-inside space-y-1 ml-2">
                        {error.details.map((detail, detailIndex) => (
                          <li key={detailIndex}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {error.timestamp.toLocaleString("pt-BR")}
                  </p>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Envio para SEFAZ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status atual */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Status atual</h4>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-muted rounded text-sm">
                {mdfe.status || "Não definido"}
              </div>
              {hasNumber && (
                <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                  Número: {mdfe.ide?.nMDF}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Enviar para SEFAZ */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Enviar para SEFAZ</h4>
            {canSendToSefaz && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {!hasNumber
                    ? "O número será gerado automaticamente antes do envio."
                    : "MDFe pronto para envio. Clique para transmitir para SEFAZ."}
                </p>
                <Button
                  onClick={handleEnvioSefaz}
                  disabled={isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar para SEFAZ
                    </>
                  )}
                </Button>
              </div>
            )}
            {!canSendToSefaz && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                Status deve ser 'VALIDADO' para envio
              </div>
            )}
          </div>

          {/* Status de envio já realizado */}
          {[
            MdfeStatus.AUTORIZADO,
            MdfeStatus.REJEITADO,
            MdfeStatus.ENCERRADO,
            MdfeStatus.CANCELADO,
          ].includes(mdfe.status as MdfeStatus) && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                Este MDFe já foi processado pela SEFAZ com status: {mdfe.status}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
