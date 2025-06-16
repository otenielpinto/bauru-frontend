"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Produto {
  _id: string;
  codigo?: string;
  nome?: string;
  sys_total_preco_custo?: number;
  sys_markup_atual?: number;
  sys_margem_atual?: number;
  preco_custo?: number;
  preco?: number;
  sys_has_estrutura_produto?: boolean;
}

interface ProdutoTableProps {
  produtos: Produto[];
}

type SortField =
  | "codigo"
  | "nome"
  | "sys_total_preco_custo"
  | "sys_markup_atual"
  | "sys_margem_atual"
  | "preco_custo"
  | "preco"
  | "sys_has_estrutura_produto";

export default function ProdutoTable({ produtos }: ProdutoTableProps) {
  const [sortField, setSortField] = useState<SortField>("nome");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortValue = (produto: Produto, field: SortField) => {
    switch (field) {
      case "codigo":
        return produto.codigo || "";
      case "nome":
        return produto.nome || "";
      case "sys_total_preco_custo":
        return produto.sys_total_preco_custo || 0;
      case "sys_markup_atual":
        return produto.sys_markup_atual || 0;
      case "sys_margem_atual":
        return produto.sys_margem_atual || 0;
      case "preco_custo":
        return produto.preco_custo || 0;
      case "preco":
        return produto.preco || 0;
      case "sys_has_estrutura_produto":
        return produto.sys_has_estrutura_produto ? 1 : 0;
      default:
        return "";
    }
  };

  const sortedProdutos = [...produtos].sort((a, b) => {
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

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="inline ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="inline ml-1 h-4 w-4" />
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead
            onClick={() => toggleSort("codigo")}
            className="cursor-pointer hover:bg-muted/50"
          >
            Código
            {getSortIcon("codigo")}
          </TableHead>
          <TableHead
            onClick={() => toggleSort("nome")}
            className="cursor-pointer hover:bg-muted/50"
          >
            Nome
            {getSortIcon("nome")}
          </TableHead>
          <TableHead
            onClick={() => toggleSort("sys_total_preco_custo")}
            className="cursor-pointer hover:bg-muted/50"
          >
            Custo Composição
            {getSortIcon("sys_total_preco_custo")}
          </TableHead>
          <TableHead
            onClick={() => toggleSort("sys_markup_atual")}
            className="cursor-pointer hover:bg-muted/50"
          >
            Markup Atual
            {getSortIcon("sys_markup_atual")}
          </TableHead>
          <TableHead
            onClick={() => toggleSort("sys_margem_atual")}
            className="cursor-pointer hover:bg-muted/50"
          >
            Margem Atual
            {getSortIcon("sys_margem_atual")}
          </TableHead>
          <TableHead
            onClick={() => toggleSort("preco_custo")}
            className="cursor-pointer hover:bg-muted/50"
          >
            Preço Custo
            {getSortIcon("preco_custo")}
          </TableHead>
          <TableHead
            onClick={() => toggleSort("preco")}
            className="cursor-pointer hover:bg-muted/50"
          >
            Preço Venda
            {getSortIcon("preco")}
          </TableHead>
          <TableHead
            onClick={() => toggleSort("sys_has_estrutura_produto")}
            className="cursor-pointer hover:bg-muted/50"
          >
            Estrutura
            {getSortIcon("sys_has_estrutura_produto")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedProdutos.map((produto) => (
          <TableRow key={produto._id}>
            <TableCell className="font-medium">
              {produto.codigo || "-"}
            </TableCell>
            <TableCell>{produto.nome || "-"}</TableCell>
            <TableCell>
              {produto.sys_total_preco_custo
                ? produto.sys_total_preco_custo.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : "-"}
            </TableCell>
            <TableCell>
              {produto.sys_markup_atual
                ? `${produto.sys_markup_atual.toFixed(2)}`
                : "-"}
            </TableCell>
            <TableCell>
              {produto.sys_margem_atual
                ? `R$ ${produto.sys_margem_atual.toFixed(2)}`
                : "-"}
            </TableCell>
            <TableCell>
              {produto.preco_custo
                ? produto.preco_custo.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : "-"}
            </TableCell>
            <TableCell>
              {produto.preco
                ? produto.preco.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : "-"}
            </TableCell>
            <TableCell>
              {produto.sys_has_estrutura_produto ? (
                <Badge variant="secondary">Sim</Badge>
              ) : (
                <Badge variant="outline">Não</Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
