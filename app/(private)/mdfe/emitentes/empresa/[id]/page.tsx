import { Metadata } from "next";
import EmitentesTable from "@/components/mdfe/EmitentesTable";

interface EmitentesEmpresaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: EmitentesEmpresaPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Emitentes MDF-e - Empresa ${id}`,
    description: `Listagem de emitentes para Manifesto Eletrônico de Documentos Fiscais da empresa ${id}`,
  };
}

export default async function EmitentesEmpresaPage({
  params,
}: EmitentesEmpresaPageProps) {
  const { id } = await params;
  const empresaId = parseInt(id, 10);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Emitentes MDF-e - Empresa {empresaId}
        </h1>
        <p className="text-muted-foreground">
          Emitentes para Manifestos Eletrônicos de Documentos Fiscais da empresa{" "}
          {empresaId}
        </p>
      </div>

      <EmitentesTable empresaId={empresaId} />
    </div>
  );
}
