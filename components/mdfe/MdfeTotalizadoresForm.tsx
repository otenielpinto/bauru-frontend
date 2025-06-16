import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TotalizadoresData {
  qCTe?: string;
  qNFe?: string;
  qMDFe?: string;
  vCarga: string;
  cUnid: string;
  qCarga: string;
}

interface MdfeTotalizadoresFormProps {
  onSubmit: (data: TotalizadoresData) => void;
  initialData?: Partial<any>;
}

export function MdfeTotalizadoresForm({
  onSubmit,
  initialData,
}: MdfeTotalizadoresFormProps) {
  const [formData, setFormData] = useState<TotalizadoresData>({
    qCTe: "0",
    qNFe: "0",
    qMDFe: "0",
    vCarga: "0.00",
    cUnid: "01",
    qCarga: "0.00",
  });

  // Update form data when initialData changes
  useEffect(() => {
    let totalizadores = initialData as TotalizadoresData | undefined;
    let docs: any = initialData?.infDoc;

    // Calculate totals from documents
    if (docs) {
      const qNFe = docs.nfe?.length || 0;
      const qCTe = docs.cte?.length || 0;
      const qMDFe = docs.mdf?.length || 0;

      // Calculate total value from all documents
      const vCargaNFe =
        docs.nfe?.reduce(
          (sum: number, nfe: any) => sum + parseFloat(nfe.valor || 0),
          0
        ) || 0;
      const vCargaCTe =
        docs.cte?.reduce(
          (sum: number, cte: any) => sum + parseFloat(cte.valor || 0),
          0
        ) || 0;
      const vCargaMDFe =
        docs.mdf?.reduce(
          (sum: number, mdf: any) => sum + parseFloat(mdf.valor || 0),
          0
        ) || 0;
      const vCargaTotal = vCargaNFe + vCargaCTe + vCargaMDFe;

      // Calculate total weight from all documents
      const qCargaNFe =
        docs.nfe?.reduce(
          (sum: number, nfe: any) => sum + parseFloat(nfe.pesoTotal || 0),
          0
        ) || 0;
      const qCargaCTe =
        docs.cte?.reduce(
          (sum: number, cte: any) => sum + parseFloat(cte.pesoTotal || 0),
          0
        ) || 0;
      const qCargaMDFe =
        docs.mdf?.reduce(
          (sum: number, mdf: any) => sum + parseFloat(mdf.pesoTotal || 0),
          0
        ) || 0;
      const qCargaTotal = qCargaNFe + qCargaCTe + qCargaMDFe;

      setFormData((prev) => ({
        ...prev,
        qCTe: qCTe.toString(),
        qNFe: qNFe.toString(),
        qMDFe: qMDFe.toString(),
        vCarga: vCargaTotal.toFixed(2),
        cUnid: totalizadores?.cUnid ?? prev.cUnid,
        qCarga: qCargaTotal.toFixed(3),
      }));
    } else if (totalizadores) {
      setFormData((prev) => ({
        ...prev,
        qCTe: totalizadores.qCTe ?? prev.qCTe,
        qNFe: totalizadores.qNFe ?? prev.qNFe,
        qMDFe: totalizadores.qMDFe ?? prev.qMDFe,
        vCarga: totalizadores.vCarga ?? prev.vCarga,
        cUnid: totalizadores.cUnid ?? prev.cUnid,
        qCarga: totalizadores.qCarga ?? prev.qCarga,
      }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = () => {
    return (
      formData.vCarga &&
      parseFloat(formData.vCarga) > 0 &&
      formData.qCarga &&
      parseFloat(formData.qCarga) > 0
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Totalizadores</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="qCTe">Quantidade de CT-e</Label>
              <Input
                id="qCTe"
                name="qCTe"
                value={formData.qCTe}
                onChange={handleChange}
                type="number"
                min="0"
                disabled
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="qNFe">Quantidade de NF-e</Label>
              <Input
                id="qNFe"
                name="qNFe"
                value={formData.qNFe}
                onChange={handleChange}
                type="number"
                min="0"
                disabled
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="qMDFe">Quantidade de MDF-e</Label>
              <Input
                id="qMDFe"
                name="qMDFe"
                value={formData.qMDFe}
                onChange={handleChange}
                type="number"
                min="0"
                disabled
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="vCarga">* Valor total da carga (R$)</Label>
              <Input
                id="vCarga"
                name="vCarga"
                value={formData.vCarga}
                onChange={handleChange}
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0,00"
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="cUnid">* Unidade de medida</Label>
              <div className="flex border rounded-md">
                <div className="px-3 py-2 bg-muted border-r min-w-[60px] text-center">
                  {formData.cUnid === "01" ? "KG" : "TON"}
                </div>
                <input
                  type="radio"
                  id="cUnid01"
                  name="cUnid"
                  value="01"
                  checked={formData.cUnid === "01"}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cUnid: e.target.value }))
                  }
                  className="hidden"
                />
                <label
                  htmlFor="cUnid01"
                  className={`flex-1 text-center py-2 cursor-pointer transition-colors ${
                    formData.cUnid === "01"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, cUnid: "01" }))
                  }
                >
                  KG
                </label>
                <input
                  type="radio"
                  id="cUnid02"
                  name="cUnid"
                  value="02"
                  checked={formData.cUnid === "02"}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cUnid: e.target.value }))
                  }
                  className="hidden"
                />
                <label
                  htmlFor="cUnid02"
                  className={`flex-1 text-center py-2 cursor-pointer transition-colors ${
                    formData.cUnid === "02"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, cUnid: "02" }))
                  }
                >
                  TON
                </label>
              </div>
            </div>
            <div>
              <Label htmlFor="qCarga">* Peso total da carga</Label>
              <Input
                id="qCarga"
                name="qCarga"
                value={formData.qCarga}
                onChange={handleChange}
                type="number"
                step="0.001"
                min="0"
                required
                placeholder="0,000"
                autoComplete="off"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!isFormValid()}>
          Continuar
        </Button>
      </div>
    </form>
  );
}
