import { Metadata } from "next";
import EmitentesTable from "@/components/mdfe/EmitentesTable";

interface EmitentesUfPageProps {
  params: Promise<{
    uf: string;
  }>;
}

export async function generateMetadata({
  params,
}: EmitentesUfPageProps): Promise<Metadata> {
  const { uf } = await params;

  return {
    title: `Emitentes MDF-e - ${uf.toUpperCase()}`,
    description: `Listagem de emitentes para Manifesto Eletrônico de Documentos Fiscais no estado ${uf.toUpperCase()}`,
  };
}

export default async function EmitentesUfPage({
  params,
}: EmitentesUfPageProps) {
  const { uf } = await params;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Emitentes MDF-e - {uf.toUpperCase()}
        </h1>
        <p className="text-muted-foreground">
          Emitentes para Manifestos Eletrônicos de Documentos Fiscais no estado{" "}
          {uf.toUpperCase()}
        </p>
      </div>

      <EmitentesTable uf={uf} />
    </div>
  );
}
