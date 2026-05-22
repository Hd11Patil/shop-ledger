import { z } from "zod";

const colorRegex = /^#[0-9A-Fa-f]{6}$/;

export const createCategorySchema = z.object({
  name: z.string().min(1).max(80),
  color: z.string().regex(colorRegex, "Color must be a hex string like #E07A5F"),
});

export const updateCategorySchema = createCategorySchema.partial();

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
