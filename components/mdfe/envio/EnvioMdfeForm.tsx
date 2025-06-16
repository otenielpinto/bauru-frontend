"use client";

import { useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateMdfeNumber, updateMdfeStatus } from "@/actions/actMdfeEnvio";

interface SefazApiResponse {
  data: {
    sucesso: boolean;
    chave: string;
    protocolo: string;
    xml: string | null;
    pdfBase64: string | null;
    cStat: number;
    xMotivo: string;
    erro?: string;
  };
}

interface EnvioMdfeFormProps {
  mdfe: any;
}

export function EnvioMdfeForm({ mdfe }: EnvioMdfeFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleEnvio = () => {
    startTransition(async () => {
      try {
        // 1. Gerar número do MDFe se necessário
        const numberResult = await generateMdfeNumber(mdfe.id);

        if (!numberResult.success) {
          throw new Error(numberResult.message);
        }

        // 2. Enviar para SEFAZ
        const sefazResponse = await fetch("/api/sefaz/envio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mdfeId: mdfe.id,
            mdfeData: mdfe,
          }),
        });

        const result: SefazApiResponse = await sefazResponse.json();

        // 3. Processar resposta
        if (result.data.sucesso) {
          toast({
            title: "Sucesso",
            description: `MDFe autorizado! Protocolo: ${result.data.protocolo}`,
          });
          await updateMdfeStatus(mdfe.id, "AUTORIZADO");
        } else {
          toast({
            title: "Erro",
            description: result.data.erro || "Erro no envio para SEFAZ",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao enviar MDFe para SEFAZ",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Envio para SEFAZ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>
              Este MDFe será enviado para a SEFAZ para autorização. Verifique se
              todos os dados estão corretos antes de prosseguir.
            </p>
          </div>
          <Button
            onClick={handleEnvio}
            disabled={isPending}
            className="w-full"
            size="lg"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar para SEFAZ"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
