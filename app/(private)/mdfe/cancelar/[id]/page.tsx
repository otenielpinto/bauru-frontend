"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getMdfeById } from "@/actions/actMdfeEnvio";
import { CancelarMdfeForm } from "@/components/mdfe/CancelarMdfeForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { canCancelarMdfe } from "@/types/MdfeCancelamentoTypes";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

/**
 * Componente de loading para a página
 */
function CancelarMdfeLoading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente para exibir erro de status inválido
 */
function StatusErrorAlert({
  currentStatus,
  mdfeId,
  reason,
}: {
  currentStatus: string;
  mdfeId: string;
  reason?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          Não é possível cancelar o MDFe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>Status atual:</strong> {currentStatus}
              </p>
              <p>
                <strong>Motivo:</strong>{" "}
                {reason || "Status inválido para cancelamento"}
              </p>
              <p className="mt-4 text-sm">
                <strong>Status válido para cancelamento:</strong> AUTORIZADO
              </p>
              <p className="text-sm">
                <strong>Prazo legal:</strong> Até 24 horas após a autorização
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="mt-4 flex gap-2">
          <Button asChild variant="outline">
            <Link href="/mdfe">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Lista
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/mdfe/view/${mdfeId}`}>Ver Detalhes do MDFe</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Página principal de cancelamento de MDFe
 */
export default function CancelarMdfePage() {
  const { id } = useParams();
  const [mdfe, setMdfe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMdfe() {
      if (!id) {
        setError(
          "ID do MDFe não fornecido na URL. Verifique o link e tente novamente."
        );
        setLoading(false);
        return;
      }

      try {
        const mdfeResponse = await getMdfeById(id as string);

        if (!mdfeResponse.success || !mdfeResponse.data) {
          setError("MDFe não encontrado. Verifique o ID e tente novamente.");
        } else {
          setMdfe(mdfeResponse.data);
        }
      } catch (err) {
        setError("Erro ao carregar dados do MDFe.");
      } finally {
        setLoading(false);
      }
    }

    fetchMdfe();
  }, [id]);

  // Loading state
  if (loading) {
    return <CancelarMdfeLoading />;
  }

  // Error states
  if (error || !id) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error ||
              "ID do MDFe não fornecido na URL. Verifique o link e tente novamente."}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/mdfe">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Lista
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!mdfe) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            MDFe não encontrado. Verifique o ID e tente novamente.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/mdfe">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Lista
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Verificar se pode cancelar o MDFe
  const validation = canCancelarMdfe(mdfe.status, mdfe.dataHoraAutorizacao);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header da página */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cancelar MDFe</h1>
          <p className="text-gray-600 mt-1">
            Solicitar cancelamento do documento na SEFAZ
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/mdfe">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      {/* Conteúdo principal */}
      {validation.canCancelar ? (
        <Suspense fallback={<CancelarMdfeLoading />}>
          <CancelarMdfeForm mdfe={mdfe} />
        </Suspense>
      ) : (
        <StatusErrorAlert
          currentStatus={mdfe.status}
          mdfeId={id as string}
          reason={validation.reason}
        />
      )}
    </div>
  );
}
