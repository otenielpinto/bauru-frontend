"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getMdfeById } from "@/actions/actMdfeEnvio";
import { EncerrarMdfeForm } from "@/components/mdfe/EncerrarMdfeForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { canEncerrarMdfe } from "@/types/MdfeEncerramentoTypes";

/**
 * Componente de loading para a página
 */
function EncerrarMdfeLoading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
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
          Não é possível encerrar o MDFe
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
                {reason || "Status inválido para encerramento"}
              </p>
              <p className="mt-4 text-sm">
                <strong>Status válido para encerramento:</strong> AUTORIZADO
              </p>
              <p className="text-sm">
                <strong>Prazo legal:</strong> Até 30 dias após a autorização
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
 * Página principal de encerramento de MDFe
 */
export default function EncerrarMdfePage() {
  const params = useParams();
  const id = params.id as string;
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
        const mdfeResponse = await getMdfeById(id);

        if (!mdfeResponse.success || !mdfeResponse.data) {
          setError("MDFe não encontrado. Verifique o ID e tente novamente.");
        } else {
          setMdfe(mdfeResponse.data);
        }
      } catch (err) {
        setError("Erro ao carregar dados do MDFe. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    fetchMdfe();
  }, [id]);

  // Loading state
  if (loading) {
    return <EncerrarMdfeLoading />;
  }

  // Error states
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
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

  // Verificar se pode encerrar o MDFe
  const validation = canEncerrarMdfe(mdfe.status, mdfe.dataHoraAutorizacao);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header da página */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Encerrar MDFe</h1>
          <p className="text-gray-600 mt-1">
            Registrar encerramento do transporte na SEFAZ
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
      {validation.canEncerrar ? (
        <Suspense fallback={<EncerrarMdfeLoading />}>
          <EncerrarMdfeForm mdfeId={id} chave={mdfe.chave} />
        </Suspense>
      ) : (
        <StatusErrorAlert
          currentStatus={mdfe.status}
          mdfeId={id}
          reason={validation.reason}
        />
      )}
    </div>
  );
}
