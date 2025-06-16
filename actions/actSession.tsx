"use server";

import AuthService from "@/auth/util";

async function getUser() {
  const user = await AuthService.getSessionUser();
  return user;
}

export { getUser };
