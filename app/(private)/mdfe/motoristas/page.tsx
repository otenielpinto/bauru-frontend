"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, FileEdit } from "lucide-react";
import Link from "next/link";
import { Motorista } from "@/types/MotoristaTypes";
import { getAllMotoristas } from "@/actions/actMotorista";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

async function fetchMotoristas(): Promise<Motorista[]> {
  const response = await getAllMotoristas();
  if (!response.success) {
    throw new Error(response.message || "Erro ao carregar motoristas");
  }
  if (!Array.isArray(response.data)) {
    throw new Error("Dados de motoristas inválidos");
  }
  return response.data;
}

const getStatusBadge = (status: string | undefined) => {
  switch (status?.toUpperCase()) {
    case "ATIVO":
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          Ativo
        </Badge>
      );
    case "INATIVO":
      return <Badge variant="destructive">Inativo</Badge>;
    default:
      return <Badge variant="outline">{status || "N/A"}</Badge>;
  }
};

export default function MotoristasPage() {
  const {
    data: motoristas,
    isLoading,
    error,
  } = useQuery<Motorista[]>({
    queryKey: ["motoristas"],
    queryFn: fetchMotoristas,
  });

  if (error) {
    throw new Error("Falha ao carregar motoristas");
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(5)].map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(5)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-[80%]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Motoristas</h1>
        <Button asChild>
          <Link href="/mdfe/motoristas/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Motorista
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>CNH</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {motoristas?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Nenhum motorista encontrado
                </TableCell>
              </TableRow>
            ) : (
              motoristas?.map((motorista) => (
                <TableRow key={motorista._id}>
                  <TableCell className="font-medium">
                    {motorista.xNome}
                  </TableCell>
                  <TableCell>{motorista.cpf}</TableCell>
                  <TableCell>{motorista.cnh}</TableCell>
                  <TableCell>{getStatusBadge(motorista.status)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/mdfe/motoristas/view/${motorista._id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/mdfe/motoristas/edit/${motorista._id}`}>
                        <FileEdit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => {}} />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext onClick={() => {}} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
