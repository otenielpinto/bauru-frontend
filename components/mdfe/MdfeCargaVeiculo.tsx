"use client";

import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";

// Lista de tipos de rodados
const tiposRodado = [
  { value: "01", label: "Truck" },
  { value: "02", label: "Toco" },
  { value: "03", label: "Cavalo Mecânico" },
  { value: "04", label: "VAN" },
  { value: "05", label: "Utilitário" },
  { value: "06", label: "Outros" },
];

// Lista de tipos de carrocerias
const tiposCarroceria = [
  { value: "00", label: "Não aplicável" },
  { value: "01", label: "Aberta" },
  { value: "02", label: "Fechada/Baú" },
  { value: "03", label: "Graneleira" },
  { value: "04", label: "Porta Container" },
  { value: "05", label: "Sider" },
];

// Lista de estados brasileiros
const estadosBrasileiros = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

// Unidades de medida
const unidadesMedida = [
  { value: "KG", label: "KG" },
  { value: "TON", label: "TON" },
];

// Schema de validação para o formulário
const cargaVeiculoSchema = z.object({
  // Informações do Veículo
  RNTRC: z.string().optional(),
  CIOT: z.string().optional(),
  codInternoVeiculo: z.string().optional(),
  placa: z
    .string()
    .min(7, "Placa deve ter 7 caracteres")
    .max(7, "Placa deve ter 7 caracteres")
    .regex(
      /^[A-Z]{3}[0-9]{4}$|^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/,
      "Formato de placa inválido"
    ),
  UF: z.string().min(2, "UF é obrigatória"),
  tipoRodado: z.string(),
  tipoCarroceria: z.string(),
  taraKG: z.string().transform((val) => Number(val) || 0),
  capacidadeKG: z.string().transform((val) => Number(val) || 0),
  capacidadeM3: z.string().transform((val) => Number(val) || 0),

  // Informações do Condutor
  CPF: z
    .string()
    .min(11, "CPF deve ter 11 dígitos")
    .max(11, "CPF deve ter 11 dígitos")
    .regex(/^\d+$/, "CPF deve conter apenas números"),
  xNome: z.string().min(1, "Nome é obrigatório"),

  // Informações de Carregamento
  estadoCarregamento: z.string().min(2, "Estado de carregamento é obrigatório"),
  cidadeCarregamento: z.string().min(1, "Cidade de carregamento é obrigatória"),

  // Informações de Descarregamento
  estadoDescarregamento: z
    .string()
    .min(2, "Estado de descarregamento é obrigatório"),
  cidadeDescarregamento: z
    .string()
    .min(1, "Cidade de descarregamento é obrigatória"),

  // Estados do Percurso
  estadosPercurso: z.string().optional(),

  // Totais da Carga
  valorTotalCarga: z.string().transform((val) => Number(val) || 0),
  pesoBrutoTotal: z.string().transform((val) => Number(val) || 0),
  unidadeMedida: z.string().default("KG"),
});

type CargaVeiculoFormValues = z.infer<typeof cargaVeiculoSchema>;

interface MdfeCargaVeiculoProps {
  onSubmit: (data: CargaVeiculoFormValues) => void;
  defaultValues?: Partial<CargaVeiculoFormValues>;
}

export function MdfeCargaVeiculo({
  onSubmit,
  defaultValues,
}: MdfeCargaVeiculoProps) {
  const form = useForm<CargaVeiculoFormValues>({
    resolver: zodResolver(cargaVeiculoSchema),
    defaultValues: defaultValues || {
      RNTRC: "",
      CIOT: "",
      codInternoVeiculo: "",
      placa: "",
      UF: "SP",
      tipoRodado: "06",
      tipoCarroceria: "00",
      taraKG: 0,
      capacidadeKG: 0,
      capacidadeM3: 0,
      CPF: "",
      xNome: "",
      estadoCarregamento: "MG",
      cidadeCarregamento: "",
      estadoDescarregamento: "SP",
      cidadeDescarregamento: "",
      estadosPercurso: "",
      valorTotalCarga: 0,
      pesoBrutoTotal: 0,
      unidadeMedida: "KG",
    },
  });

  function handleSubmit(data: CargaVeiculoFormValues) {
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seção Veículo */}
          <Card>
            <CardHeader>
              <CardTitle>Sobre o Veículo</CardTitle>
              <CardDescription>
                Informações do veículo utilizado no transporte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* RNTRC */}
                <FormField
                  control={form.control}
                  name="RNTRC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RNTRC</FormLabel>
                      <FormControl>
                        <Input placeholder="RNTRC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CIOT */}
                <FormField
                  control={form.control}
                  name="CIOT"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CIOT</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Este é o "conta frete"'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Código Interno */}
                <FormField
                  control={form.control}
                  name="codInternoVeiculo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cód. Interno do Veículo</FormLabel>
                      <FormControl>
                        <Input placeholder="Opcional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Placa */}
                <FormField
                  control={form.control}
                  name="placa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa</FormLabel>
                      <FormControl>
                        <Input placeholder="AAA9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* UF */}
                <FormField
                  control={form.control}
                  name="UF"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {estadosBrasileiros.map((estado) => (
                            <SelectItem key={estado.value} value={estado.value}>
                              {estado.value} - {estado.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de Rodado */}
                <FormField
                  control={form.control}
                  name="tipoRodado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Rodado</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tiposRodado.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tipo de Carroceria */}
                <FormField
                  control={form.control}
                  name="tipoCarroceria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Carroceria</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tiposCarroceria.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Tara em KG */}
                <FormField
                  control={form.control}
                  name="taraKG"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tara em KG</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Capacidade em KG */}
                <FormField
                  control={form.control}
                  name="capacidadeKG"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidade em KG</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Capacidade em M3 */}
                <FormField
                  control={form.control}
                  name="capacidadeM3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidade em M3</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
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

          {/* Seção Condutor e Carregamento/Descarregamento */}
          <div className="space-y-6">
            {/* Informações do Condutor */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Condutor</CardTitle>
                <CardDescription>
                  Informações do motorista responsável
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* CPF */}
                  <FormField
                    control={form.control}
                    name="CPF"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input placeholder="Apenas números" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Nome Completo */}
                  <FormField
                    control={form.control}
                    name="xNome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do motorista" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Carregamento e Descarregamento */}
            <Card>
              <CardHeader>
                <CardTitle>Carregamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Estado de Carregamento */}
                  <FormField
                    control={form.control}
                    name="estadoCarregamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {estadosBrasileiros.map((estado) => (
                              <SelectItem
                                key={estado.value}
                                value={estado.value}
                              >
                                {estado.value} - {estado.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cidade de Carregamento */}
                  <FormField
                    control={form.control}
                    name="cidadeCarregamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Cidade de carregamento"
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

            <Card>
              <CardHeader>
                <CardTitle>Descarregamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Estado de Descarregamento */}
                  <FormField
                    control={form.control}
                    name="estadoDescarregamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {estadosBrasileiros.map((estado) => (
                              <SelectItem
                                key={estado.value}
                                value={estado.value}
                              >
                                {estado.value} - {estado.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cidade de Descarregamento */}
                  <FormField
                    control={form.control}
                    name="cidadeDescarregamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Cidade de descarregamento"
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
          </div>
        </div>

        {/* Estados do Percurso */}
        <Card>
          <CardHeader>
            <CardTitle>Estados do Percurso</CardTitle>
            <CardDescription>
              Estados por onde o veículo irá passar (separados por vírgula)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="estadosPercurso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estados</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Separados por vírgula: SP, RJ, MG"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Totais da Carga */}
        <Card>
          <CardHeader>
            <CardTitle>Totais da Carga</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Valor Total da Carga */}
              <FormField
                control={form.control}
                name="valorTotalCarga"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total da Carga</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Peso Bruto Total */}
              <FormField
                control={form.control}
                name="pesoBrutoTotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso Bruto Total da Carga</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unidade de Medida */}
              <FormField
                control={form.control}
                name="unidadeMedida"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unidadesMedida.map((unidade) => (
                          <SelectItem key={unidade.value} value={unidade.value}>
                            {unidade.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notas Fiscais */}
        <Card>
          <CardHeader>
            <CardTitle>Notas Fiscais Relacionadas</CardTitle>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Clique aqui para incluir notas fiscais eletrônicas no MDF-e
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Salvar e Continuar</Button>
        </div>
      </form>
    </Form>
  );
}
