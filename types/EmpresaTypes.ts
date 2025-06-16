/**
 * Empresa type definition
 */
export interface Empresa {
  _id?: any; // MongoDB ObjectId
  id?: number;
  dtCadastro?: Date; // Data de cadastro
  nome?: string; // Nome da empresa (até 60 caracteres)
  fantasia?: string; // Nome fantasia (até 60 caracteres)
  rua?: string; // Endereço - rua (até 60 caracteres)
  nro?: string; // Número do endereço (até 60 caracteres)
  bairro?: string; // Bairro (até 60 caracteres)
  cep?: string; // CEP
  cidade?: string; // Cidade (até 60 caracteres)
  uf?: string; // Unidade Federativa
  ddd?: number; // Código DDD
  telefone?: string; // Telefone
  fax?: string; // Fax
  email?: string; // Email (até 250 caracteres)
  website?: string; // Website (até 250 caracteres)
  cpfCnpj?: string; // CPF ou CNPJ
  ie?: string; // Inscrição Estadual
  im?: string; // Inscrição Municipal
  crt?: number; // Código de Regime Tributário
  multa?: number; // Valor da multa
  multaDias?: number; // Dias para aplicação da multa
  juros1?: number; // Percentual de juros 1
  juros2?: number; // Percentual de juros 2
  juros3?: number; // Percentual de juros 3
  jurosDias1?: number; // Dias para aplicação de juros 1
  jurosDias2?: number; // Dias para aplicação de juros 2
  jurosDias3?: number; // Dias para aplicação de juros 3
  tipoJuro?: string; // Tipo de juros (1 caractere)
  carta1?: number; // Configuração carta 1
  carta2?: number; // Configuração carta 2
  carta3?: number; // Configuração carta 3
  carta4?: number; // Configuração carta 4
  ativo?: string; // Status ativo (1 caractere - S/N)
  cnae?: number; // Código CNAE
  txPis?: number; // Taxa PIS
  txCofins?: number; // Taxa COFINS
  xIbge?: number; // Código IBGE
  usuario?: string; // Usuário (até 10 caracteres)
  logo?: Buffer | string; // Logo da empresa (binário)
  filial?: string; // É filial (1 caractere - S/N)
  estoquePorEmpresa?: string; // Controla estoque por empresa (1 caractere - S/N)
  revenda?: string; // Código de revenda (até 40 caracteres)
  tabelaPreco?: number; // ID da tabela de preços
  ultAtualizacao?: Date; // Última atualização
  id_tenant?: number; // ID do tenant
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Empresa response type for database operations
 */
export interface EmpresaResponse {
  success: boolean;
  message: string;
  data?: Empresa | Empresa[] | null;
  error?: string;
}

/**
 * Empresa form data type for create/update operations
 */
export interface EmpresaFormData {
  nome: string;
  fantasia?: string;
  rua?: string;
  nro?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  uf?: string;
  ddd?: number;
  telefone?: string;
  fax?: string;
  email?: string;
  website?: string;
  cpfCnpj: string;
  ie?: string;
  im?: string;
  crt?: number;
  cnae?: number;
  ativo?: string;
  filial?: string;
  estoquePorEmpresa?: string;
  id_tenant?: number; // ID do tenant
}
