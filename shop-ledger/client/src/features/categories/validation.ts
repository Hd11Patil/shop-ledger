import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex color like #E07A5F"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
