"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { MdfeCertificado } from "@/types/MdfeCertificadoTypes";
import { createMdfeCertificado } from "@/actions/actMdfeCertificado";
import { useToast } from "@/components/ui/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Loader2, FileUp } from "lucide-react";

// Schema for form validation
const certificadoFormSchema = z.object({
  cpfcnpj: z.string().min(1, "CNPJ/CPF é obrigatório"),
  senha: z.string().min(1, "Senha do certificado é obrigatória"),
  data_vencimento: z.string().min(1, "Data de vencimento é obrigatória"),
});

type CertificadoFormValues = z.infer<typeof certificadoFormSchema>;

export default function CertificadoForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate default expiration date (360 days from today)
  const getDefaultExpirationDate = (): string => {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 360);

    // Format date as YYYY-MM-DD for HTML date input
    return expirationDate.toISOString().split("T")[0];
  };

  // Initialize form with empty values and auto-calculated expiration date
  const form = useForm<CertificadoFormValues>({
    resolver: zodResolver(certificadoFormSchema),
    defaultValues: {
      cpfcnpj: "",
      senha: "",
      data_vencimento: getDefaultExpirationDate(),
    },
    // Reset form on component mount to ensure fields are empty
    resetOptions: {
      keepDirtyValues: false,
    },
  });

  // Reset form when component mounts to prevent auto-fill
  useEffect(() => {
    form.reset({
      cpfcnpj: "",
      senha: "",
      data_vencimento: getDefaultExpirationDate(),
    });

    setSelectedFile(null);

    const timer = setTimeout(() => {
      form.reset({
        cpfcnpj: "",
        senha: "",
        data_vencimento: getDefaultExpirationDate(),
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [form]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle form submission
  async function onSubmit(data: CertificadoFormValues) {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo de certificado",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Lê o arquivo como ArrayBuffer (equivalente a File.ReadAllBytes em C#)
      // Este processo converte o arquivo em um array de bytes
      const fileBuffer = await selectedFile.arrayBuffer();

      // Converte ArrayBuffer para Uint8Array para garantir que temos um array de bytes
      const uint8Array = new Uint8Array(fileBuffer);

      // Converte para string base64 para armazenamento no banco de dados
      // Isso é equivalente a Convert.ToBase64String(bytes) em C#
      const base64String = Buffer.from(uint8Array).toString("base64");

      // Create certificate data with auto-generated ID if available
      const certificadoData: MdfeCertificado = {
        id: undefined, // Let the server generate the ID
        cpfcnpj: data.cpfcnpj,
        senha: data.senha,
        data_vencimento: new Date(data.data_vencimento), // Convert string to Date
        arquivoBase64: base64String, // Store as base64 string
      };

      const response = await createMdfeCertificado(certificadoData);

      if (response.success) {
        toast({
          title: "Sucesso",
          description: "Certificado cadastrado com sucesso",
        });
        router.push("/mdfe/certificados");
        router.refresh();
      } else {
        toast({
          title: "Erro",
          description: response.message || "Erro ao cadastrar certificado",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o certificado",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastrar Certificado Digital</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        >
          <CardContent className="space-y-4">
            {/* Hidden fields to trick browser autocomplete */}
            <div style={{ display: "none" }}>
              <input
                type="text"
                name="fakeusernameremembered"
                autoComplete="off"
              />
              <input
                type="password"
                name="fakepasswordremembered"
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* CNPJ/CPF */}
              <FormField
                control={form.control}
                name="cpfcnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ/CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o CNPJ ou CPF"
                        {...field}
                        autoComplete="off"
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? e.target.value : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      CNPJ ou CPF do emitente do certificado
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Arquivo do Certificado */}
              <FormItem>
                <FormLabel>Arquivo do Certificado</FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="file"
                      accept=".pfx,.p12"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="hidden"
                      autoComplete="off"
                    />
                    <div className="flex gap-2 items-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FileUp className="h-4 w-4 mr-2" />
                        Selecionar Arquivo
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {selectedFile
                          ? selectedFile.name
                          : "Nenhum arquivo selecionado"}
                      </span>
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Selecione o arquivo de certificado digital (.pfx ou .p12)
                </FormDescription>
                <FormMessage />
              </FormItem>

              {/* Senha do Certificado */}
              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha do Certificado</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Digite a senha do certificado"
                        {...field}
                        autoComplete="off"
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? e.target.value : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Senha utilizada para acessar o certificado digital
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Data de Vencimento */}
              <FormField
                control={form.control}
                name="data_vencimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Vencimento</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        placeholder="Selecione a data de vencimento"
                        {...field}
                        autoComplete="off"
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? e.target.value : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Data em que o certificado digital vence
                    </FormDescription>
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
              Cadastrar
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
