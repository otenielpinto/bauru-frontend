"use client";

import { useState, useEffect, startTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { searchProdutos } from "@/actions/actProduto";
import { getAllCategorias } from "@/actions/actCategoria";
import { getAllGrades } from "@/actions/actGrade";
import { getServiceByName } from "@/actions/actService";
import { formatDateTimeBrazil } from "@/lib/brazil-datetime";
import ProdutoTable from "@/components/produto/ProdutoTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  FileDown,
} from "lucide-react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { reportToExcel } from "@/lib/reportToExcel";

/**
 * Product search form interface
 */
interface ProdutoSearchForm {
  codigo: string;
  nome: string;
  sys_has_estrutura_produto: string;
  categoria_principal: string;
  categoria_secundaria: string;
  categoria_terciaria: string;
  grade: string[];
}

export default function ProdutoPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const [gradePopoverOpen, setGradePopoverOpen] = useState(false);
  const [searchForm, setSearchForm] = useState<ProdutoSearchForm>({
    codigo: "",
    nome: "",
    sys_has_estrutura_produto: "true",
    categoria_principal: "",
    categoria_secundaria: "",
    categoria_terciaria: "",
    grade: [],
  });
  const [hasSearched, setHasSearched] = useState(false);
  // Estado separado para armazenar os parâmetros de pesquisa submetidos
  const [submittedSearchParams, setSubmittedSearchParams] =
    useState<ProdutoSearchForm | null>(null);

  const itemsPerPage = 100;

  // Invalidate cache when component mounts to ensure fresh data
  useEffect(() => {
    // Invalidate all product queries to force refetch when returning to this page
    queryClient.invalidateQueries({ queryKey: ["produtos"] });
  }, [queryClient]);

  // React Query for categories
  const { data: categoriasPrincipais } = useQuery({
    queryKey: ["categorias", "nivel-0"],
    queryFn: () => getAllCategorias({ nivel: 0 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: categoriasSecundarias } = useQuery({
    queryKey: ["categorias", "nivel-1", searchForm.categoria_principal],
    queryFn: () => getAllCategorias({ nivel: 1 }),
    enabled: !!searchForm.categoria_principal,
    staleTime: 5 * 60 * 1000,
  });

  const { data: categoriasTerciarias } = useQuery({
    queryKey: ["categorias", "nivel-2", searchForm.categoria_secundaria],
    queryFn: () => getAllCategorias({ nivel: 2 }),
    enabled: !!searchForm.categoria_secundaria,
    staleTime: 5 * 60 * 1000,
  });

  // React Query for grades
  const { data: grades } = useQuery({
    queryKey: ["grades"],
    queryFn: () => getAllGrades(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // React Query para buscar o serviço de importação do Tiny (últimos 7 dias)
  const { data: tinyImportService } = useQuery({
    queryKey: ["service", "importarProdutoTinyDiario_ultimos_7dias"],
    queryFn: () => getServiceByName("importarProdutoTinyDiario_ultimos_7dias"),
    staleTime: 60 * 60 * 1000, // Cache de 60 minutos
    gcTime: 60 * 60 * 1000, // 60 minutos
  });

  // React Query for product search
  const {
    data: produtoResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["produtos", submittedSearchParams],
    queryFn: () => {
      // Convert string values to appropriate types for the search
      const filters: any = {};

      if (submittedSearchParams?.codigo) {
        filters.codigo = submittedSearchParams.codigo;
      }
      if (submittedSearchParams?.nome) {
        filters.nome = submittedSearchParams.nome;
      }
      if (submittedSearchParams?.sys_has_estrutura_produto) {
        filters.sys_has_estrutura_produto =
          submittedSearchParams.sys_has_estrutura_produto === "true";
      }
      if (submittedSearchParams?.categoria_principal) {
        filters.categoria1 = submittedSearchParams.categoria_principal;
      }
      if (submittedSearchParams?.categoria_secundaria) {
        filters.categoria2 = submittedSearchParams.categoria_secundaria;
      }
      if (submittedSearchParams?.categoria_terciaria) {
        filters.categoria3 = submittedSearchParams.categoria_terciaria;
      }
      if (submittedSearchParams?.grade) {
        filters.grade = submittedSearchParams.grade;
      }

      return searchProdutos(filters);
    },
    enabled: hasSearched && submittedSearchParams !== null,
    staleTime: 0, // Consider data stale immediately to force fresh requests
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  const handleInputChange = (field: keyof ProdutoSearchForm, value: string) => {
    startTransition(() => {
      setSearchForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    });
  };

  const handleGradeToggle = (gradeName: string) => {
    startTransition(() => {
      setSearchForm((prev) => ({
        ...prev,
        grade: prev.grade.includes(gradeName)
          ? prev.grade.filter((g) => g !== gradeName)
          : [...prev.grade, gradeName],
      }));
    });
  };

  const handleGradeClear = () => {
    startTransition(() => {
      setSearchForm((prev) => ({
        ...prev,
        grade: [],
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
    startTransition(() => {
      setSearchForm({
        codigo: "",
        nome: "",
        sys_has_estrutura_produto: "true",
        categoria_principal: "",
        categoria_secundaria: "",
        categoria_terciaria: "",
        grade: [],
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
   * Checks if search form has any active filters
   */
  const hasActiveFilters = () => {
    return Object.values(searchForm).some((value) => value !== "");
  };

  // Get product data from response
  const produtos = produtoResponse?.success ? produtoResponse.data || [] : [];
  const totalProdutos = produtos.length;
  const totalPages = Math.ceil(totalProdutos / itemsPerPage);

  // Paginate the results
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProdutos = produtos.slice(startIndex, endIndex);

  // Função para atualizar dados após alteração de preço
  const handlePrecoUpdated = (produtoId: string, novoPreco: number) => {
    // Invalidar e refazer a query dos produtos para obter dados atualizados
    queryClient.invalidateQueries({
      queryKey: ["produtos", submittedSearchParams],
    });

    // Log para debug
    console.log(`Preço do produto ${produtoId} atualizado para ${novoPreco}`);
  };

  // Função para exportar produtos para Excel
  const handleExportToExcel = () => {
    if (!produtos || produtos.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    // Definir as colunas que serão exportadas (baseadas na tabela)
    const columns = [
      { label: "SKU", value: "codigo" },
      { label: "Descrição", value: "nome" },
      { label: "Preço Custo", value: "preco_custo_formatted" },
      { label: "Custo Composição", value: "sys_total_preco_custo_formatted" },
      { label: "Markup Atual", value: "sys_markup_atual_formatted" },
      { label: "Margem Atual", value: "sys_margem_atual_formatted" },
      { label: "Preço Venda", value: "preco_formatted" },
    ];

    // Formatar os dados para exportação
    const dataForExport = produtos.map((produto) => ({
      codigo: produto.codigo || "-",
      nome: produto.nome || "-",
      preco_custo_formatted: produto.preco_custo
        ? produto.preco_custo.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })
        : "-",
      sys_total_preco_custo_formatted: produto.sys_total_preco_custo
        ? produto.sys_total_preco_custo.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })
        : "-",
      sys_markup_atual_formatted: produto.sys_markup_atual
        ? `${produto.sys_markup_atual.toFixed(2)}`
        : "-",
      sys_margem_atual_formatted: produto.sys_margem_atual
        ? `R$ ${produto.sys_margem_atual.toFixed(2)}`
        : "-",
      preco_formatted: produto.preco
        ? produto.preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })
        : "-",
    }));

    // Gerar nome do arquivo baseado na data/hora atual
    const now = new Date();
    const fileName = `produtos_${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(
      now.getHours()
    ).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;

    // Chamar a função de exportação
    reportToExcel({
      data: dataForExport,
      columns: columns,
      sheetName: "Produtos",
      fileName: fileName,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
      </div>

      {/* Collapsible Search Form */}
      <Collapsible open={isSearchExpanded} onOpenChange={setIsSearchExpanded}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Pesquisa de Produtos
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
                  Utilize os filtros abaixo para localizar os produtos desejados
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
                {/* Basic Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      placeholder="Nome do produto"
                      value={searchForm.nome}
                      onChange={(e) =>
                        handleInputChange("nome", e.target.value)
                      }
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="codigo">Código</Label>
                    <Input
                      id="codigo"
                      placeholder="Código do produto"
                      value={searchForm.codigo}
                      onChange={(e) =>
                        handleInputChange("codigo", e.target.value)
                      }
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Additional Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="grade">Grade</Label>
                    <Popover
                      open={gradePopoverOpen}
                      onOpenChange={setGradePopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left"
                          disabled={!grades?.success}
                        >
                          {searchForm.grade.length > 0
                            ? searchForm.grade.join(", ")
                            : "Selecione uma ou mais grades"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-4">
                        <Command>
                          <CommandInput placeholder="Buscar grade..." />
                          <CommandEmpty>Nenhuma grade encontrada.</CommandEmpty>
                          <CommandGroup>
                            {grades?.success &&
                              grades.data?.map((grade: any) => (
                                <CommandItem key={grade.nome}>
                                  <Checkbox
                                    checked={searchForm.grade.includes(
                                      grade.nome
                                    )}
                                    onCheckedChange={() =>
                                      handleGradeToggle(grade.nome)
                                    }
                                    className="mr-2"
                                  />
                                  {grade.nome}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Category Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="categoria_principal">
                      Categoria Principal
                    </Label>
                    <Select
                      value={searchForm.categoria_principal}
                      onValueChange={(value) => {
                        handleInputChange("categoria_principal", value);
                        // Reset dependent categories when parent changes
                        if (value !== searchForm.categoria_principal) {
                          handleInputChange("categoria_secundaria", "");
                          handleInputChange("categoria_terciaria", "");
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriasPrincipais?.map((categoria: any) => (
                          <SelectItem
                            key={categoria.nome}
                            value={categoria.nome}
                          >
                            {categoria.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="categoria_secundaria">
                      Categoria Secundária
                    </Label>
                    <Select
                      value={searchForm.categoria_secundaria}
                      onValueChange={(value) => {
                        handleInputChange("categoria_secundaria", value);
                        // Reset dependent category when parent changes
                        if (value !== searchForm.categoria_secundaria) {
                          handleInputChange("categoria_terciaria", "");
                        }
                      }}
                      disabled={!searchForm.categoria_principal}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriasSecundarias?.map((categoria: any) => (
                          <SelectItem
                            key={categoria.nome}
                            value={categoria.nome}
                          >
                            {categoria.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="categoria_terciaria">
                      Categoria Terciária
                    </Label>
                    <Select
                      value={searchForm.categoria_terciaria}
                      onValueChange={(value) =>
                        handleInputChange("categoria_terciaria", value)
                      }
                      disabled={!searchForm.categoria_secundaria}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriasTerciarias?.map((categoria: any) => (
                          <SelectItem
                            key={categoria.nome}
                            value={categoria.nome}
                          >
                            {categoria.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Possui Estrutura - Último campo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="sys_has_estrutura_produto">
                        Possui Estrutura
                      </Label>
                      <Checkbox
                        id="sys_has_estrutura_produto"
                        checked={
                          searchForm.sys_has_estrutura_produto === "true"
                        }
                        onCheckedChange={(checked) =>
                          handleInputChange(
                            "sys_has_estrutura_produto",
                            checked ? "true" : "false"
                          )
                        }
                      />
                    </div>
                    {tinyImportService && (tinyImportService as any)?.last && (
                      <span className="text-xs text-green-600">
                        Última importação do Tiny:{" "}
                        {formatDateTimeBrazil(
                          new Date((tinyImportService as any).last)
                        )}
                      </span>
                    )}
                  </div>
                </div>

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
                Buscando produtos...
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
                Erro ao buscar produtos:{" "}
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
              {totalProdutos > 0
                ? `${totalProdutos} produto(s) encontrado(s)`
                : "Nenhum produto encontrado com os filtros aplicados"}
            </p>
            <div className="flex items-center gap-2">
              {totalProdutos > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportToExcel}
                  className="flex items-center gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  Exportar Excel
                </Button>
              )}
              {totalProdutos > 0 && (
                <p className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </p>
              )}
            </div>
          </div>

          {/* Results Table */}
          {totalProdutos > 0 ? (
            <div className="rounded-md border">
              <ProdutoTable
                produtos={paginatedProdutos}
                onPrecoUpdated={handlePrecoUpdated}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Nenhum produto encontrado com os filtros aplicados.
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
                visualizar os produtos.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
