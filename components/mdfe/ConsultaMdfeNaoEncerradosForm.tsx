"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Loader2, FileText, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import { consultarMdfeNaoEncerrados } from "@/actions/actMdfeNaoEncerrados";
import {
  ConsultaMdfeNaoEncerradosData,
  ConsultaMdfeNaoEncerradosSchema,
  MdfeNaoEncerrado,
} from "@/types/MdfeNaoEncerradosTypes";

interface ConsultaMdfeNaoEncerradosFormProps {
  onResultsChange?: (results: MdfeNaoEncerrado[]) => void;
  initialCnpj?: string;
}

/**
 * Componente para formulário de consulta de MDF-e não encerrados
 */
export function ConsultaMdfeNaoEncerradosForm({
  onResultsChange,
  initialCnpj = "",
}: ConsultaMdfeNaoEncerradosFormProps) {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<MdfeNaoEncerrado[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ConsultaMdfeNaoEncerradosData>({
    resolver: zodResolver(ConsultaMdfeNaoEncerradosSchema),
    defaultValues: {
      cnpj: initialCnpj,
    },
  });

  /**
   * Formatar CNPJ automaticamente durante a digitação
   */
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito
    setValue("cnpj", value);
  };

  /**
   * Realizar consulta na SEFAZ
   */
  const onSubmit = (data: ConsultaMdfeNaoEncerradosData) => {
    startTransition(async () => {
      try {
        setError(null);
        setResults([]);
        setHasSearched(false);

        const response = await consultarMdfeNaoEncerrados(data);

        if (response.success && response.data) {
          setResults(response.data.items);
          setHasSearched(true);
          onResultsChange?.(response.data.items);

          toast({
            title: "Consulta realizada",
            description: `Encontrados ${response.data.items.length} MDF-e não encerrados`,
          });
        } else {
          setError(response.error || response.message);
          setHasSearched(true);

          toast({
            title: "Erro na consulta",
            description: response.error || response.message,
            variant: "destructive",
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        setHasSearched(true);

        toast({
          title: "Erro na consulta",
          description: errorMessage,
          variant: "destructive",
        });
      }
    });
  };

  /**
   * Formatar CNPJ para exibição
   */
  const formatCnpj = (cnpj: string) => {
    if (cnpj.length !== 14) return cnpj;
    return cnpj.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  };

  /**
   * Formatar chave de acesso para exibição
   */
  const formatChave = (chave: string) => {
    if (chave.length !== 44) return chave;
    return chave.replace(/(\d{4})/g, "$1 ").trim();
  };

  const cnpjValue = watch("cnpj");

  return (
    <div className="space-y-6">
      {/* Formulário de Consulta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Consultar MDF-e Não Encerrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    id="cnpj"
                    placeholder="Digite o CNPJ (apenas números)"
                    maxLength={14}
                    {...register("cnpj")}
                    onChange={handleCnpjChange}
                    className={errors.cnpj ? "border-red-500" : ""}
                  />
                  {errors.cnpj && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.cnpj.message}
                    </p>
                  )}
                  {cnpjValue && cnpjValue.length === 14 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      CNPJ: {formatCnpj(cnpjValue)}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="min-w-[160px]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Consultando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Consultar na Sefaz
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Mensagem de Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Resultados da Consulta */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resultados da Consulta
              {results.length > 0 && (
                <Badge variant="secondary">{results.length} encontrados</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-medium">
                    Nenhum MDF-e não encerrado encontrado
                  </h3>
                  <p className="text-muted-foreground">
                    Não foram encontrados MDF-e não encerrados para o CNPJ
                    consultado.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {results.map((mdfe, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Chave de Acesso
                          </Label>
                          <p className="font-mono text-sm break-all">
                            {formatChave(mdfe.chMDFe)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            Protocolo
                          </Label>
                          <p className="font-mono text-sm">{mdfe.nProt}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total: {results.length} MDF-e não{" "}
                  {results.length === 1 ? "encerrado" : "encerrados"}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
