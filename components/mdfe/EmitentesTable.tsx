"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";

import {
  getAllMdfeEmitentes,
  getMdfeEmitentesByEmpresa,
  getMdfeEmitentesByUf,
  deleteMdfeEmitente,
  deleteMdfeEmitenteByObjectId,
} from "@/actions/actMdfeEmitente";
import { MdfeEmitente } from "@/types/MdfeEmitenteTypes";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { ro } from "date-fns/locale";

interface EmitentesTableProps {
  empresaId?: number;
  uf?: string;
}

export default function EmitentesTable({ empresaId, uf }: EmitentesTableProps) {
  // Toast notifications
  const { toast } = useToast();

  // State
  const [emitentes, setEmitentes] = useState<MdfeEmitente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filter, setFilter] = useState<string>("");
  const [sortField, setSortField] =
    useState<keyof MdfeEmitente>("razao_social");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const itemsPerPage = 10;

  // Load emitentes based on props
  useEffect(() => {
    loadEmitentes();
  }, [empresaId, uf]);

  async function loadEmitentes() {
    try {
      setLoading(true);
      let response: any = { success: false, data: [] };

      if (empresaId) {
        let row: any = await getMdfeEmitentesByEmpresa(empresaId);
        if (row.success) {
          response = row.data as MdfeEmitente[];
        }
      } else if (uf) {
        response = await getMdfeEmitentesByUf(uf);
      } else {
        response = await getAllMdfeEmitentes();
      }

      if (response.success) {
        setEmitentes(response.data as MdfeEmitente[]);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Falha ao carregar os emitentes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Handle delete emitente
  const handleDelete = async (emitente: MdfeEmitente) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o emitente ${emitente.razao_social}?`
      )
    ) {
      try {
        setIsDeleting(true);
        let response;

        if (emitente._id) {
          response = await deleteMdfeEmitenteByObjectId(
            emitente._id.toString()
          );
        } else if (emitente.id) {
          response = await deleteMdfeEmitente(emitente.id);
        } else {
          throw new Error("ID do emitente não encontrado");
        }

        if (response.success) {
          toast({
            title: "Sucesso",
            description: "Emitente excluído com sucesso",
            variant: "default",
          });

          // Reload the list
          loadEmitentes();
        } else {
          toast({
            title: "Erro",
            description: response.message || "Erro ao excluir emitente",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erro ao excluir emitente:", error);
        toast({
          title: "Erro",
          description: "Falha ao excluir o emitente",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Sort and filter logic
  const toggleSort = (field: keyof MdfeEmitente) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedAndFilteredEmitentes = emitentes
    .filter((emitente) => {
      if (!filter) return true;

      const searchLower = filter.toLowerCase();
      return (
        emitente.razao_social?.toLowerCase().includes(searchLower) ||
        emitente.cpfcnpj?.includes(filter) ||
        emitente.nome_municipio?.toLowerCase().includes(searchLower) ||
        emitente.uf?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const fieldA = a[sortField] || "";
      const fieldB = b[sortField] || "";

      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return sortDirection === "asc"
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }

      return sortDirection === "asc"
        ? fieldA > fieldB
          ? 1
          : -1
        : fieldA < fieldB
        ? 1
        : -1;
    });

  // Pagination logic
  const totalPages = Math.ceil(
    sortedAndFilteredEmitentes.length / itemsPerPage
  );
  const paginatedEmitentes = sortedAndFilteredEmitentes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Render a "no emitentes" message or error
  if (!loading && (emitentes.length === 0 || error)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Emitentes MDF-e</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <Link href="/mdfe/emitentes/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Emitente
              </Button>
            </Link>
          </div>
          <div className="text-center py-10">
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <p>Nenhum emitente encontrado.</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render table with data
  return (
    <Card>
      <CardHeader>
        <CardTitle>Emitentes MDF-e</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <div className="flex gap-2 w-full max-w-sm items-center">
            <Input
              placeholder="Buscar emitentes..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-xs"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Link href="/mdfe/emitentes/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Emitente
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => toggleSort("id")}
                    className="cursor-pointer"
                  >
                    ID
                    {sortField === "id" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="inline ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="inline ml-1 h-4 w-4" />
                      ))}
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort("razao_social")}
                    className="cursor-pointer"
                  >
                    Razão Social
                    {sortField === "razao_social" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="inline ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="inline ml-1 h-4 w-4" />
                      ))}
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort("cpfcnpj")}
                    className="cursor-pointer"
                  >
                    CNPJ/CPF
                    {sortField === "cpfcnpj" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="inline ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="inline ml-1 h-4 w-4" />
                      ))}
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort("nome_municipio")}
                    className="cursor-pointer"
                  >
                    Município
                    {sortField === "nome_municipio" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="inline ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="inline ml-1 h-4 w-4" />
                      ))}
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort("uf")}
                    className="cursor-pointer"
                  >
                    UF
                    {sortField === "uf" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="inline ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="inline ml-1 h-4 w-4" />
                      ))}
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmitentes.map((emitente) => (
                  <TableRow
                    key={emitente._id?.toString() || emitente.id?.toString()}
                  >
                    <TableCell>{emitente.id}</TableCell>
                    <TableCell>{emitente.razao_social}</TableCell>
                    <TableCell>{emitente.cpfcnpj}</TableCell>
                    <TableCell>{emitente.nome_municipio}</TableCell>
                    <TableCell>{emitente.uf}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/mdfe/emitentes/view/${
                            emitente._id || emitente.id
                          }`}
                        >
                          <Button
                            variant="outline"
                            size="icon"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link
                          href={`/mdfe/emitentes/edit/${
                            emitente._id || emitente.id
                          }`}
                        >
                          <Button variant="outline" size="icon" title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive"
                          title="Excluir"
                          onClick={() => handleDelete(emitente)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {!loading && totalPages > 1 && (
        <CardFooter>
          <Pagination className="w-full">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageToShow;
                if (totalPages <= 5) {
                  pageToShow = i + 1;
                } else {
                  const startPage = Math.max(1, currentPage - 2);
                  const endPage = Math.min(totalPages, startPage + 4);
                  pageToShow = startPage + i;

                  if (pageToShow > endPage) {
                    return null;
                  }
                }

                return (
                  <PaginationItem key={pageToShow}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageToShow)}
                      isActive={currentPage === pageToShow}
                      className="cursor-pointer"
                    >
                      {pageToShow}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      )}
    </Card>
  );
}
