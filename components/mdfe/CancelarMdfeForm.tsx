"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, CheckCircle, X } from "lucide-react";
import {
  CancelarMdfeSchema,
  type CancelarMdfeData,
} from "@/types/MdfeCancelamentoTypes";
import { getBrazilDateTime } from "@/lib/brazil-datetime";
import { useEventoMdfeEspecifico } from "@/hooks/useEventoMdfe";

/**
 * Converte uma data brasileira para o formato datetime-local
 */
const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Props para o componente CancelarMdfeForm
 */
interface CancelarMdfeFormProps {
  mdfe: {
    id: string;
    ide?: {
      nMDF?: string;
      serie?: string;
    };
    chave?: string;
    emit?: {
      xNome?: string;
      CNPJ?: string;
    };
    // Dados do destinatário (se houver)
    dest?: {
      xNome?: string;
      CNPJ?: string;
    };
    // Dados do transportador (se houver)
    transp?: {
      xNome?: string;
      CNPJ?: string;
    };
  };
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Componente para formulário de cancelamento de MDFe
 */
export function CancelarMdfeForm({
  mdfe,
  onSuccess,
  onError,
}: CancelarMdfeFormProps) {
  const [result, setResult] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { cancelarMdfe, isLoading, error, clearError } =
    useEventoMdfeEspecifico();

  const form = useForm<CancelarMdfeData>({
    resolver: zodResolver(CancelarMdfeSchema),
    defaultValues: {
      mdfeId: mdfe.id,
      justificativa: "",
      dataEvento: getBrazilDateTime().toISOString(),
    },
  });

  /**
   * Handle form submission
   */
  const onSubmit = async (data: CancelarMdfeData) => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    try {
      setResult(null);
      clearError();

      const response = await cancelarMdfe({
        mdfeId: data.mdfeId,
        justificativa: data.justificativa,
      });

      if (response?.success) {
        setResult(response);
        toast({
          title: "Cancelamento autorizado",
          description: `MDFe cancelado com sucesso. Protocolo: ${response.protocolo}`,
        });
        onSuccess?.();
        router.refresh();
      } else {
        const errorMessage =
          response?.error?.message || "Erro no cancelamento do MDFe";
        setResult(response);
        toast({
          title: "Erro no cancelamento",
          description: errorMessage,
          variant: "destructive",
        });
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = "Erro inesperado no cancelamento";
      setResult({ success: false, error: { message: errorMessage } });
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    form.reset();
    clearError();
  };

  return (
    <div className="space-y-6">
      {/* Informações do MDFe */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do MDF-e</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Número MDFe
              </label>
              <p className="text-sm text-gray-900">
                {mdfe.ide?.serie && mdfe.ide?.nMDF
                  ? `${mdfe.ide.serie}/${mdfe.ide.nMDF}`
                  : "Não informado"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Série do MDFe
              </label>
              <p className="text-sm text-gray-900">
                {mdfe.ide?.serie || "Não informado"}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Chave de Acesso do MDFe
              </label>
              <p className="text-sm text-gray-900 font-mono break-all">
                {mdfe.chave || "Não informado"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Emitente do MDFe
              </label>
              <p className="text-sm text-gray-900">
                {mdfe.emit?.xNome || "Não informado"}
                {mdfe.emit?.CNPJ && (
                  <span className="text-gray-600 block text-xs">
                    CNPJ: {mdfe.emit.CNPJ}
                  </span>
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Destinatário
              </label>
              <p className="text-sm text-gray-900">
                {mdfe.dest?.xNome || "Não informado"}
                {mdfe.dest?.CNPJ && (
                  <span className="text-gray-600 block text-xs">
                    CNPJ: {mdfe.dest.CNPJ}
                  </span>
                )}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Transportadora
              </label>
              <p className="text-sm text-gray-900">
                {mdfe.transp?.xNome || mdfe.emit?.xNome || "Não informado"}
                {(mdfe.transp?.CNPJ || mdfe.emit?.CNPJ) && (
                  <span className="text-gray-600 block text-xs">
                    CNPJ: {mdfe.transp?.CNPJ || mdfe.emit?.CNPJ}
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Cancelamento */}
      {!result?.success && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-500" />
              Cancelar MDF-e
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Justificativa do Cancelamento */}
                <FormField
                  control={form.control}
                  name="justificativa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Justificativa do Cancelamento *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Informe o motivo do cancelamento (mínimo 15 caracteres)"
                          rows={4}
                          className="resize-none"
                          maxLength={255}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Mínimo 15 caracteres, máximo 255</span>
                        <span>{field.value?.length || 0}/255</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Data do Evento */}
                <FormField
                  control={form.control}
                  name="dataEvento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do Evento</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={
                            field.value
                              ? formatDateTimeLocal(new Date(field.value))
                              : formatDateTimeLocal(getBrazilDateTime())
                          }
                          onChange={(e) => {
                            const localDate = new Date(e.target.value);
                            field.onChange(localDate.toISOString());
                          }}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mensagem de Confirmação */}
                {showConfirmation && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <strong>
                        Você realmente deseja cancelar este documento?
                      </strong>
                      <br />
                      Esta ação não pode ser desfeita. O documento será
                      cancelado definitivamente na SEFAZ.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Exibir erro do hook se houver */}
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Botões de Ação */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={
                      showConfirmation ? handleCancel : () => router.back()
                    }
                    disabled={isLoading}
                  >
                    {showConfirmation ? "Desfazer" : "Voltar"}
                  </Button>
                  <Button
                    type="submit"
                    variant={showConfirmation ? "destructive" : "default"}
                    disabled={
                      isLoading ||
                      !form.watch("justificativa") ||
                      form.watch("justificativa").length < 15
                    }
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : showConfirmation ? (
                      "Sim, quero cancelar"
                    ) : (
                      "Cancelar MDF-e"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Resultado do Cancelamento */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              Resultado do Cancelamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div className="space-y-3">
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    MDFe cancelado com sucesso!
                  </AlertDescription>
                </Alert>

                {result.data && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Protocolo
                      </label>
                      <p className="text-sm text-gray-900">
                        {result.protocolo || result.data.protocolo}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Status SEFAZ
                      </label>
                      <p className="text-sm text-gray-900">
                        {result.data.cStat} - {result.data.xMotivo}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Data de Processamento
                      </label>
                      <p className="text-sm text-gray-900">
                        {new Date(result.data.dataProcessamento).toLocaleString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Chave de Acesso
                      </label>
                      <p className="text-sm text-gray-900 font-mono">
                        {result.data.chave || result.data.chMDFe}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>
                  {result.error?.message || "Erro desconhecido"}
                  {result.data && (
                    <div className="mt-2">
                      <strong>Detalhes:</strong> {result.data.cStat} -{" "}
                      {result.data.xMotivo}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Aviso sobre prazo legal */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> O cancelamento do MDFe deve ser feito em
          até 24 horas após a autorização e antes do início da viagem.
          Certifique-se de que os dados estão corretos antes de confirmar.
        </AlertDescription>
      </Alert>
    </div>
  );
}
