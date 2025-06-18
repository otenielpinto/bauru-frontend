import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/actions/actSession";
import { saveProdutoPrecoLog } from "@/actions/actProdutoPreco";

/**
 * Interface para os dados de entrada
 */
interface PrecoUpdateRequest {
  id: string;
  preco: string;
}

/**
 * Interface para o payload que será enviado ao Tiny
 */
interface TinyPrecoPayload {
  precos: Array<{
    id: string;
    preco: string;
  }>;
}

/**
 * Interface para o retorno da API do Tiny
 */
interface TinyApiResponse {
  retorno: {
    status_processamento: string;
    status: string;
    registros?: Array<{
      registro: {
        id: string;
        sequencia: number;
        status: string;
        preco?: number;
        preco_promocional?: number;
        erro?: string;
        codigo_erro?: string;
      };
    }>;
    erros?: Array<{
      erro: string;
      codigo_erro?: string;
    }>;
  };
}

/**
 * Interface para o registro processado na resposta
 */
interface RegistroProcessado {
  id: string;
  sequencia: number;
  status: string;
  preco?: number;
  preco_promocional?: number;
  erro?: string;
  codigo_erro?: string;
}

/**
 * POST /api/tiny/atualizar-precos
 * Atualiza preços de produtos no Tiny ERP
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Verificar autenticação
    const user = await getUser();
    if (!user?.id_tenant) {
      return NextResponse.json(
        {
          error: "Usuário não autenticado",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    // 2. Obter e validar dados do body
    const body = await request.json();

    if (!body || !Array.isArray(body)) {
      return NextResponse.json(
        {
          error: "Body deve ser um array de objetos com campos 'id' e 'preco'",
          code: "INVALID_BODY",
        },
        { status: 400 }
      );
    }

    // 3. Validar estrutura dos dados
    const precos: PrecoUpdateRequest[] = body;
    let logPrecos: any = [];

    for (const item of precos) {
      if (!item.id || !item.preco) {
        return NextResponse.json(
          {
            error: "Cada item deve conter os campos 'id' e 'preco'",
            code: "MISSING_REQUIRED_FIELDS",
          },
          { status: 400 }
        );
      }

      logPrecos.push({
        id: item.id,
        preco: parseFloat(item.preco).toFixed(2),
      });

      // Validar se o preço é um número válido
      const precoNum = parseFloat(item.preco);
      if (isNaN(precoNum) || precoNum < 0) {
        return NextResponse.json(
          {
            error: `Preço inválido para o produto ${item.id}. Deve ser um número positivo.`,
            code: "INVALID_PRICE",
          },
          { status: 400 }
        );
      }
    }

    // 4. Preparar payload no formato esperado pelo Tiny
    const tinyPayload: TinyPrecoPayload = {
      precos: precos.map((item) => ({
        id: item.id,
        preco: parseFloat(item.preco).toFixed(2), // Formatar para 2 casas decimais
      })),
    };

    // 5. Enviar para API do Tiny (aqui você deve configurar a URL da API do Tiny)
    const tinyApiUrl =
      process.env.TINY_API_URL || "https://api.tiny.com.br/api2";
    const tinyToken = process.env.TINY_TOKEN || "";

    if (!tinyToken) {
      return NextResponse.json(
        {
          error: "Token do Tiny não configurado",
          code: "TINY_TOKEN_MISSING",
        },
        { status: 500 }
      );
    }

    // Configurar timeout para a requisição
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

    try {
      const tinyResponse = await fetch(
        `${tinyApiUrl}/produto.atualizar.precos.php?token=${tinyToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Bauru-Frontend/1.0",
          },
          body: JSON.stringify(tinyPayload),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (!tinyResponse.ok) {
        console.error(
          "Erro na resposta do Tiny:",
          tinyResponse.status,
          tinyResponse.statusText
        );

        let errorMessage = "Erro na comunicação com o Tiny ERP";
        try {
          const errorData = await tinyResponse.json();
          errorMessage = errorData?.message || errorData?.error || errorMessage;
        } catch (e) {
          // Se não conseguir parsear o erro, usar mensagem padrão
        }

        return NextResponse.json(
          {
            error: errorMessage,
            code: "TINY_API_ERROR",
            status: tinyResponse.status,
          },
          { status: 502 }
        );
      }

      const tinyResult: TinyApiResponse = await tinyResponse.json();

      // 6. Processar resposta da API do Tiny
      const retorno = tinyResult.retorno;

      if (!retorno) {
        return NextResponse.json(
          {
            error: "Resposta inválida da API do Tiny",
            code: "INVALID_TINY_RESPONSE",
          },
          { status: 502 }
        );
      }

      try {
        if (retorno?.status == "OK") {
          await saveProdutoPrecoLog(logPrecos);
        }
      } catch (error) {
        console.error("Erro ao salvar log de preços:", error);
      }

      // Verificar se houve erro geral no processamento
      if (retorno.status !== "OK") {
        const errosGerais = retorno.erros || [];
        const mensagemErro =
          errosGerais.length > 0
            ? errosGerais.map((e) => e.erro).join(", ")
            : "Erro no processamento da API do Tiny";

        return NextResponse.json(
          {
            error: mensagemErro,
            code: "TINY_PROCESSING_ERROR",
            status_processamento: retorno.status_processamento,
            detalhes: {
              status: retorno.status,
              erros: errosGerais,
            },
          },
          { status: 400 }
        );
      }

      // Processar registros individuais
      const registros: RegistroProcessado[] = [];
      const sucessos: RegistroProcessado[] = [];
      const erros: RegistroProcessado[] = [];

      if (retorno.registros && Array.isArray(retorno.registros)) {
        for (const item of retorno.registros) {
          const registro = item.registro;
          registros.push(registro);

          if (registro.status === "OK") {
            sucessos.push(registro);
          } else {
            erros.push(registro);
          }
        }
      }

      // 7. Preparar resposta detalhada
      const totalProcessados = registros.length;
      const totalSucessos = sucessos.length;
      const totalErros = erros.length;

      const responseData = {
        success: totalErros === 0,
        message:
          totalErros === 0
            ? `${totalSucessos} preços atualizados com sucesso`
            : `${totalSucessos} preços atualizados com sucesso, ${totalErros} falharam`,
        resumo: {
          total_enviados: precos.length,
          total_processados: totalProcessados,
          sucessos: totalSucessos,
          erros: totalErros,
          status_processamento: retorno.status_processamento,
          status_geral: retorno.status,
        },
        detalhes: {
          registros_processados: registros,
          sucessos: sucessos,
          erros_individuais: erros,
        },
        tiny_response: {
          status_processamento: retorno.status_processamento,
          status: retorno.status,
          total_registros: totalProcessados,
        },
      };

      // Retornar com status HTTP apropriado
      const httpStatus = totalErros > 0 ? 207 : 200; // 207 Multi-Status se houver erros parciais

      return NextResponse.json(responseData, { status: httpStatus });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json(
          {
            error: "Timeout na comunicação com o Tiny ERP",
            code: "TIMEOUT",
          },
          { status: 408 }
        );
      }

      throw fetchError; // Re-throw para ser capturado pelo catch externo
    }
  } catch (error) {
    console.error("Erro interno na atualização de preços:", error);

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        code: "INTERNAL_ERROR",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
