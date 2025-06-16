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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, User } from "lucide-react";
import { MdfeRodoviarioFormData, Condutor } from "@/types/MdfeConfigTypes";

interface MdfeRodoviarioFormProps {
  onSubmit: (data: any) => void;
  initialData?: MdfeRodoviarioFormData;
}

export function MdfeRodoviarioForm({
  onSubmit,
  initialData,
}: MdfeRodoviarioFormProps) {
  const [formData, setFormData] = useState({
    codigoAgregacao: initialData?.codigoAgregacao || "",
    placaVeiculo: initialData?.placaVeiculo || "",
    renavam: initialData?.renavam || "",
    tara: initialData?.tara || "",
    capacidadeKG: initialData?.capacidadeKG || "",
    capacidadeM3: initialData?.capacidadeM3 || "",
    tpCar: initialData?.tpCar || "02",
    tpRod: initialData?.tpRod || "01",
  });

  // State for conductors
  const [condutores, setCondutores] = useState<Condutor[]>(
    initialData?.condutores || []
  );

  // State for conductor modal
  const [isCondutorModalOpen, setIsCondutorModalOpen] = useState(false);

  // State for new conductor form data
  const [newCondutor, setNewCondutor] = useState<Condutor>({
    xNome: "",
    cpf: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes to the new conductor form
  const handleCondutorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCondutor((prev) => ({ ...prev, [name]: value }));
  };

  // Add a conductor to the list
  const handleAddCondutor = () => {
    // Validate fields
    if (!newCondutor.xNome || !newCondutor.cpf) {
      return; // Could add error handling here
    }

    // Add to list and close modal
    setCondutores((prev) => [...prev, { ...newCondutor }]);
    setIsCondutorModalOpen(false);

    // Reset form
    setNewCondutor({
      xNome: "",
      cpf: "",
    });
  };

  // Remove a conductor from the list
  const handleRemoveCondutor = (index: number) => {
    setCondutores((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Include the conductors in the form data
    onSubmit({
      ...formData,
      condutores,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rodoviário</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="codigoAgregacao">Código de Agregação</Label>
              <Input
                id="codigoAgregacao"
                name="codigoAgregacao"
                value={formData.codigoAgregacao}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="placaVeiculo">* Placa</Label>
              <Input
                id="placaVeiculo"
                name="placaVeiculo"
                value={formData.placaVeiculo}
                onChange={handleChange}
                placeholder="ABC1234"
              />
            </div>
            <div>
              <Label htmlFor="renavam">RENAVAM</Label>
              <Input
                id="renavam"
                name="renavam"
                value={formData.renavam}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="tara">* Tara em KG</Label>
              <Input
                id="tara"
                name="tara"
                value={formData.tara}
                onChange={handleChange}
                type="number"
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="capacidadeKG">* Capacidade em KG</Label>
              <Input
                id="capacidadeKG"
                name="capacidadeKG"
                value={formData.capacidadeKG}
                onChange={handleChange}
                type="number"
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="capacidadeM3">Capacidade em M³</Label>
              <Input
                id="capacidadeM3"
                name="capacidadeM3"
                value={formData.capacidadeM3}
                onChange={handleChange}
                type="number"
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="tpCar">* Tipo de Carroceria</Label>
              <Select
                name="tpCar"
                value={formData.tpCar}
                onValueChange={(value) => handleSelectChange("tpCar", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="00">Não aplicável</SelectItem>
                  <SelectItem value="01">Aberta</SelectItem>
                  <SelectItem value="02">Fechada/Baú</SelectItem>
                  <SelectItem value="03">Graneleira</SelectItem>
                  <SelectItem value="04">Porta Container</SelectItem>
                  <SelectItem value="05">Sider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tpRod">* Tipo de Rodado</Label>
              <Select
                name="tpRod"
                value={formData.tpRod}
                onValueChange={(value) => handleSelectChange("tpRod", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="01">Truck</SelectItem>
                  <SelectItem value="02">Toco</SelectItem>
                  <SelectItem value="03">Cavalo Mecânico</SelectItem>
                  <SelectItem value="04">VAN</SelectItem>
                  <SelectItem value="05">Utilitário</SelectItem>
                  <SelectItem value="06">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Condutores</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Adicione os condutores do veículo
              </p>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsCondutorModalOpen(true)}
              >
                + Adicionar Condutor
              </Button>
            </div>

            {condutores.length === 0 ? (
              <div className="p-4 border rounded-md">
                <p className="text-center text-muted-foreground">
                  Nenhum condutor adicionado
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {condutores.map((condutor, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 border rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4" />
                      <div>
                        <p className="font-medium">{condutor.xNome}</p>
                        <p className="text-xs text-muted-foreground">
                          CPF: {condutor.cpf}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCondutor(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para adicionar condutor */}
      <Dialog open={isCondutorModalOpen} onOpenChange={setIsCondutorModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Condutor</DialogTitle>
            <DialogDescription>
              Preencha os dados do condutor para adicioná-lo ao MDF-e.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="xNome">Nome do Condutor *</Label>
              <Input
                id="xNome"
                name="xNome"
                value={newCondutor.xNome}
                onChange={handleCondutorChange}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                name="cpf"
                value={newCondutor.cpf}
                onChange={handleCondutorChange}
                placeholder="Somente números"
                maxLength={11}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCondutorModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddCondutor}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end">
        <Button type="submit">Continuar</Button>
      </div>
    </form>
  );
}
