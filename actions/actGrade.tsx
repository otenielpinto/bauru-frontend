"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";

/**
 * Grade search response interface
 */
interface GradeSearchResponse {
  success: boolean;
  message: string;
  data?: any[] | null;
  error?: string;
}

/**
 * Get all grades from tmp_grade collection filtered by user's tenant
 * @returns Response with grades array
 */
export async function getAllGrades(): Promise<GradeSearchResponse> {
  try {
    const user = await getUser();
    if (!user?.id_tenant) {
      return {
        success: false,
        message: "Usuário não autenticado ou sem tenant associado",
        error: "UNAUTHORIZED",
      };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Build query with tenant filter
    const query = {
      id_tenant: Number(user.id_tenant),
    };

    const grades = await clientdb
      .collection("tmp_grade")
      .find(query)
      .sort({ nome: 1 })
      .toArray();

    await TMongo.mongoDisconnect(client);

    // Serialize MongoDB documents for Client Components
    const serializedGrades = grades.map((grade) => ({
      ...grade,
      _id: grade._id.toString(),
    }));

    return {
      success: true,
      message: `${grades.length} grade(s) encontrada(s)`,
      data: serializedGrades,
    };
  } catch (error) {
    console.error("Error getting grades:", error);
    return {
      success: false,
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
