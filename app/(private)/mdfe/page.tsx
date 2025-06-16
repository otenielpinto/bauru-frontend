"use client";

import { useState, useEffect, startTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllMdfe } from "@/actions/actMdfeEnvio";
import MdfeTable from "@/components/mdfe/MdfeTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Download,
  Search,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UF_DATA } from "@/actions/actUF";
import { MdfeSearchForm } from "@/types/MdfeSearchFormTypes";
import { lib } from "@/lib/lib";
import {
  statusOptions,
  tipoEmissaoOptions,
  modalidadeOptions,
} from "@/types/MdfeConversaoTypes";

/**
 * Gets the default date range (today and 30 days ago)
 */
const getDefaultDateRange = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  return {
    periodoEmissaoInicio: lib.formatDateForInput(thirtyDaysAgo),
    periodoEmissaoFim: lib.formatDateForInput(today),
  };
};

export default function MdfePage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const [isAdvancedFiltersExpanded, setIsAdvancedFiltersExpanded] =
    useState(false);
  const [searchForm, setSearchForm] = useState<MdfeSearchForm>({
    periodoEmissaoInicio: "",
    periodoEmissaoFim: "",
    serie: "",
    numeroInicial: "",
    numeroFinal: "",
    situacao: "",
    tipoEmissao: "",
    modalidade: "",
    ufCarregamento: "",
    ufDescarregamento: "",
    ufPercurso: "",
    chaveCte: "",
    chaveNfe: "",
  });
  const [hasSearched, setHasSearched] = useState(false);
  // Estado separado para armazenar os parâmetros de pesquisa submetidos
  const [submittedSearchParams, setSubmittedSearchParams] =
    useState<MdfeSearchForm | null>(null);

  const itemsPerPage = 10;

  // Set default date range on component mount and trigger automatic search
  useEffect(() => {
    const defaultDates = getDefaultDateRange();
    const defaultSearchParams = {
      periodoEmissaoInicio: defaultDates.periodoEmissaoInicio,
      periodoEmissaoFim: defaultDates.periodoEmissaoFim,
      serie: "",
      numeroInicial: "",
      numeroFinal: "",
      situacao: "",
      tipoEmissao: "",
      modalidade: "",
      ufCarregamento: "",
      ufDescarregamento: "",
      ufPercurso: "",
      chaveCte: "",
      chaveNfe: "",
    };

    startTransition(() => {
      setSearchForm(defaultSearchParams);
      // Trigger automatic search with default parameters
      setHasSearched(true);
      setSubmittedSearchParams(defaultSearchParams);
    });
  }, []);

  // Invalidate cache when component mounts to ensure fresh data
  useEffect(() => {
    // Invalidate all MDFe queries to force refetch when returning to this page
    queryClient.invalidateQueries({ queryKey: ["mdfes"] });
  }, [queryClient]);

  // React Query for MDF-e search
  const {
    data: mdfeResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["mdfes", submittedSearchParams],
    queryFn: () => getAllMdfe(submittedSearchParams!),
    enabled: hasSearched && submittedSearchParams !== null,
    staleTime: 0, // Consider data stale immediately to force fresh requests
    gcTime: 2 * 60 * 1000, // 2 minutes cache time
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // UF options from the existing UF_DATA
  const ufOptions = Array.isArray(UF_DATA) ? UF_DATA : [];

  const handleInputChange = (field: keyof MdfeSearchForm, value: string) => {
    startTransition(() => {
      setSearchForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(() => {
      setHasSearched(true);
      setCurrentPage(1); // Reset to first page on new search
      // Definir os parâmetros submetidos para disparar a query automaticamente
      setSubmittedSearchParams({ ...searchForm });
    });
  };

  const handleNewSearch = () => {
    const defaultDates = getDefaultDateRange();
    startTransition(() => {
      setSearchForm({
        periodoEmissaoInicio: defaultDates.periodoEmissaoInicio,
        periodoEmissaoFim: defaultDates.periodoEmissaoFim,
        serie: "",
        numeroInicial: "",
        numeroFinal: "",
        situacao: "",
        tipoEmissao: "",
        modalidade: "",
        ufCarregamento: "",
        ufDescarregamento: "",
        ufPercurso: "",
        chaveCte: "",
        chaveNfe: "",
      });
      setHasSearched(false);
      setSubmittedSearchParams(null); // Limpar os parâmetros submetidos
      setCurrentPage(1);
    });
  };

  /**
   * Toggles the search form visibility
   */
  const handleToggleSearch = () => {
    setIsSearchExpanded((prev) => !prev);
  };

  /**
   * Toggles the advanced filters visibility
   */
  const handleToggleAdvancedFilters = () => {
    setIsAdvancedFiltersExpanded((prev) => !prev);
  };

  /**
   * Checks if search form has any active filters
   */
  const hasActiveFilters = () => {
    return Object.values(searchForm).some((value) => value !== "");
  };

  // Get MDFe data from response
  const mdfes = mdfeResponse?.success ? mdfeResponse.data || [] : [];
  const totalMdfes = mdfes.length;
  const totalPages = Math.ceil(totalMdfes / itemsPerPage);

  // Paginate the results
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMdfes = mdfes.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Manifestos de Documentos Fiscais (MDF-e)
        </h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Link href="/mdfe/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo MDF-e
            </Button>
          </Link>
        </div>
      </div>

      {/* Collapsible Search Form */}
      <Collapsible open={isSearchExpanded} onOpenChange={setIsSearchExpanded}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Pesquisa de MDF-e
                  {hasActiveFilters() && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {
                        Object.values(searchForm).filter(
                          (value) => value !== ""
                        ).length
                      }{" "}
                      filtros ativos
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Utilize os filtros abaixo para localizar os documentos fiscais
                  desejados
                </CardDescription>
              </div>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-9 p-0"
                  onClick={handleToggleSearch}
                  aria-label={
                    isSearchExpanded ? "Recolher filtros" : "Expandir filtros"
                  }
                >
                  {isSearchExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>

          <CollapsibleContent className="transition-all duration-300 ease-in-out">
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-6">
                {/* Basic Filters - Always visible */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="periodoEmissaoInicio">
                      Período Emissão - Início
                    </Label>
                    <Input
                      id="periodoEmissaoInicio"
                      type="date"
                      value={searchForm.periodoEmissaoInicio}
                      onChange={(e) =>
                        handleInputChange(
                          "periodoEmissaoInicio",
                          e.target.value
                        )
                      }
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="periodoEmissaoFim">
                      Período Emissão - Fim
                    </Label>
                    <Input
                      id="periodoEmissaoFim"
                      type="date"
                      value={searchForm.periodoEmissaoFim}
                      onChange={(e) =>
                        handleInputChange("periodoEmissaoFim", e.target.value)
                      }
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="serie">Série</Label>
                    <Input
                      id="serie"
                      placeholder="Ex: 1"
                      value={searchForm.serie}
                      onChange={(e) =>
                        handleInputChange("serie", e.target.value)
                      }
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="numeroInicial">Número Inicial</Label>
                    <Input
                      id="numeroInicial"
                      type="number"
                      placeholder="Ex: 1"
                      value={searchForm.numeroInicial}
                      onChange={(e) =>
                        handleInputChange("numeroInicial", e.target.value)
                      }
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Advanced Filters Collapsible */}
                <Collapsible
                  open={isAdvancedFiltersExpanded}
                  onOpenChange={setIsAdvancedFiltersExpanded}
                >
                  <div className="flex items-center justify-between mb-4">
                    <CollapsibleTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={handleToggleAdvancedFilters}
                      >
                        {isAdvancedFiltersExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        Filtros Avançados
                        {Object.values({
                          numeroFinal: searchForm.numeroFinal,
                          situacao: searchForm.situacao,
                          tipoEmissao: searchForm.tipoEmissao,
                          modalidade: searchForm.modalidade,
                          ufCarregamento: searchForm.ufCarregamento,
                          ufDescarregamento: searchForm.ufDescarregamento,
                          ufPercurso: searchForm.ufPercurso,
                          chaveCte: searchForm.chaveCte,
                          chaveNfe: searchForm.chaveNfe,
                        }).filter((value) => value !== "").length > 0 && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {
                              Object.values({
                                numeroFinal: searchForm.numeroFinal,
                                situacao: searchForm.situacao,
                                tipoEmissao: searchForm.tipoEmissao,
                                modalidade: searchForm.modalidade,
                                ufCarregamento: searchForm.ufCarregamento,
                                ufDescarregamento: searchForm.ufDescarregamento,
                                ufPercurso: searchForm.ufPercurso,
                                chaveCte: searchForm.chaveCte,
                                chaveNfe: searchForm.chaveNfe,
                              }).filter((value) => value !== "").length
                            }
                          </span>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>

                  <CollapsibleContent className="space-y-6">
                    {/* Numbers and Status */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="numeroFinal">Número Final</Label>
                        <Input
                          id="numeroFinal"
                          type="number"
                          placeholder="Ex: 999999"
                          value={searchForm.numeroFinal}
                          onChange={(e) =>
                            handleInputChange("numeroFinal", e.target.value)
                          }
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <Label htmlFor="situacao">Situação</Label>
                        <Select
                          value={searchForm.situacao}
                          onValueChange={(value) =>
                            handleInputChange("situacao", value)
                          }
                          autoComplete="off"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a situação" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem
                                key={status.value}
                                value={status.value}
                              >
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="tipoEmissao">Tipo de Emissão</Label>
                        <Select
                          value={searchForm.tipoEmissao}
                          onValueChange={(value) =>
                            handleInputChange("tipoEmissao", value)
                          }
                          autoComplete="off"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {tipoEmissaoOptions.map((tipo) => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="modalidade">Modalidade</Label>
                        <Select
                          value={searchForm.modalidade}
                          onValueChange={(value) =>
                            handleInputChange("modalidade", value)
                          }
                          autoComplete="off"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a modalidade" />
                          </SelectTrigger>
                          <SelectContent>
                            {modalidadeOptions.map((modal) => (
                              <SelectItem key={modal.value} value={modal.value}>
                                {modal.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* UF Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="ufCarregamento">UF Carregamento</Label>
                        <Select
                          value={searchForm.ufCarregamento}
                          onValueChange={(value) =>
                            handleInputChange("ufCarregamento", value)
                          }
                          autoComplete="off"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a UF" />
                          </SelectTrigger>
                          <SelectContent>
                            {ufOptions.map((uf) => (
                              <SelectItem
                                key={`carregamento-${uf.id}`}
                                value={uf.id}
                              >
                                {uf.id} - {uf.descricao}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="ufDescarregamento">
                          UF Descarregamento
                        </Label>
                        <Select
                          value={searchForm.ufDescarregamento}
                          onValueChange={(value) =>
                            handleInputChange("ufDescarregamento", value)
                          }
                          autoComplete="off"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a UF" />
                          </SelectTrigger>
                          <SelectContent>
                            {ufOptions.map((uf) => (
                              <SelectItem
                                key={`descarregamento-${uf.id}`}
                                value={uf.id}
                              >
                                {uf.id} - {uf.descricao}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="ufPercurso">UF Percurso</Label>
                        <Select
                          value={searchForm.ufPercurso}
                          onValueChange={(value) =>
                            handleInputChange("ufPercurso", value)
                          }
                          autoComplete="off"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a UF" />
                          </SelectTrigger>
                          <SelectContent>
                            {ufOptions.map((uf) => (
                              <SelectItem
                                key={`percurso-${uf.id}`}
                                value={uf.id}
                              >
                                {uf.id} - {uf.descricao}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Document Keys */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="chaveCte">Chave CT-e</Label>
                        <Input
                          id="chaveCte"
                          placeholder="Chave de acesso do CT-e (44 dígitos)"
                          maxLength={44}
                          value={searchForm.chaveCte}
                          onChange={(e) =>
                            handleInputChange("chaveCte", e.target.value)
                          }
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <Label htmlFor="chaveNfe">Chave NF-e</Label>
                        <Input
                          id="chaveNfe"
                          placeholder="Chave de acesso da NF-e (44 dígitos)"
                          maxLength={44}
                          value={searchForm.chaveNfe}
                          onChange={(e) =>
                            handleInputChange("chaveNfe", e.target.value)
                          }
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleNewSearch}
                    className="flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Nova Pesquisa
                  </Button>
                  <Button
                    type="submit"
                    className="flex items-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Pesquisando...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Pesquisar
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm text-muted-foreground">
                Buscando MDF-e...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {isError && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-2">
              <p className="text-sm text-red-600">
                Erro ao buscar MDF-e:{" "}
                {error instanceof Error ? error.message : "Erro desconhecido"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-2"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {hasSearched && !isLoading && !isError && (
        <>
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {totalMdfes > 0
                ? `${totalMdfes} MDF-e(s) encontrado(s)`
                : "Nenhum MDF-e encontrado com os filtros aplicados"}
            </p>
            {totalMdfes > 0 && (
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </p>
            )}
          </div>

          {/* Results Table */}
          {totalMdfes > 0 ? (
            <div className="rounded-md border">
              <MdfeTable mdfes={paginatedMdfes} />
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Nenhum MDF-e encontrado com os filtros aplicados.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tente ajustar os filtros de pesquisa ou realizar uma nova
                    consulta.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => {
                      startTransition(() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                      });
                    }}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4 py-2 text-sm">
                    {currentPage} de {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => {
                      startTransition(() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                      });
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* No search performed yet */}
      {!hasSearched && !isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Configure os filtros de pesquisa e clique em "Pesquisar" para
                visualizar os MDF-e.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
