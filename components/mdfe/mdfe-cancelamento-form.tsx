import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useEventoMdfe } from "@/hooks/useEventoMdfe";
import {
  CancelarMdfeSchema,
  canCancelarMdfe,
  type CancelarMdfeData,
} from "@/types/MdfeCancelamentoTypes";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileX, Loader2 } from "lucide-react";

interface MdfeCancelamentoFormProps {
  mdfe: {
    id: string;
    chave: string;
    status: string;
    protocolo?: string;
    dataHoraAutorizacao?: Date;
    numero?: string;
    serie?: string;
  };
  onSuccess?: () => void;
}

/**
 * Componente para cancelamento de MDFe seguindo o padrão estabelecido
 */
export function MdfeCancelamentoForm({
  mdfe,
  onSuccess,
}: MdfeCancelamentoFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { enviarEvento, isLoading, error, clearError } = useEventoMdfe();

  const form = useForm<CancelarMdfeData>({
    resolver: zodResolver(CancelarMdfeSchema),
    defaultValues: {
      mdfeId: mdfe.id,
      justificativa: "",
      dataEvento: new Date().toISOString(),
    },
  });

  // Validar se o MDFe pode ser cancelado
  const validation = canCancelarMdfe(mdfe.status, mdfe.dataHoraAutorizacao);

  const handleCancelar = async (dados: CancelarMdfeData) => {
    clearError();

    try {
      const resultado = await enviarEvento("cancelamento", dados);

      if (resultado?.success) {
        toast({
          title: "Sucesso",
          description: `MDFe cancelado com sucesso. Protocolo: ${
            resultado.protocolo || "N/A"
          }`,
          variant: "default",
        });

        form.reset();
        setIsOpen(false);
        onSuccess?.();
      } else {
        const errorMessage =
          resultado?.error?.message || error || "Erro desconhecido";
        toast({
          title: "Erro no Cancelamento",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha na comunicação com o servidor",
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
      clearError();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={!validation.canCancelar}
          className="gap-2"
        >
          <FileX className="h-4 w-4" />
          Cancelar MDFe
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileX className="h-5 w-5 text-red-500" />
            Cancelar MDFe
          </DialogTitle>
          <DialogDescription>
            Cancelamento do MDFe {mdfe.numero}/{mdfe.serie} - Chave:{" "}
            {mdfe.chave}
          </DialogDescription>
        </DialogHeader>

        {/* Status do MDFe */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Status Atual</p>
              <Badge
                variant={mdfe.status === "autorizado" ? "default" : "secondary"}
              >
                {mdfe.status.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Protocolo</p>
              <p className="text-xs text-muted-foreground">
                {mdfe.protocolo || "N/A"}
              </p>
            </div>
          </div>

          {/* Validações de Cancelamento */}
          {!validation.canCancelar && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Cancelamento não permitido
                </p>
                <p className="text-xs text-yellow-700">{validation.reason}</p>
              </div>
            </div>
          )}

          {validation.canCancelar && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleCancelar)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="justificativa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Justificativa do Cancelamento *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Informe o motivo do cancelamento (mínimo 15 caracteres)"
                          className="min-h-[100px] resize-none"
                          maxLength={255}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Entre 15 e 255 caracteres. Seja específico sobre o
                        motivo do cancelamento.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mostrar erro se houver */}
                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Erro</p>
                      <p className="text-xs text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isLoading || !validation.canCancelar}
                    className="gap-2"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isLoading ? "Cancelando..." : "Confirmar Cancelamento"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
