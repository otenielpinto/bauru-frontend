"use client";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Motorista } from "@/types/MotoristaTypes";
import { getMotoristaByObjectId } from "@/actions/actMotorista";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MotoristaView() {
  const router = useRouter();
  const { id } = useParams();
  const [motorista, setMotorista] = useState<Motorista | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMotorista() {
      try {
        setLoading(true);
        const response: any = await getMotoristaByObjectId(id as string);

        if (response.success && response.data) {
          setMotorista(response.data);
        } else {
          setError(response.message || "Motorista não encontrado");
        }
      } catch (err) {
        setError("Erro ao carregar dados do motorista");
        console.error("Erro ao buscar motorista:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchMotorista();
    }
  }, [id]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Motorista</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando dados do motorista...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Motorista</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!motorista) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Motorista</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Motorista não encontrado.</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes do Motorista</CardTitle>
        <CardDescription>Informações completas do motorista</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações Pessoais */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Informações Pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p>{motorista?.xNome || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CPF</p>
              <p>{motorista?.cpf || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CNH</p>
              <p>{motorista?.cnh || "Não informado"}</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Status</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p>{motorista?.status || "Não informado"}</p>
            </div>
          </div>
        </div>

        {/* Datas */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Datas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Criado em</p>
              <p>
                {motorista?.createdAt
                  ? new Date(motorista.createdAt).toLocaleString()
                  : "Não informado"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Atualizado em</p>
              <p>
                {motorista?.updatedAt
                  ? new Date(motorista.updatedAt).toLocaleString()
                  : "Não informado"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex gap-2">
          <Link
            href={`/mdfe/motoristas/edit/${motorista?._id || motorista?.id}`}
          >
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
