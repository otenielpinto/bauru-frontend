"use client";

import { useState, useEffect, startTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { searchProdutos } from "@/actions/actProduto";
import ProdutoTable from "@/components/produto/ProdutoTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Search,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Filter,
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

/**
 * Product search form interface
 */
interface ProdutoSearchForm {
  codigo: string;
  nome: string;
  sys_has_estrutura_produto: string;
}

export default function ProdutoPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const [searchForm, setSearchForm] = useState<ProdutoSearchForm>({
    codigo: "",
    nome: "",
    sys_has_estrutura_produto: "",
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
        sys_has_estrutura_produto: "",
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
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="sys_has_estrutura_produto">
                      Possui Estrutura
                    </Label>
                    <Select
                      value={searchForm.sys_has_estrutura_produto}
                      onValueChange={(value) =>
                        handleInputChange("sys_has_estrutura_produto", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Sim</SelectItem>
                        <SelectItem value="false">Não</SelectItem>
                      </SelectContent>
                    </Select>
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
            {totalProdutos > 0 && (
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </p>
            )}
          </div>

          {/* Results Table */}
          {totalProdutos > 0 ? (
            <div className="rounded-md border">
              <ProdutoTable produtos={paginatedProdutos} />
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
