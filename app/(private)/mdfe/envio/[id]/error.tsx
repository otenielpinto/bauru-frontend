"use client";

import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para monitoramento
    console.error("Erro na página de envio MDFe:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/mdfe">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para MDFes
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Erro no Carregamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Ocorreu um erro inesperado</AlertTitle>
            <AlertDescription>
              <div className="space-y-3 mt-3">
                <p>
                  Não foi possível carregar a página de envio do MDFe. Isso pode
                  ter ocorrido devido a:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Problema de conexão com o servidor</li>
                  <li>MDFe não encontrado ou sem permissão de acesso</li>
                  <li>Erro temporário no sistema</li>
                  <li>Dados do MDFe corrompidos</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          <div className="mt-6 space-y-4">
            <div className="flex gap-3">
              <Button onClick={reset} variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>

              <Link href="/mdfe">
                <Button variant="outline">Voltar para Lista de MDFes</Button>
              </Link>
            </div>

            {error.digest && (
              <div className="text-xs text-muted-foreground">
                <p>Código do erro: {error.digest}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
