"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import { Motorista } from "@/types/MotoristaTypes";
import {
  getMotoristaByObjectId,
  updateMotoristaByObjectId,
} from "@/actions/actMotorista";
import { useToast } from "@/components/ui/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// Schema for form validation (same as new page)
const motoristaFormSchema = z.object({
  xNome: z.string().min(1, "Nome é obrigatório"),
  cpf: z
    .string()
    .min(11, "cpf deve ter 11 dígitos")
    .max(11, "cpf deve ter 11 dígitos")
    .regex(/^\d+$/, "cpf deve conter apenas números"),
  cnh: z.string().max(11, "cnh deve ter 11 dígitos").optional(),
  status: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
});

type MotoristaFormValues = z.infer<typeof motoristaFormSchema>;

export default function MotoristaEditPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Initialize form with empty values (will be populated after fetch)
  const form = useForm<MotoristaFormValues>({
    resolver: zodResolver(motoristaFormSchema),
    defaultValues: {
      xNome: "",
      cpf: "",
      cnh: "",
      status: "Ativo",
      telefone: "",
      email: "",
    },
  });

  // Fetch motorista data on mount
  useEffect(() => {
    const fetchMotorista = async () => {
      try {
        const response: any = await getMotoristaByObjectId(params.id as string);

        if (response.success && response.data) {
          form.reset({
            xNome: response.data.xNome,
            cpf: response.data.cpf,
            cnh: response.data.cnh,
            status: response.data.status || "Ativo",
            telefone: response.data.telefone || "",
            email: response.data.email || "",
          });
        } else {
          setNotFound(true);
          toast({
            title: "Erro",
            description: response.message || "Motorista não encontrado",
            variant: "destructive",
          });
          router.push("/mdfe/motoristas");
        }
      } catch (error) {
        console.error("Erro ao buscar motorista:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao buscar o motorista",
          variant: "destructive",
        });
        router.push("/mdfe/motoristas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMotorista();
  }, [params.id, form, router, toast]);

  async function onSubmit(data: MotoristaFormValues) {
    setIsSubmitting(true);
    try {
      const response: any = await updateMotoristaByObjectId(
        params.id as string,
        data
      );

      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Motorista atualizado com sucesso",
        });
        router.push("/mdfe/motoristas");
        router.refresh();
      } else {
        toast({
          title: "Erro",
          description: response.message || "Erro ao atualizar motorista",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar motorista:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o motorista",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Motorista não encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p>O motorista solicitado não foi encontrado.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push("/mdfe/motoristas")}>
            Voltar para lista
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Motorista</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <FormField
                control={form.control}
                name="xNome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome do motorista"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* cpf */}
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>cpf</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="cpf (apenas números)"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* cnh */}
              <FormField
                control={form.control}
                name="cnh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>cnh</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="cnh (apenas números)"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Telefone */}
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Telefone"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Email"
                        type="email"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salvar
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
