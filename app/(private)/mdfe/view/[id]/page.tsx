"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Printer, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getMdfeById } from "@/actions/actMdfeEnvio";
import { MdfeDocument } from "@/types/MdfeEnvioTypes";
import { formatDateTimeBrazil } from "@/lib/brazil-datetime";

interface MdfeViewPageState {
  mdfe: MdfeDocument | null;
  isLoading: boolean;
  error: string | null;
}

export default function MdfeViewPage() {
  const { id } = useParams();
  const [state, setState] = useState<MdfeViewPageState>({
    mdfe: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchMdfe = async () => {
      if (!id || typeof id !== "string") {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "ID do MDF-e não informado",
        }));
        return;
      }

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const response = await getMdfeById(id);

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            mdfe: response.data,
            isLoading: false,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: response.message || "Erro ao carregar MDF-e",
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Erro inesperado ao carregar MDF-e",
        }));
      }
    };

    fetchMdfe();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "autorizado":
        return "bg-green-100 text-green-800";
      case "rejeitado":
        return "bg-red-100 text-red-800";
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "cancelado":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (state.isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/mdfe">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!state.mdfe) {
    return (
      <div className="space-y-4">
        <Link href="/mdfe">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>MDF-e não encontrado</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { mdfe } = state;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/mdfe">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/mdfe/imprimir/?id=${id}`}>
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </Link>
        </div>
      </div>

      {/* Header with basic info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              MDF-e {mdfe.ide?.serie}/{mdfe.ide?.nMDF || "S/N"}
            </CardTitle>
            <Badge className={getStatusColor(mdfe.status || "pendente")}>
              {mdfe.status || "Pendente"}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>
              <strong>Chave:</strong> {mdfe.chave || "Não gerada"}
            </div>
            <div>
              <strong>Protocolo:</strong> {mdfe.protocolo || "N/A"}
            </div>
            <div>
              <strong>Data Emissão:</strong>{" "}
              {mdfe.ide?.dtEmi
                ? formatDateTimeBrazil(new Date(mdfe.ide.dtEmi))
                : "N/A"}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="items">Documentos</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="xml">XML</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          {/* Identification */}
          <Card>
            <CardHeader>
              <CardTitle>Identificação</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  UF Início
                </label>
                <p className="text-sm">{mdfe.ide?.ufIni || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  UF Fim
                </label>
                <p className="text-sm">{mdfe.ide?.ufFim || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Modalidade
                </label>
                <p className="text-sm">
                  {mdfe.ide?.tpModal === "1"
                    ? "Rodoviário"
                    : mdfe.ide?.tpModal === "2"
                    ? "Aéreo"
                    : mdfe.ide?.tpModal === "3"
                    ? "Aquaviário"
                    : mdfe.ide?.tpModal === "4"
                    ? "Ferroviário"
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Ambiente
                </label>
                <p className="text-sm">
                  {mdfe.ide?.tpAmb === "1"
                    ? "Produção"
                    : mdfe.ide?.tpAmb === "2"
                    ? "Homologação"
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Percurso
                </label>
                <p className="text-sm">{mdfe.ide?.infPercurso || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Emitter */}
          <Card>
            <CardHeader>
              <CardTitle>Emitente</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  CNPJ
                </label>
                <p className="text-sm">{mdfe.emit?.CNPJ || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Razão Social
                </label>
                <p className="text-sm">{mdfe.emit?.xNome || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nome Fantasia
                </label>
                <p className="text-sm">{mdfe.emit?.xFant || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Inscrição Estadual
                </label>
                <p className="text-sm">{mdfe.emit?.IE || "N/A"}</p>
              </div>
              {mdfe.emit?.enderEmit && (
                <>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Endereço
                    </label>
                    <p className="text-sm">
                      {mdfe.emit.enderEmit.xLgr}, {mdfe.emit.enderEmit.nro}
                      {mdfe.emit.enderEmit.xCpl &&
                        `, ${mdfe.emit.enderEmit.xCpl}`}
                      <br />
                      {mdfe.emit.enderEmit.xBairro} - {mdfe.emit.enderEmit.xMun}
                      /{mdfe.emit.enderEmit.UF}
                      <br />
                      CEP: {mdfe.emit.enderEmit.CEP}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Road Transport Info */}
          {mdfe.rodo && (
            <Card>
              <CardHeader>
                <CardTitle>Transporte Rodoviário</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Placa do Veículo
                  </label>
                  <p className="text-sm">{mdfe.rodo.placaVeiculo || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    RENAVAM
                  </label>
                  <p className="text-sm">{mdfe.rodo.renavam || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tara (kg)
                  </label>
                  <p className="text-sm">{mdfe.rodo.tara || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Capacidade (kg)
                  </label>
                  <p className="text-sm">{mdfe.rodo.capacidadeKG || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Capacidade (m³)
                  </label>
                  <p className="text-sm">{mdfe.rodo.capacidadeM3 || "N/A"}</p>
                </div>
                {mdfe.rodo.condutores && mdfe.rodo.condutores.length > 0 && (
                  <div className="md:col-span-3">
                    <label className="text-sm font-medium text-muted-foreground">
                      Condutores
                    </label>
                    <div className="mt-2 space-y-1">
                      {mdfe.rodo.condutores.map((condutor, index) => (
                        <p key={index} className="text-sm">
                          {condutor.xNome} - CPF: {condutor.cpf}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Totals */}
          {mdfe.tot && (
            <Card>
              <CardHeader>
                <CardTitle>Totalizadores</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Qtd. CT-e
                  </label>
                  <p className="text-sm">{mdfe.tot.qCTe || "0"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Qtd. NF-e
                  </label>
                  <p className="text-sm">{mdfe.tot.qNFe || "0"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Qtd. MDF-e
                  </label>
                  <p className="text-sm">{mdfe.tot.qMDFe || "0"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Valor da Carga
                  </label>
                  <p className="text-sm">
                    R${" "}
                    {parseFloat(mdfe.tot.vCarga || "0").toLocaleString(
                      "pt-BR",
                      { minimumFractionDigits: 2 }
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Qtd. Carga
                  </label>
                  <p className="text-sm">
                    {mdfe.tot.qCarga || "0"} {mdfe.tot.cUnid || ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          {/* NFe Documents */}
          {mdfe.infDoc?.nfe && mdfe.infDoc.nfe.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>NF-e Transportadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mdfe.infDoc.nfe.map((nfe, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="md:col-span-3">
                          <label className="text-sm font-medium text-muted-foreground">
                            Chave de Acesso
                          </label>
                          <p className="text-sm font-mono">{nfe.chave}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Peso Total
                          </label>
                          <p className="text-sm">{nfe.pesoTotal} kg</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Valor
                          </label>
                          <p className="text-sm">
                            R${" "}
                            {parseFloat(nfe.valor || "0").toLocaleString(
                              "pt-BR",
                              { minimumFractionDigits: 2 }
                            )}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Reentrega
                          </label>
                          <p className="text-sm">
                            {nfe.indReentrega ? "Sim" : "Não"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Município Carregamento
                          </label>
                          <p className="text-sm">{nfe.xMunCarrega}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Município Descarga
                          </label>
                          <p className="text-sm">
                            {nfe.xMunDescarga}/{nfe.ufDescarga}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTe Documents */}
          {mdfe.infDoc?.cte && mdfe.infDoc.cte.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>CT-e Transportados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mdfe.infDoc.cte.map((cte, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="md:col-span-3">
                          <label className="text-sm font-medium text-muted-foreground">
                            Chave de Acesso
                          </label>
                          <p className="text-sm font-mono">{cte.chave}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Peso Total
                          </label>
                          <p className="text-sm">{cte.pesoTotal} kg</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Valor
                          </label>
                          <p className="text-sm">
                            R${" "}
                            {parseFloat(cte.valor || "0").toLocaleString(
                              "pt-BR",
                              { minimumFractionDigits: 2 }
                            )}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Reentrega
                          </label>
                          <p className="text-sm">
                            {cte.indReentrega ? "Sim" : "Não"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Município Carregamento
                          </label>
                          <p className="text-sm">{cte.xMunCarrega}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Município Descarga
                          </label>
                          <p className="text-sm">
                            {cte.xMunDescarga}/{cte.ufDescarga}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(!mdfe.infDoc?.nfe || mdfe.infDoc.nfe.length === 0) &&
            (!mdfe.infDoc?.cte || mdfe.infDoc.cte.length === 0) && (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">
                    Nenhum documento transportado encontrado
                  </p>
                </CardContent>
              </Card>
            )}
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Criação do MDF-e</p>
                      <p className="text-sm text-muted-foreground">
                        {mdfe.createdAt
                          ? formatDateTimeBrazil(new Date(mdfe.createdAt))
                          : "N/A"}
                      </p>
                    </div>
                    <Badge variant="outline">Criado</Badge>
                  </div>
                </div>

                {mdfe.updatedAt && mdfe.updatedAt !== mdfe.createdAt && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Última Atualização</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTimeBrazil(new Date(mdfe.updatedAt))}
                        </p>
                      </div>
                      <Badge variant="outline">Atualizado</Badge>
                    </div>
                  </div>
                )}

                {mdfe.protocolo && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Autorização SEFAZ</p>
                        <p className="text-sm text-muted-foreground">
                          Protocolo: {mdfe.protocolo}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Autorizado
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="xml">
          <Card>
            <CardHeader>
              <CardTitle>XML do MDF-e</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="overflow-auto max-h-[600px] text-xs">
                  {JSON.stringify(mdfe, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
