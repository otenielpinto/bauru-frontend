"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, FileText } from "lucide-react";

interface InfoSectionProps {
  mdfe: any;
}

/**
 * InfoSection Component
 *
 * Displays comprehensive MDFe information including emitter data,
 * transport details, routes, and cargo information.
 */
export function InfoSection({ mdfe }: InfoSectionProps) {
  /**
   * Formats date for display
   */
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "Não informado";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR");
    } catch {
      return "Data inválida";
    }
  };

  /**
   * Formats CNPJ/CPF for display
   */
  const formatDocument = (doc: string, type: "CNPJ" | "CPF" = "CNPJ") => {
    if (!doc) return "";

    if (type === "CNPJ" && doc.length === 14) {
      return doc.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }

    if (type === "CPF" && doc.length === 11) {
      return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    return doc;
  };

  /**
   * Gets vehicle type description
   */
  const getVehicleTypeDescription = (type: string) => {
    const types: Record<string, string> = {
      "01": "Caminhão",
      "02": "Cavalo Mecânico",
      "03": "Reboque",
      "04": "Semi-reboque",
      "05": "Navio",
      "06": "Balsa",
      "07": "Aeronave",
    };

    return types[type] || type || "Não informado";
  };

  return (
    <div className="space-y-6">
      {/* Emitter Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Dados do Emitente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mdfe.emit ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="md:col-span-2">
                <span className="font-medium text-muted-foreground">
                  Razão Social:
                </span>
                <p className="font-medium">
                  {mdfe.emit.xNome || "Não informado"}
                </p>
              </div>

              <div>
                <span className="font-medium text-muted-foreground">CNPJ:</span>
                <p className="font-mono">
                  {formatDocument(mdfe.emit.CNPJ, "CNPJ") || "Não informado"}
                </p>
              </div>

              {mdfe.emit.IE && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Inscrição Estadual:
                  </span>
                  <p>{mdfe.emit.IE}</p>
                </div>
              )}

              {mdfe.emit.enderEmit && (
                <>
                  <div className="md:col-span-2">
                    <span className="font-medium text-muted-foreground">
                      Endereço:
                    </span>
                    <p>
                      {[
                        mdfe.emit.enderEmit.xLgr,
                        mdfe.emit.enderEmit.nro,
                        mdfe.emit.enderEmit.xCpl,
                        mdfe.emit.enderEmit.xBairro,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>

                  <div>
                    <span className="font-medium text-muted-foreground">
                      Cidade/UF:
                    </span>
                    <p>
                      {mdfe.emit.enderEmit.xMun}/{mdfe.emit.enderEmit.UF}
                    </p>
                  </div>

                  <div>
                    <span className="font-medium text-muted-foreground">
                      CEP:
                    </span>
                    <p className="font-mono">
                      {mdfe.emit.enderEmit.CEP || "Não informado"}
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Informações do emitente não disponíveis
            </p>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      {mdfe.infAdic && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações Adicionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              {mdfe.infAdic.infAdFisco && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Informações Adicionais de Interesse do Fisco:
                  </span>
                  <p className="bg-muted/50 p-2 rounded mt-1">
                    {mdfe.infAdic.infAdFisco}
                  </p>
                </div>
              )}

              {mdfe.infAdic.infCpl && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Informações Complementares:
                  </span>
                  <p className="bg-muted/50 p-2 rounded mt-1">
                    {mdfe.infAdic.infCpl}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
