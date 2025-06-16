"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // Assumindo que utils.ts existe para cn

const UFs = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

const emitenteFormSchema = z.object({
  CNPJ: z.string().min(1, "CNPJ é obrigatório"),
  IE: z.string().min(1, "Inscrição Estadual é obrigatória"),
  xNome: z
    .string()
    .min(1, "Razão Social é obrigatória")
    .max(60, "Máximo de 60 caracteres"),
  xFant: z.string().max(60, "Máximo de 60 caracteres").optional(),
  enderEmit: z.object({
    xLgr: z
      .string()
      .min(1, "Logradouro é obrigatório")
      .max(60, "Máximo de 60 caracteres"),
    nro: z
      .string()
      .min(1, "Número é obrigatório")
      .max(10, "Máximo de 10 caracteres"),
    xCpl: z.string().max(60, "Máximo de 60 caracteres").optional(),
    xBairro: z
      .string()
      .min(1, "Bairro é obrigatório")
      .max(60, "Máximo de 60 caracteres"),
    cMun: z
      .string()
      .min(7, "Cód. Município deve ter 7 dígitos")
      .max(7, "Cód. Município deve ter 7 dígitos")
      .regex(/^\d+$/, "Apenas números"), // TODO: Melhorar validação/busca
    xMun: z
      .string()
      .min(1, "Município é obrigatório")
      .max(60, "Máximo de 60 caracteres"), // TODO: Melhorar validação/busca
    CEP: z.string().min(1, "CEP é obrigatório"),

    UF: z.enum(UFs, { required_error: "UF é obrigatória" }),
    fone: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
  }),
});

type EmitenteFormValues = z.infer<typeof emitenteFormSchema>;

interface MdfeEmitenteFormProps {
  onSubmit: (data: EmitenteFormValues) => void;
  initialData?: EmitenteFormValues;
}

export function MdfeEmitenteForm({
  onSubmit,
  initialData,
}: MdfeEmitenteFormProps) {
  const form = useForm<EmitenteFormValues>({
    resolver: zodResolver(emitenteFormSchema),
    defaultValues: initialData,
    mode: "onChange", // ou "onBlur"
  });

  const handleSubmit = (data: EmitenteFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="CNPJ"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  CNPJ <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  {/* TODO: Implementar máscara ##.###.###/####-## */}
                  <Input placeholder="00.000.000/0000-00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="IE"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Inscrição Estadual <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Número da Inscrição Estadual"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="xNome"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>
                  Razão Social <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo da empresa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="xFant"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Fantasia</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome popular da empresa (opcional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card>
          <CardHeader>
            <CardTitle>Endereço do Emitente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="enderEmit.xLgr"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>
                      Logradouro <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, Avenida, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enderEmit.nro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Número <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="enderEmit.xCpl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Apto, Bloco, Sala (opcional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enderEmit.xBairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Bairro <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="enderEmit.CEP"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      CEP <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      {/* TODO: Implementar máscara #####-### e busca automática */}
                      <Input placeholder="00000-000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enderEmit.cMun"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Cód. Município (IBGE){" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      {/* TODO: Idealmente buscar via CEP ou Select */}
                      <Input
                        type="number"
                        placeholder="Código IBGE (7 dígitos)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enderEmit.UF"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      UF <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a UF" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UFs.map((uf) => (
                          <SelectItem key={uf} value={uf}>
                            {uf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="enderEmit.xMun"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Município <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    {/* TODO: Idealmente buscar via CEP ou Select */}
                    <Input placeholder="Nome do município" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="enderEmit.fone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      {/* TODO: Implementar máscara dinâmica (##) #####-#### ou (##) ####-#### */}
                      <Input
                        type="tel"
                        placeholder="(00) 00000-0000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enderEmit.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contato@empresa.com (opcional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-4">
          <Button type="submit">Continuar</Button>
        </div>
      </form>
    </Form>
  );
}
