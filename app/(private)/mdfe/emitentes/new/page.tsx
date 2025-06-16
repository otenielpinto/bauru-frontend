import { Metadata } from "next";
import EmitenteForm from "@/components/mdfe/EmitenteForm";

export const metadata: Metadata = {
  title: "Novo Emitente - MDF-e",
  description: "Cadastro de novo emitente para Manifesto Eletrônico de Documentos Fiscais",
};

export default function EmitenteNewPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Novo Emitente</h1>
        <p className="text-muted-foreground">
          Cadastre um novo emitente para Manifesto Eletrônico de Documentos Fiscais
        </p>
      </div>
      
      <EmitenteForm />
    </div>
  );
}
