"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, TrendingDown, TrendingUp, User } from "lucide-react";

interface HistoricoItem {
  _id: string;
  id: string;
  codigo: string;
  nome: string;
  preco: number;
  novo_preco: number;
  sys_markup_atual: number;
  novo_sys_markup_atual: number;
  sys_margem_atual: number;
  novo_sys_margem_atual: number;
  usuario: string;
  createdAt: string;
}

interface HistoricoPrecoModalProps {
  produto: {
    _id: string;
    id?: string;
    codigo?: string;
    nome?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoricoPrecoModal({
  produto,
  isOpen,
  onClose,
}: HistoricoPrecoModalProps) {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && produto.codigo) {
      buscarHistorico();
    }
  }, [isOpen, produto.codigo]);

  const buscarHistorico = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/tiny/historico?codigo=${encodeURIComponent(produto.codigo!)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erro ao buscar histórico");
      }

      setHistorico(result.data || []);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao buscar histórico"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getVariacaoPreco = (precoAntigo: number, precoNovo: number) => {
    const variacao = ((precoNovo - precoAntigo) / precoAntigo) * 100;
    return {
      valor: variacao,
      isPositiva: variacao > 0,
      isNegativa: variacao < 0,
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Histórico de Preços - {produto.codigo}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{produto.nome}</p>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-destructive">Erro: {error}</p>
          </div>
        )}

        {!loading && !error && historico.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Nenhuma alteração de preço encontrada para este produto.
            </p>
          </div>
        )}

        {!loading && !error && historico.length > 0 && (
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Preço Anterior</TableHead>
                  <TableHead>Preço Novo</TableHead>
                  <TableHead>Variação</TableHead>
                  <TableHead>Markup Anterior</TableHead>
                  <TableHead>Markup Novo</TableHead>
                  <TableHead>Margem Anterior</TableHead>
                  <TableHead>Margem Nova</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historico.map((item) => {
                  const variacao = getVariacaoPreco(
                    item.preco,
                    item.novo_preco
                  );
                  return (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">
                        {formatDate(item.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {item.usuario}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(item.preco)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(item.novo_preco)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {variacao.isPositiva && (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          )}
                          {variacao.isNegativa && (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          )}
                          <Badge
                            variant={
                              variacao.isPositiva
                                ? "default"
                                : variacao.isNegativa
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {variacao.valor > 0 ? "+" : ""}
                            {variacao.valor.toFixed(1)}%
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.sys_markup_atual?.toFixed(2) || "-"}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {item.novo_sys_markup_atual?.toFixed(2) || "-"}
                      </TableCell>
                      <TableCell>
                        {item.sys_margem_atual
                          ? formatCurrency(item.sys_margem_atual)
                          : "-"}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {item.novo_sys_margem_atual
                          ? formatCurrency(item.novo_sys_margem_atual)
                          : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
