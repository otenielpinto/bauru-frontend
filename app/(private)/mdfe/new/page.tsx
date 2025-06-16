"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Wand2,
  Save,
  Trash2,
  Edit,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

import { getMdfeConfig } from "@/actions/actMdfeConfig";
import { getAllMdfeEmitentes } from "@/actions/actMdfeEmitente";
import { getMdfeById, createMdfe, updateMdfe } from "@/actions/actMdfeEnvio";
import { MdfeStatus } from "@/types/MdfeEnvioTypes";
import { MdfeEmitenteForm } from "@/components/mdfe/MdfeEmitenteForm";
import { MdfeDadosForm } from "@/components/mdfe/MdfeDadosForm";
import { MdfeRodoviarioForm } from "@/components/mdfe/MdfeRodoviarioForm";
import { MdfeAquaviarioForm } from "@/components/mdfe/MdfeAquaviarioForm";
import { MdfeDocumentosForm } from "@/components/mdfe/MdfeDocumentosForm";
import { MdfeTotalizadoresForm } from "@/components/mdfe/MdfeTotalizadoresForm";
import { MdfeInformacoesAdicionaisForm } from "@/components/mdfe/MdfeInformacoesAdicionaisForm";
import {
  MdfeFormData,
  MdfeFormMode,
  MdfeResponse,
} from "@/types/MdfeEnvioTypes";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { lib } from "@/lib/lib";
import {
  getFormDataForStep,
  validateStepData,
  initializeOptimizedFormData,
} from "@/lib/utils";

const stepsDoc = ["ide", "emit", "rodo", "aquav", "infDoc", "tot", "infAdic"];
const steps = [
  "Dados",
  "Emitente",
  "Rodoviario",
  "Aquaviario",
  "Informacoes dos Documentos",
  "Totalizadores",
  "Informacoes adicionais",
];

export default function NewMdfePage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditMode: boolean = Boolean(editId);
  const mode: MdfeFormMode = isEditMode ? "edit" : "create";

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<MdfeFormData | any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMdfe, setIsLoadingMdfe] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  /**
   * Load MDFe data for editing with optimized structure
   */
  const loadMdfeForEdit = useCallback(
    async (id: string) => {
      try {
        setIsLoadingMdfe(true);

        const response = await getMdfeById(id);

        if (response.success && response.data) {
          const mdfeData = response.data;

          // Process and format data for form inputs
          const processedData = {
            ...mdfeData,
            ide: {
              ...mdfeData.ide,
              dhEmi: mdfeData.ide?.dhEmi
                ? mdfeData.ide.dhEmi
                : lib.formatDateForInput(new Date()),
              dtEmi: mdfeData.ide?.dtEmi
                ? new Date(mdfeData.ide.dtEmi)
                : new Date(),
              hora:
                mdfeData.ide?.hora ||
                new Date().toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }),
            },
          };

          setFormData(processedData);

          toast({
            title: "MDFe Carregado",
            description: `MDFe "${
              processedData.ide?.numero || processedData.id
            }" carregado para edição.`,
          });
        } else {
          toast({
            title: "Erro ao carregar MDFe",
            description:
              response.message ||
              "MDFe não encontrado. Redirecionando para modo de criação.",
            variant: "destructive",
          });

          router.replace("/mdfe/new");
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro inesperado ao carregar MDFe para edição.",
          variant: "destructive",
        });

        router.replace("/mdfe/new");
      } finally {
        setIsLoadingMdfe(false);
      }
    },
    [router, toast]
  );

  /**
   * Load default configuration with optimized structure
   */
  const loadDefaultConfig = useCallback(async () => {
    try {
      const [configResponse, emitenteResponse] = await Promise.all([
        getMdfeConfig(),
        getAllMdfeEmitentes(),
      ]);

      if (configResponse.success && configResponse.data) {
        const config = configResponse.data;
        const cMDF = String(Math.floor(Math.random() * 1000000)).padStart(
          8,
          "0"
        );

        // Initialize with optimized structure using aliases
        const defaultFormData = initializeOptimizedFormData({
          id_empresa: config.id_empresa || 0,
          id_tenant: config.id_tenant || 0,
          id: uuidv4(),
          dt_movto: new Date(),

          ide: {
            cUF: config.cUF?.toString() || "",
            tpEmit: config.tpEmit?.toString() || "1",
            tpTransp: config.tpTransp?.toString() || "1",
            tpAmb: config.tpAmb?.toString() || "2",
            tpEmis: config.tpEmis?.toString() || "1",
            mod: config.mod?.toString() || "58",
            serie: config.serie?.toString() || "1",
            nMDF: "",
            cMDF: cMDF,
            cDV: "",
            dhEmi: lib.formatDateForInput(new Date()),
            dtEmi: new Date(),
            hora: new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            tpModal: config.modal?.toString() || "1",
            procEmi: "",
            verProc: config.verProc || "1.0",
            ufIni: config.UFIni || "",
            ufFim: config.UFFim || "",
            dhIniViagem: "",
            indCanalVerde: false,
            indCarregaPosterior: false,
            infMunCarrega:
              config.infMunCarrega && config.infMunCarrega.length > 0
                ? config.infMunCarrega
                : [{ cMunCarrega: "", xMunCarrega: "" }],
            infPercurso:
              config.infPercurso && config.infPercurso.length > 0
                ? config.infPercurso.map((p: any) => p.UFPer).join(", ")
                : "",
          },

          emit: {
            CNPJ: "",
            IE: "",
            xNome: "",
            xFant: "",
            enderEmit: {
              xLgr: "",
              nro: "",
              xCpl: "",
              xBairro: "",
              cMun: "",
              xMun: "",
              CEP: "",
              UF: "",
              fone: "",
              email: "",
            },
          },

          rodo: {
            codigoAgregacao: config.codigoAgregacao || "",
            placaVeiculo: config.placaVeiculo || "",
            renavam: config.renavam || "",
            tara: config.tara || "",
            capacidadeKG: config.capacidadeKG || "",
            capacidadeM3: config.capacidadeM3 || "",
            tpCar: config.tpCar || "",
            tpRod: config.tpRod || "",
            condutores: [{ xNome: config.xNome || "", cpf: config.cpf || "" }],
            rntrc: config.rntrc || "",
            ciot: config.ciot || "",
            infANTT: {},
            veicTracao: {},
            veicReboque: {},
            valePed: {},
            codAgPorto: config.codAgPorto || "",
            lacRodo: [], // Initialize as empty collection
          },

          tot: {
            qCTe: "",
            qNFe: "",
            qMDFe: "",
            vCarga: "",
            cUnid: "",
            qCarga: "",
          },
          infDoc: {
            nfe: [],
            cte: [],
            mdf: [],

            cMunCarrega: config.cMunCarrega || "",
            xMunCarrega: config.xMunCarrega || "",
            cMunDescarga: config.cMunDescarga || "",
            xMunDescarga: config.xMunDescarga || "",
          },
          infAdic: {
            infCpl: "",
            infAdFisco: "",
          },
          seg: {},
          prodPred: [], // Initialize as empty array
          infMDFeSupl: {},
          infRespTec: {
            cnpj: "",
            xContato: "",
            email: "",
            fone: "",
            idCSRT: 0,
            hashCSRT: "",
          },
          autXML: [],
          lacres: [],

          // Keep existing fields for compatibility
          referencia: {},
          status: MdfeStatus.PENDENTE,
          qrCodMDFe: "",
          chave: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Pre-populate emitente if available
        if (
          emitenteResponse.success &&
          emitenteResponse.data &&
          Array.isArray(emitenteResponse.data) &&
          emitenteResponse.data.length > 0
        ) {
          const primeiroEmitente = emitenteResponse.data[0];
          defaultFormData.emit = {
            CNPJ: primeiroEmitente.cpfcnpj || "",
            IE: primeiroEmitente.ie || "",
            xNome: primeiroEmitente.razao_social || "",
            xFant: primeiroEmitente.fantasia || "",
            enderEmit: {
              xLgr: primeiroEmitente.logradouro || "",
              nro: primeiroEmitente.numero || "",
              xCpl: primeiroEmitente.complemento || "",
              xBairro: primeiroEmitente.bairro || "",
              cMun: primeiroEmitente.codigo_municipio?.toString() || "",
              xMun: primeiroEmitente.nome_municipio || "",
              CEP: primeiroEmitente.cep || "",
              UF: primeiroEmitente.uf || "",
              fone: primeiroEmitente.telefone || "",
              email: primeiroEmitente.email || "",
            },
          };
        } else {
          toast({
            title: "Nenhum Emitente Encontrado",
            description:
              "Nenhum emitente cadastrado. Cadastre um emitente antes de continuar.",
            variant: "destructive",
          });
        }

        setFormData(defaultFormData);
      } else {
        toast({
          title: "Configuração não encontrada",
          description: "Usando configuração padrão mínima.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar configuração padrão.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Optimized useEffect with proper dependency array and cleanup
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts

    const loadData = async () => {
      if (!isMounted) return;

      setIsLoading(true);

      try {
        if (isEditMode && editId) {
          await loadMdfeForEdit(editId);
        } else {
          await loadDefaultConfig();
        }
      } catch (error) {
        console.error("Error in data loading:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [editId, isEditMode, loadMdfeForEdit, loadDefaultConfig]); // Add proper dependencies

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitStep = (stepData: any) => {
    const stepName = stepsDoc[currentStep];

    setFormData((prev: any) => ({
      ...prev,
      [stepName]: stepData,
    }));

    if (currentStep < steps.length - 1) {
      handleNext();
    }
  };

  const handleEmit = async () => {
    if (!formData || Object.keys(formData).length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum dado disponível para processar o MDF-e.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields using centralized validation
    const requiredSteps = ["emit"];
    const validation = validateStepData(formData, requiredSteps);

    if (!validation.isValid) {
      toast({
        title: "Erro de Validação",
        description: `Preencha os seguintes passos obrigatórios: ${validation.missingSteps.join(
          ", "
        )}`,
        variant: "destructive",
      });
      return;
    }

    // Additional validation for emitter CNPJ
    if (!formData.emit?.CNPJ) {
      toast({
        title: "Erro de Validação",
        description: "CNPJ do emitente é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    // Validate documents for creation mode
    if (mode === "create") {
      const hasDocuments = () => {
        const docs = formData.infDoc;
        if (!docs) return false;
        const nfeCount = docs.nfe?.length || 0;
        const cteCount = docs.cte?.length || 0;
        const mdfCount = docs.mdf?.length || 0;
        return nfeCount > 0 || cteCount > 0 || mdfCount > 0;
      };

      if (!hasDocuments()) {
        toast({
          title: "Erro de Validação",
          description:
            "É necessário adicionar pelo menos uma nota fiscal (NF-e, CT-e ou MDF-e) antes de emitir o MDF-e.",
          variant: "destructive",
        });
        return;
      }
    }

    startTransition(async () => {
      try {
        let result: MdfeResponse;

        if (isEditMode && editId) {
          // Update existing MDFe
          const updateData = {
            ...formData,
            updatedAt: new Date(),
          };

          result = await updateMdfe(editId, updateData);

          if (result.success) {
            toast({
              title: "MDF-e Atualizado",
              description:
                result.message ||
                "O MDF-e foi atualizado e emitido com sucesso.",
            });

            // Invalidate cache to ensure fresh data when navigating back
            await queryClient.invalidateQueries({ queryKey: ["mdfes"] });
            router.push(`/mdfe`);
          } else {
            toast({
              title: "Erro ao atualizar MDF-e",
              description:
                result.message || "Ocorreu um erro ao atualizar o MDF-e.",
              variant: "destructive",
            });
          }
        } else {
          // Create new MDFe
          const createData = {
            ...formData,
            dt_movto: new Date(),
            status: MdfeStatus.PENDENTE,
          };

          result = await createMdfe(createData);

          if (result.success) {
            toast({
              title: "MDF-e Emitido",
              description: result.message || "O MDF-e foi emitido com sucesso.",
            });

            // Invalidate cache to ensure fresh data when navigating back
            await queryClient.invalidateQueries({ queryKey: ["mdfes"] });
            router.push(`/mdfe`);
          } else {
            toast({
              title: "Erro ao emitir MDF-e",
              description:
                result.message || "Ocorreu um erro ao emitir o MDF-e.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error(
          `Error ${isEditMode ? "updating" : "creating"} MDFe:`,
          error
        );
        toast({
          title: "Erro",
          description: `Erro inesperado ao ${
            isEditMode ? "atualizar" : "emitir"
          } o MDF-e.`,
          variant: "destructive",
        });
      }
    });
  };

  const isProcessing = isPending || isLoading || isLoadingMdfe;

  return (
    <div className="space-y-6">
      <Link href="/mdfe">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Editar MDF-e" : "Emitir novo MDF-e"}
          </h1>
          {isEditMode && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Edit className="h-3 w-3" />
              Modo Edição
            </Badge>
          )}
          {isLoadingMdfe && (
            <Badge variant="outline" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Carregando dados...
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleEmit} disabled={isProcessing}>
            <Wand2 className="mr-2 h-4 w-4" />
            {isPending
              ? isEditMode
                ? "Atualizando..."
                : "Emitindo..."
              : isEditMode
              ? "Atualizar"
              : "Emitir"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-2 whitespace-nowrap">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                index <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`${
                index === currentStep ? "font-bold" : "text-muted-foreground"
              }`}
            >
              {step}
            </span>
            {index < steps.length - 1 && <div className="h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      <div className="rounded-md border p-6">
        {isLoading || isLoadingMdfe ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                {isLoadingMdfe
                  ? "Carregando dados do MDF-e..."
                  : "Carregando configuração padrão..."}
              </p>
            </div>
          </div>
        ) : (
          <>
            {currentStep === 0 && (
              <MdfeDadosForm
                onSubmit={handleSubmitStep}
                initialData={getFormDataForStep(formData, "ide")}
              />
            )}
            {currentStep === 1 && (
              <MdfeEmitenteForm
                onSubmit={handleSubmitStep}
                initialData={getFormDataForStep(formData, "emit")}
              />
            )}
            {currentStep === 2 && (
              <MdfeRodoviarioForm
                onSubmit={handleSubmitStep}
                initialData={getFormDataForStep(formData, "rodo")}
              />
            )}
            {currentStep === 3 && (
              <MdfeAquaviarioForm
                onSubmit={handleSubmitStep}
                initialData={getFormDataForStep(formData, "aquav")}
              />
            )}
            {currentStep === 4 && (
              <MdfeDocumentosForm
                onSubmit={handleSubmitStep}
                initialData={getFormDataForStep(formData, "infDoc")}
              />
            )}
            {currentStep === 5 && (
              <MdfeTotalizadoresForm
                onSubmit={handleSubmitStep}
                initialData={formData || {}}
              />
            )}
            {currentStep === 6 && (
              <MdfeInformacoesAdicionaisForm
                onSubmit={handleSubmitStep}
                initialData={getFormDataForStep(formData, "infAdic")}
              />
            )}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
              >
                Voltar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
