import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface MdfeInformacoesAdicionaisFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function MdfeInformacoesAdicionaisForm({
  onSubmit,
  initialData,
}: MdfeInformacoesAdicionaisFormProps) {
  const [formData, setFormData] = useState({
    infAdFisco: initialData?.infAdFisco || "",
    infCpl: initialData?.infCpl || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6">
            <div>
              <Label htmlFor="infAdFisco" className="mb-2 block">
                Informações Adicionais de Interesse do Fisco
              </Label>
              <Textarea
                id="infAdFisco"
                name="infAdFisco"
                value={formData.infAdFisco}
                onChange={handleChange}
                placeholder="Informações adicionais de interesse do Fisco"
                rows={4}
                className="resize-none"
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Máximo 2.000 caracteres
              </p>
            </div>
            <div>
              <Label htmlFor="infCpl" className="mb-2 block">
                Informações Complementares de Interesse do Contribuinte
              </Label>
              <Textarea
                id="infCpl"
                name="infCpl"
                value={formData.infCpl}
                onChange={handleChange}
                placeholder="Informações complementares de interesse do contribuinte"
                rows={4}
                className="resize-none"
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Máximo 5.000 caracteres
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seguro</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-6">
            <Button type="button" variant="outline">
              + Adicionar Seguro
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produto predominante</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prodPred">Nome do produto predominante</Label>
              <Input
                id="prodPred"
                name="prodPred"
                placeholder="Nome do produto predominante"
              />
            </div>
            <div>
              <Label htmlFor="tpCarga">Tipo de carga</Label>
              <Input id="tpCarga" name="tpCarga" placeholder="Tipo de carga" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="cEAN">
                Código de barras do produto (GTIN/EAN)
              </Label>
              <Input
                id="cEAN"
                name="cEAN"
                placeholder="Código de barras do produto"
              />
            </div>
            <div>
              <Label htmlFor="ncm">Código NCM</Label>
              <Input id="ncm" name="ncm" placeholder="Código NCM" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Finalizar</Button>
      </div>
    </form>
  );
}
