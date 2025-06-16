import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getMdfeById } from "@/actions/actMdfeEnvio";
import { getArquivosByChave } from "@/actions/actMdfeArquivo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { DownloadActions, StatusSection, InfoSection } from "./components";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

/**
 * DAMFE Print Page
 *
 * This page displays MDFe information and provides printing/download functionality.
 * It fetches MDFe data by ObjectId and retrieves associated XML and PDF files.
 */
export default async function ImprimirDamfePage({ searchParams }: PageProps) {
  const { id } = await searchParams;

  // Validate ID parameter
  if (!id) {
    return (
      <div className="space-y-6">
        <Link href="/mdfe">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para MDFe
          </Button>
        </Link>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Parâmetro obrigatório</AlertTitle>
          <AlertDescription>
            O ID do MDFe é obrigatório para exibir a página de impressão.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Fetch MDFe data
  const mdfeResponse = await getMdfeById(id);

  if (!mdfeResponse.success || !mdfeResponse.data) {
    if (mdfeResponse.error === "UNAUTHORIZED") {
      return (
        <div className="space-y-6">
          <Link href="/mdfe">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para MDFe
            </Button>
          </Link>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Acesso negado</AlertTitle>
            <AlertDescription>
              Você não tem permissão para acessar este MDFe.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return notFound();
  }

  const mdfe = mdfeResponse.data;

  // Fetch XML and PDF files if chave exists
  let xmlData = null;
  let pdfData = null;

  if (mdfe.chave) {
    const arquivosResponse = await getArquivosByChave(mdfe.chave);

    if (arquivosResponse.success && arquivosResponse.data) {
      xmlData = arquivosResponse.data.xml
        ? { xml: arquivosResponse.data.xml, chave: arquivosResponse.data.chave }
        : null;
      pdfData = arquivosResponse.data.pdfBase64
        ? {
            pdfBase64: arquivosResponse.data.pdfBase64,
            chave: arquivosResponse.data.chave,
          }
        : null;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <Link href="/mdfe">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para MDFe
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Impressão de DAMFE</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - Status and Info */}
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<div>Carregando status...</div>}>
            <StatusSection mdfe={mdfe} />
          </Suspense>

          <Suspense fallback={<div>Carregando informações...</div>}>
            <InfoSection mdfe={mdfe} />
          </Suspense>
        </div>

        {/* Sidebar - Download Actions */}
        <div className="space-y-6">
          <Suspense fallback={<div>Carregando ações...</div>}>
            <DownloadActions mdfe={mdfe} xmlData={xmlData} pdfData={pdfData} />
          </Suspense>

          {/* Document Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações do Documento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">
                    ID do Documento:
                  </span>
                  <p className="font-mono text-xs break-all">{mdfe._id}</p>
                </div>

                {mdfe.ide?.serie && (
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Série:
                    </span>
                    <p>{mdfe.ide.serie}</p>
                  </div>
                )}

                {mdfe.ide?.nMDF && (
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Número:
                    </span>
                    <p>{mdfe.ide.nMDF}</p>
                  </div>
                )}

                {mdfe.ide?.dtEmi && (
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Data de Emissão:
                    </span>
                    <p>
                      {new Date(mdfe.ide.dtEmi).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}

                {mdfe.emit?.xNome && (
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Emitente:
                    </span>
                    <p>{mdfe.emit.xNome}</p>
                  </div>
                )}

                {mdfe.emit?.CNPJ && (
                  <div>
                    <span className="font-medium text-muted-foreground">
                      CNPJ:
                    </span>
                    <p className="font-mono">{mdfe.emit.CNPJ}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Available Files Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status dos Arquivos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Arquivo XML</span>
                {xmlData ? (
                  <Badge
                    variant="default"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Disponível
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Indisponível
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Arquivo PDF</span>
                {pdfData?.pdfBase64 ? (
                  <Badge
                    variant="default"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Disponível
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Indisponível
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
