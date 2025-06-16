"use client";

import { SefazStatus } from "@/components/sefaz/SefazStatus";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wifi } from "lucide-react";
import Link from "next/link";

/**
 * Página de Consulta de Status da SEFAZ
 *
 * Esta página permite consultar o status dos serviços da SEFAZ para diferentes
 * UFs e ambientes (Produção/Homologação), essencial para verificar a
 * disponibilidade dos serviços antes de realizar operações como envio de MDF-e.
 */
export default function SefazStatusPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wifi className="h-6 w-6" />
            Status dos Serviços SEFAZ
          </h1>
          <p className="text-muted-foreground">
            Consulte a disponibilidade dos serviços da Secretaria da Fazenda em
            tempo real para diferentes ambientes
          </p>
        </div>
        <Link href="/mdfe">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      {/* Main Status Component */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Consultation */}
        <div className="lg:col-span-3">
          <SefazStatus
            defaultUF="43"
            defaultAmbiente="1"
            autoRefresh={false}
            refreshInterval={300000}
          />
        </div>
      </div>
    </div>
  );
}
