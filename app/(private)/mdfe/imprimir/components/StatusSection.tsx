"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileCheck,
  Send,
  Ban,
  Calendar,
} from "lucide-react";
import { MdfeStatus } from "@/types/MdfeEnvioTypes";

interface StatusSectionProps {
  mdfe: any;
}

/**
 * StatusSection Component
 *
 * Displays the current status of the MDFe document with appropriate
 * visual indicators and contextual information.
 */
export function StatusSection({ mdfe }: StatusSectionProps) {
  /**
   * Gets status information including badge variant and icon
   */
  const getStatusInfo = (status: string) => {
    const statusUpper = status?.toLocaleLowerCase() || "";

    switch (statusUpper) {
      case MdfeStatus.AUTORIZADO:
        return {
          label: "Autorizado",
          variant: "default" as const,
          icon: CheckCircle,
          color: "bg-green-500 hover:bg-green-600",
          description: "MDFe foi autorizado pela SEFAZ e está válido para uso",
          canPrint: true,
        };
      case MdfeStatus.PENDENTE:
        return {
          label: "Pendente",
          variant: "outline" as const,
          icon: Clock,
          color: "bg-yellow-500 hover:bg-yellow-600",
          description: "MDFe está aguardando processamento pela SEFAZ",
          canPrint: false,
        };
      case MdfeStatus.REJEITADO:
        return {
          label: "Rejeitado",
          variant: "destructive" as const,
          icon: XCircle,
          color: "",
          description: "MDFe foi rejeitado pela SEFAZ devido a inconsistências",
          canPrint: false,
        };
      case MdfeStatus.DENEGADO:
        return {
          label: "Denegado",
          variant: "destructive" as const,
          icon: Ban,
          color: "",
          description: "MDFe foi denegado pela SEFAZ",
          canPrint: false,
        };
      case MdfeStatus.ENCERRADO:
        return {
          label: "Encerrado",
          variant: "default" as const,
          icon: FileCheck,
          color: "bg-blue-500 hover:bg-blue-600",
          description: "MDFe foi encerrado com sucesso",
          canPrint: true,
        };
      case MdfeStatus.CANCELADO:
        return {
          label: "Cancelado",
          variant: "destructive" as const,
          icon: Ban,
          color: "bg-orange-500 hover:bg-orange-600",
          description: "MDFe foi cancelado",
          canPrint: false,
        };
      case MdfeStatus.ERRO:
        return {
          label: "Erro",
          variant: "destructive" as const,
          icon: AlertTriangle,
          color: "",
          description: "Ocorreu um erro no processamento do MDFe",
          canPrint: false,
        };
      default:
        return {
          label: status || "Indefinido",
          variant: "outline" as const,
          icon: Clock,
          color: "",
          description: "Status não reconhecido",
          canPrint: false,
        };
    }
  };

  const statusInfo = getStatusInfo(mdfe.status);
  const StatusIcon = statusInfo.icon;

  /**
   * Formats timestamp for display
   */
  const formatTimestamp = (timestamp: string | Date) => {
    if (!timestamp) return "Não informado";

    try {
      const date = new Date(timestamp);
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "Data inválida";
    }
  };

  /**
   * Gets protocol information display
   */
  const getProtocolInfo = () => {
    if (mdfe.protocolo) {
      return {
        number: mdfe.protocolo,
        type: "Autorização",
        timestamp: mdfe.dataHoraAutorizacao,
      };
    }

    if (mdfe.protocoloRejeicao) {
      return {
        number: mdfe.protocoloRejeicao,
        type: "Rejeição",
        timestamp: mdfe.dataHoraRejeicao,
      };
    }

    return null;
  };

  const protocolInfo = getProtocolInfo();

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Status do Documento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className="h-6 w-6 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Status Atual</h3>
                <p className="text-sm text-muted-foreground">
                  {statusInfo.description}
                </p>
              </div>
            </div>
            <Badge variant={statusInfo.variant} className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
          </div>

          {/* Processing Timeline */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Linha do Tempo</h4>
            <div className="space-y-3">
              {/* Creation */}
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-medium">Documento criado</span>
                  <p className="text-muted-foreground">
                    {formatTimestamp(mdfe.createdAt)}
                  </p>
                </div>
              </div>

              {/* Submission */}
              {mdfe.dataEnvio && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-medium">Enviado para SEFAZ</span>
                    <p className="text-muted-foreground">
                      {formatTimestamp(mdfe.dataEnvio)}
                    </p>
                  </div>
                </div>
              )}

              {/* Processing Result */}
              {(mdfe.dataHoraAutorizacao || mdfe.dataHoraRejeicao) && (
                <div className="flex items-center gap-3 text-sm">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      statusInfo.variant === "destructive"
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  />
                  <div className="flex-1">
                    <span className="font-medium">
                      {statusInfo.variant === "destructive"
                        ? "Processamento rejeitado"
                        : "Processamento concluído"}
                    </span>
                    <p className="text-muted-foreground">
                      {formatTimestamp(
                        mdfe.dataHoraAutorizacao || mdfe.dataHoraRejeicao
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Protocol Information */}
          {protocolInfo && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-2">
                Informações do Protocolo
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">
                    Número do Protocolo:
                  </span>
                  <p className="font-mono">{protocolInfo.number}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Tipo:
                  </span>
                  <p>{protocolInfo.type}</p>
                </div>
                {protocolInfo.timestamp && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-muted-foreground">
                      Data/Hora:
                    </span>
                    <p>{formatTimestamp(protocolInfo.timestamp)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Access Key */}
          {mdfe.chave && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">Chave de Acesso:</span>
              </div>
              <p className="font-mono text-xs bg-muted p-2 rounded break-all">
                {mdfe.chave}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status-specific alerts */}
      {!statusInfo.canPrint && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Documento não disponível para impressão</AlertTitle>
          <AlertDescription>
            {statusInfo.variant === "destructive"
              ? "Este documento não pode ser impresso devido ao seu status atual. Verifique os erros e corrija-os antes de tentar novamente."
              : "Este documento ainda está sendo processado. Aguarde a conclusão do processamento para poder imprimir."}
          </AlertDescription>
        </Alert>
      )}

      {statusInfo.canPrint && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Documento disponível para impressão</AlertTitle>
          <AlertDescription>
            Este documento está autorizado e pode ser impresso. Use as opções na
            barra lateral para baixar ou imprimir os arquivos.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
