"use server";

import AuthService from "@/auth/util";
import { z } from "zod";

/**
 * User schema for validation and type safety
 * nao pode exportar nada que nao seja async function quando uso use server
 */
const UserSchema = z.object({
  id: z.string().optional(),
  sub: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  active: z.number().optional(),
  isAdmin: z.number().optional(),
  codigo: z.string().optional(),
  emp_acesso: z.array(z.number()).optional(), // Added optional() to emp_acesso
  id_empresa: z.number().optional(),
  id_tenant: z.number().optional(),
});

type User = z.infer<typeof UserSchema>;

export async function getUser(): Promise<User | null> {
  const user = await AuthService.getSessionUser();
  if (!user) {
    return null;
  }

  return UserSchema.parse(user);
}
