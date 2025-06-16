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
  FileKey,
  Upload,
} from "lucide-react";

import {
  getAllMdfeCertificados,
  deleteMdfeCertificado,
  deleteMdfeCertificadoByObjectId,
  getMdfeCertificadoByObjectId,
} from "@/actions/actMdfeCertificado";
import { MdfeCertificado } from "@/types/MdfeCertificadoTypes";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function CertificadosTable() {
  // Toast notifications
  const { toast } = useToast();

  // State
  const [certificados, setCertificados] = useState<MdfeCertificado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filter, setFilter] = useState<string>("");
  const [sortField, setSortField] = useState<keyof MdfeCertificado>("cpfcnpj");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const itemsPerPage = 10;

  // Load certificados
  useEffect(() => {
    loadCertificados();
  }, []);

  async function loadCertificados() {
    try {
      setLoading(true);
      const response = await getAllMdfeCertificados();

      if (response.success) {
        setCertificados(response.data as MdfeCertificado[]);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Falha ao carregar os certificados.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Handle sync certificate with API
  const handleSyncCertificate = async (certificado: MdfeCertificado) => {
    if (
      window.confirm(
        `Tem certeza que deseja sincronizar o certificado para ${certificado.cpfcnpj}?`
      )
    ) {
      try {
        setIsSyncing(true);

        // Validate that we have the certificate ID
        const certificadoId = certificado._id || certificado.id;

        if (!certificadoId) {
          toast({
            title: "Erro",
            description: "ID do certificado não encontrado",
            variant: "destructive",
          });
          return;
        }

        // Call the API to sync the certificate - only send the ID
        const syncResponse = await fetch("/api/mdfe/certificado/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: certificadoId,
          }),
        });

        const result = await syncResponse.json();

        if (syncResponse.ok && result.success) {
          toast({
            title: "Sucesso",
            description: "Certificado sincronizado com sucesso",
            variant: "default",
          });
        } else {
          toast({
            title: "Erro",
            description: result.message || "Erro ao sincronizar certificado",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erro ao sincronizar certificado:", error);
        toast({
          title: "Erro",
          description: "Falha ao sincronizar o certificado",
          variant: "destructive",
        });
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Handle delete certificado
  const handleDelete = async (certificado: MdfeCertificado) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o certificado para ${certificado.cpfcnpj}?`
      )
    ) {
      try {
        setIsDeleting(true);
        let response;

        if (certificado._id) {
          response = await deleteMdfeCertificadoByObjectId(
            certificado._id.toString()
          );
        } else if (certificado.id) {
          response = await deleteMdfeCertificado(certificado.id);
        } else {
          throw new Error("ID do certificado não encontrado");
        }

        if (response.success) {
          toast({
            title: "Sucesso",
            description: "Certificado excluído com sucesso",
            variant: "default",
          });

          // Reload the list
          loadCertificados();
        } else {
          toast({
            title: "Erro",
            description: response.message || "Erro ao excluir certificado",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erro ao excluir certificado:", error);
        toast({
          title: "Erro",
          description: "Falha ao excluir o certificado",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Sort and filter logic
  const toggleSort = (field: keyof MdfeCertificado) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedAndFilteredCertificados = certificados
    .filter((certificado) => {
      if (!filter) return true;

      const searchLower = filter.toLowerCase();
      return certificado.cpfcnpj?.toLowerCase().includes(searchLower);
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
    sortedAndFilteredCertificados.length / itemsPerPage
  );
  const paginatedCertificados = sortedAndFilteredCertificados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format date
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render a "no certificados" message or error
  if (!loading && (certificados.length === 0 || error)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Certificados MDF-e</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <Link href="/mdfe/certificados/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Certificado
              </Button>
            </Link>
          </div>
          <div className="text-center py-10">
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <p>Nenhum certificado encontrado.</p>
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
        <CardTitle>Certificados MDF-e</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <div className="flex gap-2 w-full max-w-sm items-center">
            <Input
              placeholder="Buscar certificados..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-xs"
              autoComplete="off"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Link href="/mdfe/certificados/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Certificado
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
                    onClick={() => toggleSort("data_vencimento")}
                    className="cursor-pointer"
                  >
                    Data de Vencimento
                    {sortField === "data_vencimento" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="inline ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="inline ml-1 h-4 w-4" />
                      ))}
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort("createdAt")}
                    className="cursor-pointer"
                  >
                    Data de Cadastro
                    {sortField === "createdAt" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="inline ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="inline ml-1 h-4 w-4" />
                      ))}
                  </TableHead>
                  <TableHead>Sincronizar</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCertificados.map((certificado) => (
                  <TableRow
                    key={
                      certificado._id?.toString() || certificado.id?.toString()
                    }
                  >
                    <TableCell>{certificado.id}</TableCell>
                    <TableCell>{certificado.cpfcnpj}</TableCell>
                    <TableCell>
                      {formatDate(certificado.data_vencimento)}
                    </TableCell>
                    <TableCell>{formatDate(certificado.createdAt)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncCertificate(certificado)}
                        disabled={isSyncing}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Sincronizar Certificado
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="destructive"
                          size="icon"
                          title="Excluir"
                          onClick={() => handleDelete(certificado)}
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
