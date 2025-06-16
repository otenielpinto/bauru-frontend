"use client";

import { useState, useTransition, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SuccessDialog } from "@/components/ui/success-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, CheckCircle, Search } from "lucide-react";
import {
  EncerrarMdfeSchema,
  type EncerrarMdfeData,
  UF_CODES,
} from "@/types/MdfeEncerramentoTypes";
import { getMunicipioByUfAndDescricao } from "@/actions/actMunicipio";
import { getBrazilDateTime, formatDateTimeBrazil } from "@/lib/brazil-datetime";

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
 * Converte valor datetime-local para Date brasileiro
 */
const parseDateTimeLocal = (value: string): Date => {
  if (!value) return getBrazilDateTime();

  // O datetime-local já está no fuso horário local
  const localDate = new Date(value);
  return localDate;
};

/**
 * Props para o componente EncerrarMdfeForm
 */
interface EncerrarMdfeFormProps {
  mdfeId: string;
  chave?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Lista de UFs para o select
 */
const UF_OPTIONS = Object.keys(UF_CODES).map((uf) => ({
  value: uf,
  label: uf,
}));

/**
 * Componente para formulário de encerramento de MDFe
 */
export function EncerrarMdfeForm({
  mdfeId,
  chave,
  onSuccess,
  onError,
}: EncerrarMdfeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<any>(null);
  const [isSearchingMunicipio, setIsSearchingMunicipio] = useState(false);
  const [municipioNotFound, setMunicipioNotFound] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<EncerrarMdfeData>({
    resolver: zodResolver(EncerrarMdfeSchema),
    defaultValues: {
      mdfeId,
      ufEncerramento: "RS",
      municipioEncerramento: "",
      codigoMunicipio: 0,
      dataEncerramento: getBrazilDateTime().toISOString(),
    },
  });

  /**
   * Search for municipality code when user leaves the municipality field
   */
  const handleMunicipioBlur = async () => {
    const ufEncerramento = form.getValues("ufEncerramento");
    const municipioEncerramento = form.getValues("municipioEncerramento");

    if (!municipioEncerramento?.trim() || !ufEncerramento) {
      form.setValue("codigoMunicipio", 0);
      setMunicipioNotFound(false);
      return;
    }

    setIsSearchingMunicipio(true);
    setMunicipioNotFound(false);

    try {
      const municipio = await getMunicipioByUfAndDescricao(
        ufEncerramento,
        municipioEncerramento.trim()
      );

      if (municipio?.codigoIbge) {
        form.setValue("codigoMunicipio", municipio.codigoIbge);
        form.setValue("municipioEncerramento", municipio.descricao);
        setMunicipioNotFound(false);

        toast({
          title: "Município encontrado",
          description: `${municipio.nome} - Código IBGE: ${municipio.codigoIbge}`,
        });
      } else {
        form.setValue("codigoMunicipio", 0);
        setMunicipioNotFound(true);

        toast({
          title: "Município não encontrado",
          description: "Verifique se o nome do município está correto",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar município:", error);
      form.setValue("codigoMunicipio", 0);
      setMunicipioNotFound(true);

      toast({
        title: "Erro na busca",
        description: "Erro ao buscar informações do município",
        variant: "destructive",
      });
    } finally {
      setIsSearchingMunicipio(false);
    }
  };

  /**
   * Reset municipality when UF changes
   */
  const handleUfChange = (uf: string) => {
    form.setValue("ufEncerramento", uf);
    form.setValue("municipioEncerramento", "");
    form.setValue("codigoMunicipio", 0);
    setMunicipioNotFound(false);
  };

  /**
   * Handle form submission
   */
  const onSubmit = (data: EncerrarMdfeData) => {
    startTransition(async () => {
      try {
        setResult(null);

        const response = await fetch("/api/sefaz/encerramento", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setResult(result);
          setShowSuccessDialog(true);
          onSuccess?.();
        } else {
          const errorMessage = result.error || "Erro no encerramento do MDFe";
          setResult({ success: false, error: errorMessage, data: result.data });
          toast({
            title: "Erro no encerramento",
            description: errorMessage,
            variant: "destructive",
          });
          onError?.(errorMessage);
        }
      } catch (error) {
        const errorMessage = "Erro de comunicação com o servidor";
        setResult({ success: false, error: errorMessage });
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
        onError?.(errorMessage);
      }
    });
  };

  /**
   * Handle success dialog close
   */
  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    // Não precisa mais do router.refresh() aqui, pois será redirecionado
  };

  return (
    <div className="space-y-6">
      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        title="Tudo certo!"
        message={`MDFe encerrado com sucesso. Protocolo: ${
          result?.data?.protocolo || ""
        }`}
        confirmText="OK"
        onConfirm={handleSuccessDialogClose}
        redirectTo="/mdfe"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Encerrar MDFe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* UF de Encerramento */}
              <FormField
                control={form.control}
                name="ufEncerramento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF de Encerramento *</FormLabel>
                    <Select
                      onValueChange={handleUfChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a UF" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UF_OPTIONS.map((uf) => (
                          <SelectItem key={uf.value} value={uf.value}>
                            {uf.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Município de Encerramento */}
              <FormField
                control={form.control}
                name="municipioEncerramento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Município de Encerramento *</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Digite o nome do município"
                          onBlur={handleMunicipioBlur}
                          className={`pr-10 ${
                            municipioNotFound
                              ? "border-red-500 focus:border-red-500"
                              : form.watch("codigoMunicipio") > 0
                              ? "border-green-500 focus:border-green-500"
                              : ""
                          }`}
                        />
                      </FormControl>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {isSearchingMunicipio ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : form.watch("codigoMunicipio") > 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Search className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    {municipioNotFound && (
                      <p className="text-sm text-red-500 mt-1">
                        Município não encontrado. Verifique a grafia e tente
                        novamente.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Código do Município (read-only) */}
              {form.watch("codigoMunicipio") > 0 && (
                <FormField
                  control={form.control}
                  name="codigoMunicipio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código IBGE do Município</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value.toString()}
                          readOnly
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Data de Encerramento */}
              <FormField
                control={form.control}
                name="dataEncerramento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Encerramento</FormLabel>
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
                          const localDate = parseDateTimeLocal(e.target.value);
                          field.onChange(localDate.toISOString());
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Botão de Submit */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || form.watch("codigoMunicipio") === 0}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Encerrar MDFe"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Resultado do Encerramento - apenas para erros */}
      {result && !result.success && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Resultado do Encerramento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                {result.error}
                {result.data && (
                  <div className="mt-2">
                    <strong>Detalhes:</strong> {result.data.cStat} -{" "}
                    {result.data.xMotivo}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Aviso sobre prazo legal */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> O encerramento do MDFe deve ser feito em
          até 30 dias após a autorização. Certifique-se de que os dados estão
          corretos antes de confirmar.
        </AlertDescription>
      </Alert>
    </div>
  );
}
