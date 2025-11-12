import { z } from "zod";

/**
 * Schema para validar una materia individual en el kardex
 * Basado en la estructura real del API
 */
export const kardexSubjectSchema = z.object({
  // Información básica de la materia
  clave_materia: z.string(),
  nombre_materia: z.string(),
  creditos: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val)),

  // Calificación - puede ser número, string o "AC" (acreditada)
  calificacion: z
    .union([z.string(), z.number(), z.null()])
    .transform((val) => {
      if (val === null || val === undefined) return null;
      // Si es "AC" (acreditada) o texto no numérico, devolverlo como string
      if (typeof val === "string" && isNaN(parseFloat(val))) return val;
      const num = typeof val === "string" ? parseFloat(val) : val;
      return isNaN(num) ? null : num.toFixed(2);
    })
    .nullable(),

  // Información del periodo
  periodo: z.string(),
  semestre: z.union([z.string(), z.number()]),

  // Descripción (NORMAL / ORDINARIO, REPETICIÓN, etc.)
  descripcion: z.string(),
});

export type KardexSubject = z.infer<typeof kardexSubjectSchema>;

/**
 * Schema para la respuesta completa del kardex que incluye porcentaje de avance
 */
export const kardexResponseSchema = z.object({
  porcentaje_avance: z.number(),
  kardex: z.array(kardexSubjectSchema),
});

export type KardexResponse = z.infer<typeof kardexResponseSchema>;

/**
 * Solo el array de materias (para compatibilidad)
 */
export const kardexListSchema = z.array(kardexSubjectSchema);

export type KardexList = z.infer<typeof kardexListSchema>;

/**
 * Tipo de retorno para las acciones de kardex
 */
export interface KardexActionResult {
  success: boolean;
  data?: KardexList;
  porcentajeAvance?: number;
  error?: string;
}
