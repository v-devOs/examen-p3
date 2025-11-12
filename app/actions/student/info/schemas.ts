import { z } from "zod";

/**
 * Schema para la información del estudiante
 * Basado en la respuesta real de la API
 */
export const studentInfoSchema = z.object({
  numero_control: z.string(),
  persona: z.string(),
  email: z.string().email(),
  semestre: z.number(),
  num_mat_rep_no_acreditadas: z.string().optional(),
  creditos_acumulados: z.string().optional(),
  promedio_ponderado: z
    .union([z.string(), z.number()])
    .transform((val) => {
      // Convertir a número y redondear a 2 decimales
      const num = typeof val === "string" ? parseFloat(val) : val;
      return isNaN(num) ? "0.00" : num.toFixed(2);
    })
    .optional(),
  promedio_aritmetico: z
    .union([z.string(), z.number()])
    .transform((val) => {
      // Convertir a número y redondear a 2 decimales
      const num = typeof val === "string" ? parseFloat(val) : val;
      return isNaN(num) ? "0.00" : num.toFixed(2);
    })
    .optional(),
  materias_cursadas: z.string().optional(),
  materias_reprobadas: z.string().optional(),
  materias_aprobadas: z.string().optional(),
  creditos_complementarios: z.number().optional(),
  porcentaje_avance: z.number().optional(),
  num_materias_rep_primera: z.number().optional(),
  num_materias_rep_segunda: z.number().nullable().optional(),
  percentaje_avance_cursando: z.number().optional(),
  foto: z.string().optional(), // Base64 string de la foto
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
