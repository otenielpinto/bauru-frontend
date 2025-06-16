"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { useMdfeById } from "@/hooks/useMdfeById";
import { EnvioMdfeInterface } from "@/components/mdfe/envio/EnvioMdfeInterface";
import { StatusErrorAlert } from "@/components/mdfe/envio/StatusErrorAlert";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { MdfeStatus } from "@/types/MdfeEnvioTypes";

const ErrorAlert = ({ message }: { message: string }) => (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Erro</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

export default function EnvioMdfePage() {
  const params = useParams();
  const id = params.id as string;

  const { data: mdfeData, isLoading, error, isError } = useMdfeById(id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao carregar dados do MDFe";
    return <ErrorAlert message={errorMessage} />;
  }

  // Verificar se status permite envio
  const validStatuses = [MdfeStatus.PENDENTE, MdfeStatus.ERRO];
  const canSend = validStatuses.includes(mdfeData.status);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Envio de MDFe para SEFAZ
          </h1>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {!canSend ? (
                <StatusErrorAlert
                  currentStatus={mdfeData.status}
                  mdfeId={mdfeData.id || id}
                  serie={mdfeData.ide.serie}
                  numero={mdfeData.ide.nMDF}
                />
              ) : (
                <EnvioMdfeInterface mdfe={mdfeData} />
              )}
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
