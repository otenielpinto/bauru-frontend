"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, ArrowRight } from "lucide-react";
import Link from "next/link";
import { MdfeStatus } from "@/types/MdfeEnvioTypes";

interface StatusErrorAlertProps {
  currentStatus: string;
  mdfeId: string;
  serie?: string;
  numero?: string;
}

const getStatusInfo = (status: string) => {
  const statusMap: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
      description: string;
      nextSteps: string[];
    }
  > = {
    AUTORIZADO: {
      label: "Autorizado",
      variant: "default",
      description: "MDFe já foi autorizado pela SEFAZ",
      nextSteps: [
        "Visualizar o documento autorizado",
        "Fazer download do DAMDF-e",
        "Encerrar o MDFe quando necessário",
      ],
    },
    REJEITADO: {
      label: "Rejeitado",
      variant: "destructive",
      description: "MDFe foi rejeitado pela SEFAZ",
      nextSteps: [
        "Corrigir os erros de rejeição",
        "Editar o MDFe",
        "Tentar envio novamente",
      ],
    },
    CANCELADO: {
      label: "Cancelado",
      variant: "destructive",
      description: "MDFe foi cancelado",
      nextSteps: ["Criar um novo MDFe se necessário"],
    },
    ENCERRADO: {
      label: "Encerrado",
      variant: "secondary",
      description: "MDFe já foi encerrado",
      nextSteps: ["Consultar histórico do documento"],
    },
  };

  return (
    statusMap[status] || {
      label: status,
      variant: "outline" as const,
      description: "Status não reconhecido",
      nextSteps: [
        "Verificar status do documento",
        "Entrar em contato com o suporte",
      ],
    }
  );
};

export function StatusErrorAlert({
  currentStatus,
  mdfeId,
  serie,
  numero,
}: StatusErrorAlertProps) {
  const statusInfo = getStatusInfo(currentStatus);
  const validStatuses = [MdfeStatus.PENDENTE, MdfeStatus.ERRO];

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Não é possível enviar o MDFe</AlertTitle>
        <AlertDescription>
          <div className="space-y-3 mt-3">
            <div className="flex items-center gap-2">
              <span>Status atual:</span>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </div>

            <p className="text-sm">{statusInfo.description}</p>

            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm font-medium mb-2">
                Status válidos para envio:
              </p>
              <div className="flex gap-2 flex-wrap">
                {validStatuses.map((status) => (
                  <Badge key={status} variant="outline" className="text-xs">
                    {status}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Próximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {statusInfo.nextSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">
                    {index + 1}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t space-y-3">
            <div className="flex gap-3">
              <Link href={`/mdfe/view/${mdfeId}`}>
                <Button variant="outline" size="sm">
                  Visualizar MDFe
                </Button>
              </Link>

              {[MdfeStatus.ERRO, MdfeStatus.PENDENTE].includes(
                currentStatus as MdfeStatus
              ) && (
                <Link href={`/mdfe/new?id=${mdfeId}`}>
                  <Button variant="outline" size="sm">
                    Editar MDFe
                  </Button>
                </Link>
              )}

              <Link href="/mdfe">
                <Button variant="outline" size="sm">
                  Voltar para Lista
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do MDFe */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Documento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">ID:</span>
              <p className="text-muted-foreground">{mdfeId}</p>
            </div>
            <div>
              <span className="font-medium">Série:</span>
              <p className="text-muted-foreground">
                {serie || "Não informada"}
              </p>
            </div>
            <div>
              <span className="font-medium">Número:</span>
              <p className="text-muted-foreground">{numero || "Não gerado"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
