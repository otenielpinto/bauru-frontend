import { Metadata } from "next";
import CertificadosTable from "@/components/mdfe/CertificadosTable";

export const metadata: Metadata = {
  title: "Certificados MDF-e",
  description: "Listagem de certificados para Manifesto Eletrônico de Documentos Fiscais",
};

export default function CertificadosPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Certificados MDF-e</h1>
        <p className="text-muted-foreground">
          Gerencie os certificados digitais para seus Manifestos Eletrônicos de Documentos Fiscais
        </p>
      </div>
      
      <CertificadosTable />
    </div>
  );
}
