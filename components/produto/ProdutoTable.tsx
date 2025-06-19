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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  DollarSign,
  History,
  Check,
} from "lucide-react";
import AlterarPrecoModal from "./AlterarPrecoModal";
import HistoricoPrecoModal from "./HistoricoPrecoModal";

interface Produto {
  _id: string;
  id?: string;
  codigo?: string;
  nome?: string;
  sys_total_preco_custo?: number;
  sys_markup_atual?: number;
  sys_margem_atual?: number;
  preco_custo?: number;
  preco?: number;
  sys_has_estrutura_produto?: boolean;
  updatePrice?: string | Date;
}

interface ProdutoTableProps {
  produtos: Produto[];
  onPrecoUpdated?: (produtoId: string, novoPreco: number) => void;
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

export default function ProdutoTable({
  produtos,
  onPrecoUpdated,
}: ProdutoTableProps) {
  const [sortField, setSortField] = useState<SortField>("nome");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [modalOpen, setModalOpen] = useState(false);
  const [historicoModalOpen, setHistoricoModalOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
    null
  );
  const [markupValues, setMarkupValues] = useState<Record<string, number | "">>(
    {}
  );
  const [precoCalculadoValues, setPrecoCalculadoValues] = useState<
    Record<string, number | "">
  >({});

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

  const handleAbrirModal = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setModalOpen(true);
  };

  const handleFecharModal = () => {
    setModalOpen(false);
    setProdutoSelecionado(null);
  };

  const handleAbrirHistoricoModal = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setHistoricoModalOpen(true);
  };

  const handleFecharHistoricoModal = () => {
    setHistoricoModalOpen(false);
    setProdutoSelecionado(null);
  };

  const handleSalvarPreco = async (produtoId: string, novoPreco: number) => {
    try {
      // Preparar dados no formato esperado pela API
      const payload = [
        {
          id: produtoId,
          preco: novoPreco.toString(),
        },
      ];

      // Fazer chamada para a API
      const response = await fetch("/api/tiny/atualizar-precos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const result = await response.json();

      // Verificar se houve sucesso na atualização
      if (!result.success) {
        throw new Error(
          result.message || "Erro ao atualizar preço no Tiny ERP"
        );
      }

      // Log de sucesso para debug
      console.log("Preço atualizado com sucesso:", result);

      // Chamar callback se fornecido para atualizar a UI
      if (onPrecoUpdated) {
        onPrecoUpdated(produtoId, novoPreco);
      }
    } catch (error) {
      console.error("Erro ao salvar preço:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao salvar preço"
      );
    }
  };

  const handleMarkupChange = (produtoId: string, valor: string) => {
    const markupNum = valor === "" ? "" : parseFloat(valor);
    setMarkupValues((prev) => ({ ...prev, [produtoId]: markupNum }));

    // Calcular preço baseado no markup
    const produto = produtos.find((p) => p._id === produtoId);
    if (produto && markupNum !== "" && !isNaN(markupNum as number)) {
      const custoBase =
        produto.sys_total_preco_custo || produto.preco_custo || 0;
      const novoPreco = custoBase * (markupNum as number);
      setPrecoCalculadoValues((prev) => ({
        ...prev,
        [produtoId]: novoPreco,
      }));
    } else {
      setPrecoCalculadoValues((prev) => ({ ...prev, [produtoId]: "" }));
    }
  };

  const handleAplicarMarkup = async (produto: Produto) => {
    const precoCalculado = precoCalculadoValues[produto._id];
    if (precoCalculado && typeof precoCalculado === "number") {
      try {
        await handleSalvarPreco(produto.id || "", precoCalculado);
        // Limpar os valores após aplicar
        setMarkupValues((prev) => ({ ...prev, [produto._id]: "" }));
        setPrecoCalculadoValues((prev) => ({ ...prev, [produto._id]: "" }));
      } catch (error) {
        console.error("Erro ao aplicar markup:", error);
      }
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              onClick={() => toggleSort("codigo")}
              className="cursor-pointer hover:bg-muted/50"
            >
              SKU
              {getSortIcon("codigo")}
            </TableHead>
            <TableHead
              onClick={() => toggleSort("nome")}
              className="cursor-pointer hover:bg-muted/50"
            >
              Descrição
              {getSortIcon("nome")}
            </TableHead>
            <TableHead
              onClick={() => toggleSort("preco_custo")}
              className="cursor-pointer hover:bg-muted/50"
            >
              Preço Custo
              {getSortIcon("preco_custo")}
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
              onClick={() => toggleSort("preco")}
              className="cursor-pointer hover:bg-muted/50"
            >
              Preço Venda
              {getSortIcon("preco")}
            </TableHead>
            <TableHead>
              <Tooltip>
                <TooltipTrigger>
                  <span>Markup</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Base de cálculo: Custo de Composição
                    <br />
                    Exemplo: Se o Custo de Composição é R$ 100,00 e o Markup é
                    2, o Preço será R$ 200,00.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead>Preço Calculado</TableHead>
            <TableHead>Aplicar</TableHead>
            <TableHead>Ações</TableHead>
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
                {produto.preco_custo
                  ? produto.preco_custo.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "-"}
              </TableCell>
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
                {produto.updatePrice ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <span>
                        {produto.preco
                          ? produto.preco.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })
                          : "-"}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Última atualização:{" "}
                        {produto.updatePrice instanceof Date
                          ? produto.updatePrice.toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : new Date(produto.updatePrice).toLocaleString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ) : produto.preco ? (
                  produto.preco.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder="Markup"
                  step="0.01"
                  min="0"
                  value={markupValues[produto._id] || ""}
                  onChange={(e) =>
                    handleMarkupChange(produto._id, e.target.value)
                  }
                  className="w-[100px] text-right"
                />
              </TableCell>
              <TableCell className="text-right">
                {precoCalculadoValues[produto._id] !== undefined &&
                precoCalculadoValues[produto._id] !== ""
                  ? (
                      precoCalculadoValues[produto._id] as number
                    ).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "-"}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAplicarMarkup(produto)}
                  disabled={!precoCalculadoValues[produto._id]}
                  className="text-green-600 border-green-200 hover:bg-green-50 disabled:opacity-50"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Aplicar
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open(
                        `https://erp.tiny.com.br/produtos#edit/${produto.id}`,
                        "_blank"
                      );
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAbrirModal(produto)}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAbrirHistoricoModal(produto)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <History className="h-4 w-4 mr-1" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal de alteração de preço */}
      {produtoSelecionado && (
        <AlterarPrecoModal
          produto={produtoSelecionado}
          isOpen={modalOpen}
          onClose={handleFecharModal}
          onSave={handleSalvarPreco}
        />
      )}

      {/* Modal de histórico de preços */}
      {produtoSelecionado && (
        <HistoricoPrecoModal
          produto={produtoSelecionado}
          isOpen={historicoModalOpen}
          onClose={handleFecharHistoricoModal}
        />
      )}
    </>
  );
}
