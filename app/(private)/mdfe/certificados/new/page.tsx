import { Metadata } from "next";
import CertificadoForm from "@/components/mdfe/CertificadoForm";

export const metadata: Metadata = {
  title: "Novo Certificado - MDF-e",
  description:
    "Cadastro de novo certificado para Manifesto Eletrônico de Documentos Fiscais",
};

export default function CertificadoNewPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Novo Certificado</h1>
        <p className="text-muted-foreground">
          Cadastre um novo certificado digital para Manifesto Eletrônico de
          Documentos Fiscais
        </p>
      </div>

      <CertificadoForm />
    </div>
  );
}
