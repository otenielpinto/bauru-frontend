"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Wifi,
  WifiOff,
  Globe,
} from "lucide-react";
import {
  SefazStatusResponse,
  SefazStatusApiResponse,
  SefazAmbiente,
  SefazStatusCode,
  UF_CODES,
  formatSefazStatus,
  isSefazOperational,
  getUFByCode,
} from "@/types/SefazStatusTypes";

/**
 * SEFAZ Status Component Props
 */
interface SefazStatusProps {
  defaultUF?: string;
  defaultAmbiente?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * SEFAZ Status Display Component
 */
export function SefazStatus({
  defaultUF = "43",
  defaultAmbiente = "1",
  autoRefresh = false,
  refreshInterval = 300000, // 5 minutes
}: SefazStatusProps) {
  const [status, setStatus] = useState<SefazStatusResponse | null>(null);
  const [selectedUF, setSelectedUF] = useState(defaultUF);
  // Fixar ambiente em produção - não será mais selecionável pelo usuário
  const selectedAmbiente = "1"; // Sempre produção
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  /**
   * Fetch SEFAZ status from API
   */
  const fetchSefazStatus = async (
    uf: string = selectedUF,
    ambiente: string = selectedAmbiente
  ) => {
    try {
      setError(null);

      const response = await fetch(
        `/api/sefaz/status?uf=${uf}&ambiente=${ambiente}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result: SefazStatusApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      if (result.success && result.data) {
        setStatus(result.data);
        setCached(result.cached || false);

        const statusMessage = isSefazOperational(result.data)
          ? "Serviço em operação"
          : "Serviço com problemas";

        toast({
          title: "Status atualizado",
          description: `${statusMessage} - ${formatSefazStatus(result.data)} `,
          variant: isSefazOperational(result.data) ? "default" : "destructive",
        });
      } else {
        throw new Error(result.error || "Resposta inválida da API");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      setStatus(null);
      setCached(false);

      toast({
        title: "Erro ao consultar status",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  /**
   * Handle manual refresh
   */
  const handleRefresh = () => {
    startTransition(() => {
      fetchSefazStatus();
    });
  };

  /**
   * Handle UF change
   */
  const handleUFChange = (newUF: string) => {
    setSelectedUF(newUF);
    startTransition(() => {
      fetchSefazStatus(newUF, selectedAmbiente);
    });
  };

  /**
   * Get status icon based on service status
   */
  const getStatusIcon = () => {
    if (!status) return <WifiOff className="h-5 w-5 text-gray-400" />;

    if (isSefazOperational(status)) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }

    switch (status.cStat) {
      case SefazStatusCode.SERVICO_PARALISADO_MOMENTANEAMENTE:
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case SefazStatusCode.SERVICO_PARALISADO_SEM_PREVISAO:
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    }
  };

  /**
   * Get status badge variant
   */
  const getStatusBadgeVariant = () => {
    if (!status) return "secondary";

    if (isSefazOperational(status)) return "default";

    switch (status.cStat) {
      case SefazStatusCode.SERVICO_PARALISADO_MOMENTANEAMENTE:
        return "outline";
      case SefazStatusCode.SERVICO_PARALISADO_SEM_PREVISAO:
        return "destructive";
      default:
        return "secondary";
    }
  };

  /**
   * Get environment label
   */
  const getAmbienteLabel = (tpAmb: string) => {
    return tpAmb === "1" ? "Produção" : "Homologação";
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString("pt-BR");
    } catch {
      return timestamp;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Status do Serviço SEFAZ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls - Removido o campo de ambiente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">UF:</label>
            <Select value={selectedUF} onValueChange={handleUFChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a UF" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(UF_CODES).map(([uf, code]) => (
                  <SelectItem key={uf} value={code.toString()}>
                    {uf} - {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleRefresh}
              disabled={isPending}
              variant="outline"
              size="default"
              className="w-full"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isPending ? "animate-spin" : ""}`}
              />
              {isPending ? "Consultando..." : "Atualizar"}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Erro:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Status Display */}
        {status && (
          <div className="space-y-4">
            {/* Main Status */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              {getStatusIcon()}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant={getStatusBadgeVariant()}>
                    {status.cStat}
                  </Badge>
                  <span className="font-medium">{status.xMotivo}</span>
                  <Badge
                    variant={status.tpAmb === "1" ? "default" : "secondary"}
                  >
                    {getAmbienteLabel(status.tpAmb)}
                  </Badge>
                  {cached && (
                    <Badge variant="outline" className="text-xs">
                      Cache
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {getUFByCode(status.cUF)} - {getAmbienteLabel(status.tpAmb)}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Ambiente (tpAmb):</span>
                <p className="text-muted-foreground">
                  {status.tpAmb} - {getAmbienteLabel(status.tpAmb)}
                </p>
              </div>

              <div>
                <span className="font-medium">Versão da Aplicação:</span>
                <p className="text-muted-foreground">{status.verAplic}</p>
              </div>

              <div>
                <span className="font-medium">Tempo Médio:</span>
                <p className="text-muted-foreground">{status.tMed}s</p>
              </div>

              <div>
                <span className="font-medium">Código da UF:</span>
                <p className="text-muted-foreground">{status.cUF}</p>
              </div>

              <div>
                <span className="font-medium">Data/Hora Recebimento:</span>
                <p className="text-muted-foreground">
                  {formatTimestamp(status.dhRecbto)}
                </p>
              </div>

              <div>
                <span className="font-medium">Data/Hora Retorno:</span>
                <p className="text-muted-foreground">
                  {formatTimestamp(status.dhRetorno)}
                </p>
              </div>
            </div>

            {/* Observations */}
            {status.xObs && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <span className="font-medium text-blue-800">Observações:</span>
                <p className="text-blue-700 text-sm mt-1">{status.xObs}</p>
              </div>
            )}
          </div>
        )}

        {/* Initial Load Message */}
        {!status && !error && !isPending && (
          <div className="text-center py-8 text-muted-foreground">
            <WifiOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>
              Selecione a UF e clique em "Atualizar" para consultar o status da
              SEFAZ
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
