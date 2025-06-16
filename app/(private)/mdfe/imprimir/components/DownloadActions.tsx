"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  FileText,
  Copy,
  Printer,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface DownloadActionsProps {
  mdfe: any;
  xmlData: any;
  pdfData: any;
}

/**
 * DownloadActions Component
 *
 * Provides download and print functionality for XML and PDF files.
 * Handles file downloads, clipboard operations, and print actions.
 */
export function DownloadActions({
  mdfe,
  xmlData,
  pdfData,
}: DownloadActionsProps) {
  const { toast } = useToast();
  const [isDownloadingXml, setIsDownloadingXml] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  /**
   * Downloads XML file
   */
  const handleDownloadXml = async () => {
    if (!xmlData?.xml) {
      toast({
        title: "Erro",
        description: "Arquivo XML não disponível para download",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDownloadingXml(true);

      // Create blob from XML content
      const blob = new Blob([xmlData.xml], { type: "application/xml" });
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `mdfe-${mdfe.chave || mdfe._id}.xml`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Sucesso",
        description: "Arquivo XML baixado com sucesso",
      });
    } catch (error) {
      console.error("Error downloading XML:", error);
      toast({
        title: "Erro",
        description: "Erro ao baixar arquivo XML",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingXml(false);
    }
  };

  /**
   * Downloads PDF file
   */
  const handleDownloadPdf = async () => {
    if (!pdfData?.pdfBase64) {
      toast({
        title: "Erro",
        description: "Arquivo PDF não disponível para download",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDownloadingPdf(true);

      // Convert base64 to blob
      const byteCharacters = atob(pdfData.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `damfe-${mdfe.chave || mdfe._id}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Sucesso",
        description: "Arquivo PDF baixado com sucesso",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Erro",
        description: "Erro ao baixar arquivo PDF",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  /**
   * Opens PDF in new tab for printing
   */
  const handlePrintPdf = async () => {
    if (!pdfData?.pdfBase64) {
      toast({
        title: "Erro",
        description: "Arquivo PDF não disponível para impressão",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsPrinting(true);

      // Convert base64 to blob
      const byteCharacters = atob(pdfData.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);

      // Open in new tab for printing
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        throw new Error("Popup blocked");
      }

      toast({
        title: "Sucesso",
        description: "Arquivo PDF aberto para impressão",
      });
    } catch (error) {
      console.error("Error printing PDF:", error);
      toast({
        title: "Erro",
        description: "Erro ao abrir arquivo PDF para impressão",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  /**
   * Copies access key to clipboard
   */
  const handleCopyChave = async () => {
    if (!mdfe.chave) {
      toast({
        title: "Erro",
        description: "Chave de acesso não disponível",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(mdfe.chave);
      toast({
        title: "Sucesso",
        description: "Chave de acesso copiada para a área de transferência",
      });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        title: "Erro",
        description: "Erro ao copiar chave de acesso",
        variant: "destructive",
      });
    }
  };

  /**
   * Opens PDF in new tab for visualization
   */
  const handleViewPdf = () => {
    if (!pdfData?.pdfBase64) {
      toast({
        title: "Erro",
        description: "Arquivo PDF não disponível para visualização",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert base64 to blob
      const byteCharacters = atob(pdfData.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");

      toast({
        title: "Sucesso",
        description: "Arquivo PDF aberto para visualização",
      });
    } catch (error) {
      console.error("Error viewing PDF:", error);
      toast({
        title: "Erro",
        description: "Erro ao abrir arquivo PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Ações de Download e Impressão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Access Key Section */}
        {mdfe.chave && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Chave de Acesso</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyChave}
                className="h-6 px-2"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="font-mono text-xs break-all bg-muted p-2 rounded">
              {mdfe.chave}
            </p>
          </div>
        )}

        {/* XML Actions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Arquivo XML</span>
            {xmlData ? (
              <Badge
                variant="default"
                className="bg-green-500 hover:bg-green-600 text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Disponível
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                <XCircle className="h-3 w-3 mr-1" />
                Indisponível
              </Badge>
            )}
          </div>

          <Button
            onClick={handleDownloadXml}
            disabled={!xmlData || isDownloadingXml}
            className="w-full"
            variant={xmlData ? "default" : "secondary"}
          >
            <FileText className="h-4 w-4 mr-2" />
            {isDownloadingXml ? "Baixando..." : "Baixar XML"}
          </Button>
        </div>

        {/* PDF Actions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Arquivo PDF (DAMFE)</span>
            {pdfData?.pdfBase64 ? (
              <Badge
                variant="default"
                className="bg-green-500 hover:bg-green-600 text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Disponível
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                <XCircle className="h-3 w-3 mr-1" />
                Indisponível
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={handleDownloadPdf}
              disabled={!pdfData?.pdfBase64 || isDownloadingPdf}
              className="w-full"
              variant={pdfData?.pdfBase64 ? "default" : "secondary"}
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloadingPdf ? "Baixando..." : "Baixar PDF"}
            </Button>

            <Button
              onClick={handleViewPdf}
              disabled={!pdfData?.pdfBase64}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visualizar PDF
            </Button>

            <Button
              onClick={handlePrintPdf}
              disabled={!pdfData?.pdfBase64 || isPrinting}
              variant="outline"
              className="w-full"
            >
              <Printer className="h-4 w-4 mr-2" />
              {isPrinting ? "Abrindo..." : "Imprimir PDF"}
            </Button>
          </div>
        </div>

        {/* Warning for missing files */}
        {(!xmlData || !pdfData?.pdfBase64) && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-medium">Arquivos não disponíveis</p>
                <p className="text-xs mt-1">
                  Alguns arquivos podem não estar disponíveis se o MDFe ainda
                  não foi processado pela SEFAZ ou se houve erro no
                  processamento.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
