// Shared API contract types used by both client and server.
// Keep these in sync with server zod validators and client types.

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface ActivityEntry {
  id: number;
  kind: "sale" | "expense" | "investment";
  amount: number;
  label: string;
  date: string;
  createdAt: string;
}
