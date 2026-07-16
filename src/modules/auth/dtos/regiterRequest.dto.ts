import { z } from "zod";

// Zod runtime validation definition
export const RegisterRequestSchema = z.object({
  fullName: z.string().min(2, "Name is too short").trim(),
  email: z.email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

// Compile-time TypeScript definition inferred directly from the schema
export type RegisterRequestDto = z.infer<typeof RegisterRequestSchema>;