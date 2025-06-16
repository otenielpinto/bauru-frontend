import { Metadata } from "next";
import EmitentesTable from "@/components/mdfe/EmitentesTable";

export const metadata: Metadata = {
  title: "Emitentes MDF-e",
  description: "Listagem de emitentes para Manifesto Eletrônico de Documentos Fiscais",
};

export default function EmitentesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Emitentes MDF-e</h1>
        <p className="text-muted-foreground">
          Gerencie os emitentes para seus Manifestos Eletrônicos de Documentos Fiscais
        </p>
      </div>
      
      <EmitentesTable />
    </div>
  );
}
