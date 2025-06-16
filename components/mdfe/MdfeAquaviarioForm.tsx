import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MdfeAquaviarioFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function MdfeAquaviarioForm({
  onSubmit,
  initialData,
}: MdfeAquaviarioFormProps) {
  const [formData, setFormData] = useState({
    irin: initialData?.irin || "",
    nomeEmbarcacao: initialData?.nomeEmbarcacao || "",
    codigoEmbarcacao: initialData?.codigoEmbarcacao || "",
    balsa: initialData?.balsa || [],
  });

  const [novaBalsa, setNovaBalsa] = useState({
    codigoBalsa: "",
    identificacaoBalsa: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBalsaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNovaBalsa((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBalsa = () => {
    if (novaBalsa.identificacaoBalsa) {
      setFormData((prev) => ({
        ...prev,
        balsa: [...prev.balsa, { ...novaBalsa }],
      }));
      setNovaBalsa({
        codigoBalsa: "",
        identificacaoBalsa: "",
      });
    }
  };

  const handleRemoveBalsa = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      balsa: prev.balsa.filter((_: any, i: number) => i !== index),
    }));
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
            <CardTitle>Aquaviário</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="irin">* IRIN</Label>
              <Input
                id="irin"
                name="irin"
                value={formData.irin}
                onChange={handleChange}
                placeholder="Informe o IRIN da embarcação"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="nomeEmbarcacao">* Nome da Embarcação</Label>
              <Input
                id="nomeEmbarcacao"
                name="nomeEmbarcacao"
                value={formData.nomeEmbarcacao}
                onChange={handleChange}
                placeholder="Nome da embarcação"
              />
            </div>
            <div>
              <Label htmlFor="codigoEmbarcacao">* Código da Embarcação</Label>
              <Input
                id="codigoEmbarcacao"
                name="codigoEmbarcacao"
                value={formData.codigoEmbarcacao}
                onChange={handleChange}
                placeholder="Código da embarcação"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Balsas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <Label htmlFor="identificacaoBalsa">
                  * Identificação da Balsa
                </Label>
                <Input
                  id="identificacaoBalsa"
                  name="identificacaoBalsa"
                  value={novaBalsa.identificacaoBalsa}
                  onChange={handleBalsaChange}
                  placeholder="Identificação da balsa"
                />
              </div>
              <div>
                <Label htmlFor="codigoBalsa">Código da Balsa</Label>
                <Input
                  id="codigoBalsa"
                  name="codigoBalsa"
                  value={novaBalsa.codigoBalsa}
                  onChange={handleBalsaChange}
                  placeholder="Código da balsa"
                />
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={handleAddBalsa}>
                  + Adicionar
                </Button>
              </div>
            </div>

            {formData.balsa.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Identificação
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.balsa.map((balsa: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {balsa.identificacaoBalsa}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {balsa.codigoBalsa}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleRemoveBalsa(index)}
                          >
                            Remover
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 border rounded-md">
                <p className="text-center text-muted-foreground">
                  Nenhuma balsa adicionada
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Continuar</Button>
      </div>
    </form>
  );
}
