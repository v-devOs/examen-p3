import { z } from "zod";

/**
 * Schema para validar las credenciales de login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email("El email debe ser válido")
    .min(1, "El email es requerido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(3, "La contraseña debe tener al menos 3 caracteres"),
});

/**
 * Schema para la respuesta exitosa del login
 */
export const loginResponseSchema = z.object({
  token: z.string(),
  user: z
    .object({
      id: z.number(),
      email: z.string().email(),
      name: z.string().optional(),
      // Agrega más campos según la respuesta de la API
    })
    .optional(),
});

/**
 * Schema para la respuesta de error del login
 */
export const loginErrorSchema = z.object({
  message: z.string(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
});

/**
 * Tipos TypeScript inferidos de los schemas
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type LoginError = z.infer<typeof loginErrorSchema>;

/**
 * Tipo para el resultado de la acción de login
 */
export type LoginActionResult =
  | { success: true; data: LoginResponse }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
