import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { categoriesTable, type Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import type { CreateCategoryInput, UpdateCategoryInput } from "../validations/category.validation.js";

function serialize(row: Category) {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listCategories() {
  const rows = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  return rows.map(serialize);
}

export async function createCategory(input: CreateCategoryInput) {
  try {
    const [row] = await db
      .insert(categoriesTable)
      .values({ name: input.name, color: input.color })
      .returning();
    return serialize(row);
  } catch (err) {
    const e = err as { code?: string };
    if (e.code === "23505") throw ApiError.conflict("A category with that name already exists");
    throw err;
  }
}

export async function updateCategory(id: number, input: UpdateCategoryInput) {
  if (Object.keys(input).length === 0) throw ApiError.badRequest("No fields to update");
  const [row] = await db.update(categoriesTable).set(input).where(eq(categoriesTable.id, id)).returning();
  if (!row) throw ApiError.notFound("Category not found");
  return serialize(row);
}

export async function deleteCategory(id: number) {
  try {
    const [row] = await db.delete(categoriesTable).where(eq(categoriesTable.id, id)).returning();
    if (!row) throw ApiError.notFound("Category not found");
  } catch (err) {
    const e = err as { code?: string };
    if (e.code === "23503") {
      throw ApiError.conflict("This category has expenses attached. Reassign or delete them first.");
    }
    throw err;
  }
}
