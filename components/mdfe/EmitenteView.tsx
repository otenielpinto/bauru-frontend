"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdfeEmitente } from "@/types/MdfeEmitenteTypes";
import { deleteMdfeEmitente, deleteMdfeEmitenteByObjectId } from "@/actions/actMdfeEmitente";
import { useToast } from "@/components/ui/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface EmitenteViewProps {
  emitente: MdfeEmitente;
}

export default function EmitenteView({ emitente }: EmitenteViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o emitente ${emitente.razao_social}?`)) {
      try {
        setIsDeleting(true);
        let response;
        
        if (emitente._id) {
          response = await deleteMdfeEmitenteByObjectId(emitente._id.toString());
        } else if (emitente.id) {
          response = await deleteMdfeEmitente(emitente.id);
        } else {
          throw new Error("ID do emitente não encontrado");
        }
        
        if (response.success) {
          toast({
            title: "Sucesso",
            description: "Emitente excluído com sucesso",
          });
          router.push("/mdfe/emitentes");
          router.refresh();
        } else {
          toast({
            title: "Erro",
            description: response.message || "Erro ao excluir emitente",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erro ao excluir emitente:", error);
        toast({
          title: "Erro",
          description: "Falha ao excluir o emitente",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes do Emitente</CardTitle>
        <CardDescription>
          Informações completas do emitente MDF-e
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações Básicas */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Informações Básicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">ID</p>
              <p>{emitente.id || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Empresa</p>
              <p>{emitente.empresa || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CNPJ/CPF</p>
              <p>{emitente.cpfcnpj || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Razão Social</p>
              <p>{emitente.razao_social || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nome Fantasia</p>
              <p>{emitente.fantasia || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inscrição Estadual</p>
              <p>{emitente.ie || "Não informado"}</p>
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Logradouro</p>
              <p>{emitente.logradouro || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Número</p>
              <p>{emitente.numero || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Complemento</p>
              <p>{emitente.complemento || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bairro</p>
              <p>{emitente.bairro || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Município</p>
              <p>{emitente.nome_municipio || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Código do Município</p>
              <p>{emitente.codigo_municipio || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">UF</p>
              <p>{emitente.uf || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CEP</p>
              <p>{emitente.cep || "Não informado"}</p>
            </div>
          </div>
        </div>

        {/* Contato */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Contato</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p>{emitente.telefone || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p>{emitente.email || "Não informado"}</p>
            </div>
          </div>
        </div>

        {/* Certificado */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Certificado Digital</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Modo do Certificado</p>
              <p>{emitente.modcertificado || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Token</p>
              <p>{emitente.token || "Não informado"}</p>
            </div>
          </div>
        </div>

        {/* Datas */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Datas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Criado em</p>
              <p>{emitente.createdAt ? new Date(emitente.createdAt).toLocaleString() : "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Atualizado em</p>
              <p>{emitente.updatedAt ? new Date(emitente.updatedAt).toLocaleString() : "Não informado"}</p>
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
          <Link href={`/mdfe/emitentes/edit/${emitente._id || emitente.id}`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Excluir
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
