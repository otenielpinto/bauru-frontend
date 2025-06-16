import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConsultaMdfeNaoEncerradosForm } from "@/components/mdfe/ConsultaMdfeNaoEncerradosForm";
import { getMdfeEmitenteByUserCompany } from "@/actions/actMdfeEmitente";

export const metadata: Metadata = {
  title: "Consultar MDF-e Não Encerrados | MDFe SaaS",
  description: "Consulte MDF-e não encerrados na SEFAZ por CNPJ",
};

/**
 * Loading component para a página
 */
function ConsultaLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="flex space-x-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Componente que carrega os dados do emitente e renderiza o formulário
 */
async function ConsultaFormWithEmitente() {
  // Buscar o CNPJ do emitente da empresa do usuário
  const emitenteResponse = await getMdfeEmitenteByUserCompany();

  // Extrair o CNPJ se encontrado, senão usar string vazia
  const initialCnpj =
    emitenteResponse.success && emitenteResponse.data?.cpfcnpj
      ? emitenteResponse.data.cpfcnpj.replace(/\D/g, "") // Remove formatação se houver
      : "";

  return <ConsultaMdfeNaoEncerradosForm initialCnpj={initialCnpj} />;
}

/**
 * Página para consulta de MDF-e não encerrados
 */
export default function ConsultaMdfeNaoEncerradosPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header da página */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Search className="h-6 w-6" />
            Consultar MDF-e Não Encerrados
          </h1>
          <p className="text-muted-foreground mt-1">
            Consulte na SEFAZ os MDF-e que ainda não foram encerrados para um
            CNPJ específico
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/mdfe">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      {/* Informações importantes */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-blue-900">
                Informações Importantes
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Esta consulta busca MDF-e autorizados que ainda não foram
                  encerrados
                </li>
                <li>• O CNPJ da sua empresa será preenchido automaticamente</li>
                <li>• A consulta é realizada diretamente na SEFAZ</li>
                <li>
                  • MDF-e não encerrados devem ser finalizados em até 30 dias
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de consulta */}
      <Suspense fallback={<ConsultaLoading />}>
        <ConsultaFormWithEmitente />
      </Suspense>
    </div>
  );
}
