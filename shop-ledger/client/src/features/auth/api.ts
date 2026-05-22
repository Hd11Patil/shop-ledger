import { api } from "@/services/api";
import type { AuthResponse, AuthUser, LoginInput, RegisterInput } from "./types";

export async function loginRequest(input: LoginInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", input);
  return data;
}

export async function registerRequest(input: RegisterInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", input);
  return data;
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>("/auth/me");
  return data;
}

export async function logoutRequest(): Promise<void> {
  await api.post("/auth/logout").catch(() => {
    // Logout is fire-and-forget on the server; clients drop the token regardless.
  });
}
