import { z } from "zod";

/**
 * Schema para validar una materia individual en el kardex
 * Estructura inicial basada en patrones comunes de kardex académico
 */
export const kardexSubjectSchema = z.object({
  // Información básica de la materia
  clave_materia: z.string(),
  nombre_materia: z.string(),
  creditos: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val)),

  // Calificación y estatus
  calificacion: z
    .union([z.string(), z.number(), z.null()])
    .transform((val) => {
      if (val === null || val === undefined) return null;
      const num = typeof val === "string" ? parseFloat(val) : val;
      return isNaN(num) ? null : num.toFixed(2);
    })
    .nullable(),

  // Información del periodo
  periodo: z.string().optional(),
  semestre: z.union([z.string(), z.number()]).optional(),

  // Estatus académico
  estatus: z.string().optional(),
  tipo_materia: z.string().optional(),

  // Campos adicionales que podrían venir en la respuesta
  observaciones: z.string().optional(),
  fecha: z.string().optional(),
  grupo: z.string().optional(),
});

export type KardexSubject = z.infer<typeof kardexSubjectSchema>;

/**
 * Schema para la lista completa de materias del kardex
 */
export const kardexListSchema = z.array(kardexSubjectSchema);

export type KardexList = z.infer<typeof kardexListSchema>;

/**
 * Tipo de retorno para las acciones de kardex
 */
export interface KardexActionResult {
  success: boolean;
  data?: KardexList;
  error?: string;
}
