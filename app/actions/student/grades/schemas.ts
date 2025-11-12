import { z } from "zod";

/**
 * Schema para una calificación individual de una materia
 */
export const gradeSchema = z.object({
  materia: z.string(),
  calificacion: z.union([z.string(), z.number()]).transform((val) => {
    // Convertir a número y redondear a 2 decimales
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? "0.00" : num.toFixed(2);
  }),
  creditos: z.union([z.string(), z.number()]).optional(),
  periodo: z.string().optional(),
  estatus: z.string().optional(),
  observaciones: z.string().optional(),
  // Agrega más campos según la respuesta real de la API
});

/**
 * Schema para la lista completa de calificaciones
 */
export const gradesListSchema = z.array(gradeSchema);

/**
 * Schema para la respuesta exitosa del endpoint de calificaciones
 */
export const gradesResponseSchema = z.object({
  responseCodeTxt: z.string().optional(),
  message: z.any().optional(),
  status: z.number().optional(),
  flag: z.union([z.string(), z.boolean()]).optional(),
  data: z.union([gradesListSchema, z.record(z.string(), z.unknown()), z.any()]),
  type: z.string().optional(),
});

/**
 * Tipos TypeScript inferidos de los schemas
 */
export type Grade = z.infer<typeof gradeSchema>;
export type GradesList = z.infer<typeof gradesListSchema>;
export type GradesResponse = z.infer<typeof gradesResponseSchema>;

/**
 * Tipo para el resultado de la acción de obtener calificaciones
 */
export type GradesActionResult =
  | { success: true; data: GradesList }
  | { success: false; error: string };
