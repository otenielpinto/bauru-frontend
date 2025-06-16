import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMunicipioByUfAndDescricao } from "@/actions/actMunicipio";

// Zod schema for document validation
const documentoSchema = z.object({
  chave: z
    .string()
    .min(1, "Chave é obrigatória")
    .length(44, "Chave deve ter exatamente 44 dígitos")
    .regex(/^\d{44}$/, "Chave deve conter apenas números"),
  segCodBarra: z.string().optional(),
  indReentrega: z.boolean(),
  pesoTotal: z.string().optional(),
  valor: z.string().optional(),
  cMunCarrega: z.string().optional(),
  xMunCarrega: z
    .string()
    .min(1, "Município de carregamento é obrigatório")
    .min(2, "Município deve ter pelo menos 2 caracteres"),
  cMunDescarga: z.string().optional(),
  xMunDescarga: z
    .string()
    .min(1, "Município de descarregamento é obrigatório")
    .min(2, "Município deve ter pelo menos 2 caracteres"),
  ufDescarga: z
    .string()
    .min(1, "UF é obrigatória")
    .length(2, "UF deve ter exatamente 2 caracteres")
    .regex(/^[A-Z]{2}$/, "UF deve conter apenas letras maiúsculas"),
});

// Custom error types
class DocumentValidationError extends Error {
  constructor(message: string, public field: string, public code: string) {
    super(message);
    this.name = "DocumentValidationError";
  }
}

// Types
type ValidationErrors = Partial<Record<keyof Documento, string>>;

interface MdfeDocumentosFormProps {
  onSubmit: (data: any) => void;
  initialData?: {
    nfe?: Documento[];
    cte?: Documento[];
    mdf?: Documento[];
    cMunCarrega: string;
    xMunCarrega: string;
    cMunDescarga: string;
    xMunDescarga: string;
  };
}

interface Documento {
  chave: string;
  segCodBarra: string;
  indReentrega: boolean;
  pesoTotal: string;
  valor: string;
  cMunCarrega: string;
  xMunCarrega: string;
  cMunDescarga: string;
  xMunDescarga: string;
  ufDescarga: string;
}

export function MdfeDocumentosForm({
  onSubmit,
  initialData,
}: MdfeDocumentosFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("nfe");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isValidating, setIsValidating] = useState(false);

  const [selectedUf, setSelectedUf] = useState<string>("RS");

  const [documentos, setDocumentos] = useState<{
    nfe: Documento[];
    cte: Documento[];
    mdf: Documento[];
  }>({
    nfe: initialData?.nfe || [],
    cte: initialData?.cte || [],
    mdf: initialData?.mdf || [],
  });

  const [novoDocumento, setNovoDocumento] = useState<Documento>({
    chave: "",
    segCodBarra: "",
    indReentrega: false,
    pesoTotal: "",
    valor: "",
    cMunCarrega: initialData?.cMunCarrega || "",
    xMunCarrega: initialData?.xMunCarrega || "",
    cMunDescarga: initialData?.cMunDescarga || "",
    xMunDescarga: initialData?.xMunDescarga || "",
    ufDescarga: "RS",
  });

  // Update state when initialData changes
  useEffect(() => {
    if (initialData) {
      setDocumentos({
        nfe: initialData.nfe || [],
        cte: initialData.cte || [],
        mdf: initialData.mdf || [],
      });

      setNovoDocumento((prev) => ({
        ...prev,
        cMunCarrega: initialData?.cMunCarrega || "",
        xMunCarrega: initialData?.xMunCarrega || "",
        cMunDescarga: initialData?.cMunDescarga || "",
        xMunDescarga: initialData?.xMunDescarga || "",
        ufDescarga: prev.ufDescarga, // Keep the current UF selection
      }));
    }
  }, [initialData]);

  /**
   * Validates document data using Zod schema
   * @param documento - Document data to validate
   * @returns Object with validation result and errors
   */
  const validateDocumento = (documento: Documento) => {
    try {
      documentoSchema.parse(documento);
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: ValidationErrors = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof Documento;
          errors[field] = err.message;
        });
        return { isValid: false, errors };
      }
      return {
        isValid: false,
        errors: { chave: "Erro de validação desconhecido" },
      };
    }
  };

  /**
   * Clears validation errors for a specific field
   * @param fieldName - Name of the field to clear errors for
   */
  const clearFieldError = (fieldName: keyof Documento) => {
    if (validationErrors[fieldName]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldName = name as keyof Documento;

    setNovoDocumento((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear validation error for this field when user starts typing
    clearFieldError(fieldName);
  };

  const handleAddDocumento = async () => {
    setIsValidating(true);

    try {
      // Early return for empty chave
      if (!novoDocumento.chave.trim()) {
        throw new DocumentValidationError(
          "Chave do documento é obrigatória",
          "chave",
          "REQUIRED_FIELD"
        );
      }

      // Validate document with Zod schema
      const { isValid, errors } = validateDocumento(novoDocumento);

      if (!isValid) {
        setValidationErrors(errors);

        // Show toast with first error
        const firstError = Object.values(errors)[0];
        toast({
          variant: "destructive",
          title: "Erro de Validação",
          description: firstError,
          duration: 4000,
        });

        return;
      }

      // Busca automática do código IBGE para município de carregamento
      try {
        if (
          novoDocumento.xMunDescarga.trim() &&
          novoDocumento.ufDescarga.trim()
        ) {
          const municipioDescarga = await getMunicipioByUfAndDescricao(
            novoDocumento.ufDescarga.trim(),
            novoDocumento.xMunDescarga.trim()
          );

          if (municipioDescarga?.codigoIbge) {
            novoDocumento.cMunDescarga =
              municipioDescarga.codigoIbge.toString();
          }
        }
      } catch (error) {
        console.error("Erro ao buscar código do município de descarga:", error);
        // Não bloqueia o processo se falhar na busca do município
      }

      // Success path - add document
      setDocumentos((prev) => ({
        ...prev,
        [activeTab]: [
          ...prev[activeTab as keyof typeof documentos],
          { ...novoDocumento },
        ],
      }));

      // Reset form
      setNovoDocumento({
        chave: "",
        segCodBarra: "",
        indReentrega: false,
        pesoTotal: "",
        valor: "",
        cMunCarrega: "",
        xMunCarrega: "",
        cMunDescarga: "",
        xMunDescarga: "",
        ufDescarga: "RS", // Reset to default UF
      });

      // Clear any existing errors
      setValidationErrors({});

      // Show success toast
      toast({
        title: "Documento Adicionado",
        description: "Documento foi adicionado com sucesso à lista.",
        duration: 3000,
      });
    } catch (error) {
      if (error instanceof DocumentValidationError) {
        setValidationErrors({ [error.field]: error.message });
        toast({
          variant: "destructive",
          title: "Erro de Validação",
          description: error.message,
          duration: 4000,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro Inesperado",
          description:
            "Ocorreu um erro ao adicionar o documento. Tente novamente.",
          duration: 4000,
        });
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveDocumento = (index: number) => {
    setDocumentos((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab as keyof typeof documentos].filter(
        (_, i) => i !== index
      ),
    }));

    toast({
      title: "Documento Removido",
      description: "Documento foi removido da lista.",
      duration: 2000,
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validate that at least one document exists
    const totalDocuments = Object.values(documentos).reduce(
      (total, docs) => total + docs.length,
      0
    );

    if (totalDocuments === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum Documento",
        description: "Adicione pelo menos um documento antes de continuar.",
        duration: 3000,
      });
      return;
    }

    onSubmit(documentos);
  };

  /**
   * Renders input with validation state
   */
  const renderInputWithValidation = (
    id: string,
    name: keyof Documento,
    label: string,
    placeholder?: string,
    type: string = "text",
    maxLength?: number,
    required: boolean = false
  ) => {
    const hasError = !!validationErrors[name];
    const value = novoDocumento[name];

    return (
      <div className="space-y-2">
        <Label
          htmlFor={id}
          className={cn(
            "flex items-center gap-1",
            required && "after:content-['*'] after:text-red-500"
          )}
        >
          {label}
          {hasError && <AlertCircle className="h-4 w-4 text-red-500" />}
          {!hasError && value && required && (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
        </Label>
        <Input
          id={id}
          name={name}
          value={value as string}
          onChange={handleChange}
          placeholder={placeholder}
          type={type}
          maxLength={maxLength}
          autoComplete="off"
          className={cn(
            "transition-colors",
            hasError &&
              "border-red-500 focus:border-red-500 focus:ring-red-500",
            !hasError && value && required && "border-green-500"
          )}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
        />
        {hasError && (
          <p
            id={`${id}-error`}
            className="text-sm text-red-600 flex items-center gap-1"
          >
            <AlertCircle className="h-4 w-4" />
            {validationErrors[name]}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações dos Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="nfe">NF-e</TabsTrigger>
                <TabsTrigger value="cte">CT-e</TabsTrigger>
                <TabsTrigger value="mdf">MDF-e</TabsTrigger>
              </TabsList>

              <TabsContent value="nfe" className="space-y-6">
                <div className="grid grid-cols-6 gap-4">
                  <div className="col-span-3">
                    {renderInputWithValidation(
                      "chave",
                      "chave",
                      "Chave da NF-e",
                      "Informe a chave da NF-e (44 dígitos)",
                      "text",
                      44,
                      true
                    )}
                  </div>
                  <div>
                    {renderInputWithValidation(
                      "segCodBarra",
                      "segCodBarra",
                      "Cód. Barras",
                      "Código de barras"
                    )}
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="indReentrega"
                        name="indReentrega"
                        checked={novoDocumento.indReentrega}
                        onChange={handleChange}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="indReentrega">Reentrega</Label>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleAddDocumento}
                      disabled={isValidating}
                      className="w-full"
                    >
                      {isValidating ? "Validando..." : "+ Adicionar"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    {renderInputWithValidation(
                      "pesoTotal",
                      "pesoTotal",
                      "Peso (Kg)",
                      "0,00",
                      "number"
                    )}
                  </div>
                  <div>
                    {renderInputWithValidation(
                      "valor",
                      "valor",
                      "Valor",
                      "0,00",
                      "number"
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    {renderInputWithValidation(
                      "xMunCarrega",
                      "xMunCarrega",
                      "Município de Carregamento",
                      "Nome do município",
                      "text",
                      undefined,
                      true
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    {renderInputWithValidation(
                      "xMunDescarga",
                      "xMunDescarga",
                      "Município de Descarregamento",
                      "Nome do município",
                      "text",
                      undefined,
                      true
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="ufDescarga"
                      className="flex items-center gap-1 after:content-['*'] after:text-red-500"
                    >
                      UF
                    </Label>
                    <Select
                      value={novoDocumento.ufDescarga}
                      onValueChange={(value) => {
                        setNovoDocumento((prev) => ({
                          ...prev,
                          ufDescarga: value,
                        }));
                        clearFieldError("ufDescarga");
                      }}
                    >
                      <SelectTrigger
                        className={cn(
                          "transition-colors",
                          validationErrors.ufDescarga && "border-red-500",
                          !validationErrors.ufDescarga &&
                            novoDocumento.ufDescarga &&
                            "border-green-500"
                        )}
                      >
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AC">AC</SelectItem>
                        <SelectItem value="AL">AL</SelectItem>
                        <SelectItem value="AP">AP</SelectItem>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="BA">BA</SelectItem>
                        <SelectItem value="CE">CE</SelectItem>
                        <SelectItem value="DF">DF</SelectItem>
                        <SelectItem value="ES">ES</SelectItem>
                        <SelectItem value="GO">GO</SelectItem>
                        <SelectItem value="MA">MA</SelectItem>
                        <SelectItem value="MT">MT</SelectItem>
                        <SelectItem value="MS">MS</SelectItem>
                        <SelectItem value="MG">MG</SelectItem>
                        <SelectItem value="PA">PA</SelectItem>
                        <SelectItem value="PB">PB</SelectItem>
                        <SelectItem value="PR">PR</SelectItem>
                        <SelectItem value="PE">PE</SelectItem>
                        <SelectItem value="PI">PI</SelectItem>
                        <SelectItem value="RJ">RJ</SelectItem>
                        <SelectItem value="RN">RN</SelectItem>
                        <SelectItem value="RS">RS</SelectItem>
                        <SelectItem value="RO">RO</SelectItem>
                        <SelectItem value="RR">RR</SelectItem>
                        <SelectItem value="SC">SC</SelectItem>
                        <SelectItem value="SP">SP</SelectItem>
                        <SelectItem value="SE">SE</SelectItem>
                        <SelectItem value="TO">TO</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.ufDescarga && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.ufDescarga}
                      </p>
                    )}
                  </div>
                </div>

                {documentos.nfe.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Chave
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Peso
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor
                          </th>

                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Carrega
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descarga
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            UF
                          </th>

                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {documentos.nfe.map((doc, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                              {doc.chave}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {doc.pesoTotal}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {doc.valor}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {doc.xMunCarrega}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {doc.xMunDescarga}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                              {doc.ufDescarga}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button
                                type="button"
                                variant="ghost"
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleRemoveDocumento(index)}
                              >
                                Remover
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 border rounded-md">
                    <p className="text-center text-muted-foreground">
                      Nenhuma NF-e adicionada
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cte" className="space-y-6">
                {/* Similar structure as NF-e tab but for CT-e documents */}
                <div className="p-4 border rounded-md">
                  <p className="text-center text-muted-foreground">
                    Nenhum CT-e adicionado
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="mdf" className="space-y-6">
                {/* Similar structure as NF-e tab but for MDF-e documents */}
                <div className="p-4 border rounded-md">
                  <p className="text-center text-muted-foreground">
                    Nenhum MDF-e adicionado
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Continuar</Button>
      </div>
    </form>
  );
}
