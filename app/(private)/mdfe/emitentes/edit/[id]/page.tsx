import { Metadata } from "next";
import { notFound } from "next/navigation";
import EmitenteForm from "@/components/mdfe/EmitenteForm";
import {
  getMdfeEmitenteById,
  getMdfeEmitenteByObjectId,
} from "@/actions/actMdfeEmitente";
import { isValidObjectId } from "@/lib/utils";

interface EmitenteEditPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: EmitenteEditPageProps): Promise<Metadata> {
  const { id } = await params;

  // Try to fetch the emitente to get the name for the title
  let emitenteName = "Editar Emitente";

  try {
    let response;
    if (isValidObjectId(id)) {
      response = await getMdfeEmitenteByObjectId(id);
    } else {
      response = await getMdfeEmitenteById(Number(id));
    }

    if (response.success && response.data) {
      emitenteName =
        `Editar ${response.data.razao_social}` || "Editar Emitente";
    }
  } catch (error) {
    console.error("Error fetching emitente for metadata:", error);
  }

  return {
    title: `${emitenteName} - MDF-e`,
    description: "Edição de emitente MDF-e",
  };
}

export default async function EmitenteEditPage({
  params,
}: EmitenteEditPageProps) {
  const { id } = await params;

  // Fetch emitente data
  let response;
  try {
    if (isValidObjectId(id)) {
      response = await getMdfeEmitenteByObjectId(id);
    } else {
      response = await getMdfeEmitenteById(Number(id));
    }
  } catch (error) {
    console.error("Error fetching emitente:", error);
    notFound();
  }

  if (!response.success || !response.data) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Editar Emitente</h1>
        <p className="text-muted-foreground">
          Atualize as informações do emitente MDF-e
        </p>
      </div>

      <EmitenteForm emitente={response.data} isEdit={true} />
    </div>
  );
}
