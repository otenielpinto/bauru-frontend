"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calculator, DollarSign } from "lucide-react";

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
}

interface AlterarPrecoModalProps {
  produto: Produto;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (produtoId: string, novoPreco: number) => Promise<void>;
}

export default function AlterarPrecoModal({
  produto,
  isOpen,
  onClose,
  onSave,
}: AlterarPrecoModalProps) {
  const [tipoAlteracao, setTipoAlteracao] = useState<"markup" | "preco">(
    "markup"
  );
  const [novoMarkup, setNovoMarkup] = useState("");
  const [novoPreco, setNovoPreco] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Calcular preço baseado no markup
  const calcularPrecoComMarkup = (markup: number) => {
    const precoCusto =
      produto.sys_total_preco_custo || produto.preco_custo || 0;
    return precoCusto * markup;
  };

  // Calcular markup baseado no preço
  const calcularMarkup = (preco: number) => {
    const precoCusto =
      produto.sys_total_preco_custo || produto.preco_custo || 0;
    if (precoCusto === 0) return 0;
    return preco / precoCusto;
  };

  const precoCalculado = novoMarkup
    ? calcularPrecoComMarkup(parseFloat(novoMarkup))
    : 0;

  const markupCalculado = novoPreco ? calcularMarkup(parseFloat(novoPreco)) : 0;

  const handleSave = async () => {
    if (!onSave) {
      toast({
        title: "Erro",
        description: "Função de salvamento não definida",
        variant: "destructive",
      });
      return;
    }

    let precoFinal = 0;

    if (tipoAlteracao === "markup") {
      if (!novoMarkup || parseFloat(novoMarkup) < 0) {
        toast({
          title: "Erro",
          description: "Informe um markup válido",
          variant: "destructive",
        });
        return;
      }
      precoFinal = calcularPrecoComMarkup(parseFloat(novoMarkup));
    } else {
      if (!novoPreco || parseFloat(novoPreco) <= 0) {
        toast({
          title: "Erro",
          description: "Informe um preço válido",
          variant: "destructive",
        });
        return;
      }
      precoFinal = parseFloat(novoPreco);
    }

    setIsLoading(true);

    try {
      await onSave(produto.id || produto._id, precoFinal);
      toast({
        title: "Sucesso",
        description: "Preço alterado com sucesso!",
      });
      handleClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar o preço. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTipoAlteracao("markup");
    setNovoMarkup("");
    setNovoPreco("");
    onClose();
  };

  const precoCusto = produto.preco_custo || produto.sys_total_preco_custo || 0;
  const precoAtual = produto.preco || 0;
  const markupAtual = produto.sys_markup_atual || 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Alterar Preço de Venda
          </DialogTitle>
          <DialogDescription>
            Produto: {produto.nome || produto.codigo || "Sem nome"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do produto */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Preço de Custo
              </Label>
              <p className="text-sm font-medium">
                {precoCusto.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Preço Atual
              </Label>
              <p className="text-sm font-medium">
                {precoAtual > 0
                  ? precoAtual.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "Não definido"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Markup Atual
              </Label>
              <p className="text-sm font-medium">
                {markupAtual > 0
                  ? `${markupAtual.toFixed(2)}%`
                  : "Não definido"}
              </p>
            </div>
          </div>

          {/* Tipo de alteração */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Tipo de Alteração</Label>
            <RadioGroup
              value={tipoAlteracao}
              onValueChange={(value) =>
                setTipoAlteracao(value as "markup" | "preco")
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="markup" id="markup" />
                <Label htmlFor="markup" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Alterar por Markup
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="preco" id="preco" />
                <Label htmlFor="preco" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Definir Preço Direto
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Campos de entrada */}
          {tipoAlteracao === "markup" ? (
            <div className="space-y-3">
              <Label htmlFor="novo-markup">Novo Markup (%)</Label>
              <Input
                id="novo-markup"
                type="number"
                step="0.01"
                min="0"
                value={novoMarkup}
                onChange={(e) => setNovoMarkup(e.target.value)}
                placeholder="Ex: 3.00"
              />
              {novoMarkup && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Label className="text-sm font-medium text-blue-800">
                    Preço Calculado:
                  </Label>
                  <p className="text-lg font-bold text-blue-900">
                    {precoCalculado.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <Label htmlFor="novo-preco">Novo Preço de Venda</Label>
              <Input
                id="novo-preco"
                type="number"
                step="0.01"
                min="0"
                value={novoPreco}
                onChange={(e) => setNovoPreco(e.target.value)}
                placeholder="Ex: 150.00"
              />
              {novoPreco && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <Label className="text-sm font-medium text-green-800">
                    Markup Resultante:
                  </Label>
                  <p className="text-lg font-bold text-green-900">
                    {markupCalculado.toFixed(2)}%
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Alteração"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
