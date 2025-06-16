"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  FileEdit,
  Trash2,
  Eye,
  FilePlus2,
  FileCheck,
  FileWarning,
  Send,
  Printer,
  X,
  List,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MdfeDocument } from "@/types/MdfeEnvioTypes";
import { Badge } from "@/components/ui/badge";

interface MdfeTableProps {
  mdfes: MdfeDocument[];
}

type SortField = "dhEmi" | "serie" | "emitente" | "vCarga" | "qNFe" | "status";

export default function MdfeTable({ mdfes }: MdfeTableProps) {
  const router = useRouter();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedMdfe, setSelectedMdfe] = useState<MdfeDocument | null>(null);
  const [sortField, setSortField] = useState<SortField>("dhEmi");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const itemsPerPage = 25;

  const handleViewMdfe = (mdfe: MdfeDocument) => {
    router.push(`/mdfe/view/${mdfe.id}`);
  };

  const handleEditMdfe = (mdfe: MdfeDocument) => {
    const id = mdfe.id;
    if (id) {
      router.push(`/mdfe/new?id=${id}`);
    }
  };

  const handleEnvioMdfe = (mdfe: MdfeDocument) => {
    const id = mdfe.id;
    if (id) {
      startTransition(() => {
        router.push(`/mdfe/envio/${id}`);
      });
    }
  };

  const handleImprimirMdfe = (mdfe: MdfeDocument) => {
    const id = mdfe.id;
    if (id) {
      startTransition(() => {
        router.push(`/mdfe/imprimir/?id=${id}`);
      });
    }
  };

  const handleDeleteDialog = (mdfe: MdfeDocument) => {
    setSelectedMdfe(mdfe);
    setOpenDeleteDialog(true);
  };

  const handleCancelarMdfe = (mdfe: MdfeDocument) => {
    const id = mdfe.id;
    if (id) {
      router.push(`/mdfe/cancelar/${id}`);
    }
  };

  const handleNaoEncerrados = () => {
    router.push("/mdfe/nao-encerrados");
  };

  const handleEncerrarMdfe = (mdfe: MdfeDocument) => {
    const id = mdfe.id;
    if (id) {
      startTransition(() => {
        router.push(`/mdfe/encerrar/${id}`);
      });
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortValue = (mdfe: MdfeDocument, field: SortField) => {
    switch (field) {
      case "dhEmi":
        return mdfe.ide?.dhEmi || "";
      case "serie":
        return `${mdfe.ide?.serie || 0}/${mdfe.ide?.nMDF || 0}`;
      case "emitente":
        return mdfe.emit?.xNome || "";
      case "vCarga":
        return parseFloat(mdfe.tot?.vCarga?.toString() || "0");
      case "qNFe":
        return parseInt(mdfe.tot?.qNFe?.toString() || "0");
      case "status":
        return mdfe.status || "";
      default:
        return "";
    }
  };

  const sortedMdfes = [...mdfes].sort((a, b) => {
    const valueA = getSortValue(a, sortField);
    const valueB = getSortValue(b, sortField);

    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    }

    const stringA = valueA.toString().toLowerCase();
    const stringB = valueB.toString().toLowerCase();

    if (sortDirection === "asc") {
      return stringA.localeCompare(stringB);
    } else {
      return stringB.localeCompare(stringA);
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedMdfes.length / itemsPerPage);
  const paginatedMdfes = sortedMdfes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="inline ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="inline ml-1 h-4 w-4" />
    );
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status?.toUpperCase()) {
      case "PENDENTE":
        return <Badge variant="outline">pendente</Badge>;
      case "AUTORIZADO":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            autorizado
          </Badge>
        );
      case "REJEITADO":
        return <Badge variant="destructive">rejeitado</Badge>;
      case "DENEGADO":
        return <Badge variant="destructive">denegado</Badge>;
      case "ENCERRADO":
        return <Badge variant="default">encerrado</Badge>;
      case "CANCELADO":
        return (
          <Badge
            variant="destructive"
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            cancelado
          </Badge>
        );
      case "ERRO":
        return <Badge variant="destructive">erro</Badge>;
      default:
        return <Badge variant="outline">{status || "N/A"}</Badge>;
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";

    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      return formatDistanceToNow(dateObj, {
        addSuffix: true,
        locale: ptBR,
      });
    } catch (error) {
      return "Data inválida";
    }
  };

  const formatDateTime = (dateTimeString: string | undefined) => {
    if (!dateTimeString) return "N/A";

    try {
      const dateObj = new Date(dateTimeString);
      return dateObj.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
      });
    } catch (error) {
      return "Data inválida";
    }
  };

  const formatCurrency = (value: number | string | undefined) => {
    if (!value) return "R$ 0,00";

    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return "R$ 0,00";

    return numValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatQuantity = (value: number | string | undefined) => {
    if (!value) return "0";

    const numValue = typeof value === "string" ? parseInt(value) : value;
    if (isNaN(numValue)) return "0";

    return numValue.toString();
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => toggleSort("dhEmi")}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    Data/Hora Emissão
                    {getSortIcon("dhEmi")}
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort("serie")}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    Série/Número
                    {getSortIcon("serie")}
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort("emitente")}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    Emitente
                    {getSortIcon("emitente")}
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort("vCarga")}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    Valor Carga
                    {getSortIcon("vCarga")}
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort("qNFe")}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    Qtd NFe
                    {getSortIcon("qNFe")}
                  </TableHead>
                  <TableHead
                    onClick={() => toggleSort("status")}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    Status
                    {getSortIcon("status")}
                  </TableHead>
                  <TableHead>Envio/Imprimir/Encerrar</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMdfes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Nenhum MDF-e encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMdfes.map((mdfe) => (
                    <TableRow key={mdfe.id?.toString()}>
                      <TableCell className="font-medium">
                        {mdfe.ide?.dhEmi} {mdfe.ide?.hora}
                      </TableCell>
                      <TableCell>
                        {mdfe.ide?.serie && mdfe.ide.nMDF
                          ? `${mdfe.ide.serie}/${mdfe.ide.nMDF}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>{mdfe.emit?.xNome || "N/A"}</TableCell>
                      <TableCell>{formatCurrency(mdfe.tot?.vCarga)}</TableCell>
                      <TableCell>{formatQuantity(mdfe.tot?.qNFe)}</TableCell>
                      <TableCell>{getStatusBadge(mdfe.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEnvioMdfe(mdfe)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleImprimirMdfe(mdfe)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEncerrarMdfe(mdfe)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleViewMdfe(mdfe)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditMdfe(mdfe)}
                            >
                              <FileEdit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteDialog(mdfe)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCancelarMdfe(mdfe)}
                              className="text-yellow-600"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancelar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={handleNaoEncerrados}
                              className="text-blue-600"
                            >
                              <List className="mr-2 h-4 w-4" />
                              Não Encerrados
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {totalPages > 1 && (
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

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o MDF-e{" "}
              {selectedMdfe?.ide?.serie && selectedMdfe.ide.nMDF
                ? `${selectedMdfe.ide.serie}/${selectedMdfe.ide.nMDF}`
                : selectedMdfe?.id || "selecionado"}
              ? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (selectedMdfe) {
                  const id = selectedMdfe.id;
                  if (id) {
                    router.push(`/mdfe/delete/${id}`);
                  }
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
