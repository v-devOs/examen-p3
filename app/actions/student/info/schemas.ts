import { z } from "zod";

/**
 * Schema para la información del estudiante
 */
export const studentInfoSchema = z.object({
  id: z.number(),
  matricula: z.string(),
  nombre: z.string(),
  apellidoPaterno: z.string().optional(),
  apellidoMaterno: z.string().optional(),
  carrera: z.string().optional(),
  semestre: z.number().optional(),
  email: z.string().email().optional(),
  telefono: z.string().optional(),
  // Agrega más campos según la respuesta real de la API
});

/**
 * Schema para la respuesta exitosa del endpoint de estudiante
 */
export const studentResponseSchema = z.object({
  responseCodeTxt: z.string(),
  message: z.any().optional(), // Puede variar según la API
  status: z.number(),
  flag: z.string().optional(),
  data: z.union([
    studentInfoSchema,
    z.record(z.string(), z.unknown()),
    z.number(),
  ]),
  type: z.string().optional(),
});

/**
 * Tipos TypeScript inferidos de los schemas
 */
export type StudentInfo = z.infer<typeof studentInfoSchema>;
export type StudentResponse = z.infer<typeof studentResponseSchema>;

/**
 * Tipo para el resultado de la acción de obtener información del estudiante
 */
export type StudentInfoActionResult =
  | { success: true; data: StudentInfo }
  | { success: false; error: string };
