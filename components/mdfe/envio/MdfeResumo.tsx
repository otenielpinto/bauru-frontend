"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Building, MapPin, Truck } from "lucide-react";
import { MdfeStatus } from "@/types/MdfeEnvioTypes";

interface MdfeResumoProps {
  mdfe: any;
}

export function MdfeResumo({ mdfe }: MdfeResumoProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case MdfeStatus.PENDENTE:
        return "bg-yellow-100 text-yellow-800";
      case MdfeStatus.AUTORIZADO:
        return "bg-emerald-100 text-emerald-800";
      case MdfeStatus.REJEITADO:
        return "bg-red-100 text-red-800";
      case MdfeStatus.ERRO:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "N/A";

    let date: Date;
    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === "string") {
      date = new Date(dateValue);
    } else {
      return "N/A";
    }

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Resumo do MDFe</CardTitle>
          <Badge className={getStatusColor(mdfe.status)}>{mdfe.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Building className="h-4 w-4" />
              Emitente
            </div>
            <div className="text-sm text-muted-foreground">
              <p>{mdfe.emit?.xNome || "N/A"}</p>
              <p>CNPJ: {mdfe.emit?.CNPJ || "N/A"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Emissão
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Série: {mdfe.ide?.serie || "N/A"}</p>
              <p>Número: {mdfe.ide?.nMDF || "N/A"}</p>
              <p>Data: {formatDate(mdfe.ide?.dtEmi)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4" />
              Percurso
            </div>
            <div className="text-sm text-muted-foreground">
              <p>UF Início: {mdfe.ide?.UFIni || "N/A"}</p>
              <p>UF Fim: {mdfe.ide?.UFFim || "N/A"}</p>
              <p>
                Modal:{" "}
                {mdfe.ide?.modal === "1"
                  ? "Rodoviário"
                  : mdfe.ide?.modal || "N/A"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Truck className="h-4 w-4" />
              Veículo
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Placa: {mdfe.infModal?.rodo?.veicTracao?.placa || "N/A"}</p>
              <p>
                RENAVAM: {mdfe.infModal?.rodo?.veicTracao?.RENAVAM || "N/A"}
              </p>
            </div>
          </div>

          {mdfe.ide?.nMDF && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Building className="h-4 w-4" />
                Identificação
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  MDFe: {mdfe.ide.serie}/{mdfe.ide.nMDF}
                </p>
                <p>Modelo: {mdfe.ide?.mod || "58"}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
