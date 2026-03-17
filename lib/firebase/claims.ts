import type { User } from "firebase/auth";

export async function getIsAdmin(user: User) {
  const token = await user.getIdTokenResult(true);
  return token.claims.admin === true;
}

