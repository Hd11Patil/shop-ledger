import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { usersTable, type User } from "../models/user.model.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken } from "../utils/generateToken.js";
import type { LoginInput, RegisterInput } from "../validations/auth.validation.js";

function publicUser(u: User) {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    createdAt: u.createdAt.toISOString(),
  };
}

export async function register(input: RegisterInput) {
  const email = input.email.toLowerCase();
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) throw ApiError.conflict("An account with that email already exists");

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);
  const [user] = await db
    .insert(usersTable)
    .values({
      email,
      passwordHash,
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
    })
    .returning();

  const token = signToken({ sub: user.id, email: user.email });
  return { token, user: publicUser(user) };
}

export async function login(input: LoginInput) {
  const email = input.email.toLowerCase();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw ApiError.unauthorized("Invalid email or password");

  const token = signToken({ sub: user.id, email: user.email });
  return { token, user: publicUser(user) };
}

export async function getCurrentUser(userId: string) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) throw ApiError.unauthorized("User not found");
  return publicUser(user);
}
