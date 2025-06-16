"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FileText, DollarSign, Weight } from "lucide-react";

interface MdfeTotalizadoresProps {
  mdfe: any;
}

export function MdfeTotalizadores({ mdfe }: MdfeTotalizadoresProps) {
  // Calcular totalizadores baseado nos documentos vinculados
  const calcularTotalizadores = () => {
    let qtdCTe = 0;
    let qtdNFe = 0;
    let valorTotal = 0;
    let pesoTotal = 0;

    // Contar CTes
    if (mdfe.infDoc?.infMunDescarga) {
      mdfe.infDoc.infMunDescarga.forEach((mun: any) => {
        if (mun.infCTe) {
          qtdCTe += Array.isArray(mun.infCTe) ? mun.infCTe.length : 1;
          // Somar valores dos CTes
          const ctes = Array.isArray(mun.infCTe) ? mun.infCTe : [mun.infCTe];
          ctes.forEach((cte: any) => {
            if (cte.vCarga) {
              valorTotal += parseFloat(cte.vCarga) || 0;
            }
          });
        }

        if (mun.infNFe) {
          qtdNFe += Array.isArray(mun.infNFe) ? mun.infNFe.length : 1;
          // Somar valores das NFes
          const nfes = Array.isArray(mun.infNFe) ? mun.infNFe : [mun.infNFe];
          nfes.forEach((nfe: any) => {
            if (nfe.vNF) {
              valorTotal += parseFloat(nfe.vNF) || 0;
            }
          });
        }
      });
    }

    // Peso total da carga
    if (mdfe.infModal?.rodo?.infANTT?.valePed?.disp) {
      mdfe.infModal.rodo.infANTT.valePed.disp.forEach((disp: any) => {
        if (disp.qTotProd) {
          pesoTotal += parseFloat(disp.qTotProd) || 0;
        }
      });
    }

    // Se não tiver peso específico, tentar pegar do tot
    if (pesoTotal === 0 && mdfe.tot?.qCTe) {
      pesoTotal = parseFloat(mdfe.tot.qCarga) || 0;
    }

    return {
      qtdCTe,
      qtdNFe,
      valorTotal,
      pesoTotal,
    };
  };

  const totalizadores = calcularTotalizadores();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatWeight = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Totalizadores da Carga</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-blue-500" />
              CTes
            </div>
            <div className="text-2xl font-bold">{totalizadores.qtdCTe}</div>
            <div className="text-xs text-muted-foreground">
              Conhecimentos de Transporte
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Package className="h-4 w-4 text-green-500" />
              NFes
            </div>
            <div className="text-2xl font-bold">{totalizadores.qtdNFe}</div>
            <div className="text-xs text-muted-foreground">
              Notas Fiscais Eletrônicas
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              Valor Total
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(totalizadores.valorTotal)}
            </div>
            <div className="text-xs text-muted-foreground">
              Valor da carga transportada
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Weight className="h-4 w-4 text-orange-500" />
              Peso Total
            </div>
            <div className="text-2xl font-bold">
              {formatWeight(totalizadores.pesoTotal)}
            </div>
            <div className="text-xs text-muted-foreground">
              Quilogramas (Kg)
            </div>
          </div>
        </div>

        {/* Informações adicionais se disponíveis */}
        {mdfe.tot && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">
              Informações do Totalizador
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {mdfe.tot.qCTe && (
                <div>
                  <span className="text-muted-foreground">Qtd CTe:</span>
                  <span className="ml-2 font-medium">{mdfe.tot.qCTe}</span>
                </div>
              )}
              {mdfe.tot.qNFe && (
                <div>
                  <span className="text-muted-foreground">Qtd NFe:</span>
                  <span className="ml-2 font-medium">{mdfe.tot.qNFe}</span>
                </div>
              )}
              {mdfe.tot.qMDFe && (
                <div>
                  <span className="text-muted-foreground">Qtd MDFe:</span>
                  <span className="ml-2 font-medium">{mdfe.tot.qMDFe}</span>
                </div>
              )}
              {mdfe.tot.vCarga && (
                <div>
                  <span className="text-muted-foreground">Valor Carga:</span>
                  <span className="ml-2 font-medium">
                    {formatCurrency(parseFloat(mdfe.tot.vCarga))}
                  </span>
                </div>
              )}
              {mdfe.tot.cUnid && (
                <div>
                  <span className="text-muted-foreground">Unidade:</span>
                  <span className="ml-2 font-medium">
                    {mdfe.tot.cUnid === "01"
                      ? "KG"
                      : mdfe.tot.cUnid === "02"
                      ? "TON"
                      : mdfe.tot.cUnid}
                  </span>
                </div>
              )}
              {mdfe.tot.qCarga && (
                <div>
                  <span className="text-muted-foreground">Quantidade:</span>
                  <span className="ml-2 font-medium">
                    {formatWeight(parseFloat(mdfe.tot.qCarga))}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
