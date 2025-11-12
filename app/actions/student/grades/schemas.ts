import { z } from "zod";

/**
 * Schema para una calificación parcial individual
 */
export const partialGradeSchema = z.object({
  id_calificacion: z.number(),
  numero_calificacion: z.number(),
  calificacion: z
    .union([z.string(), z.number(), z.null()])
    .transform((val) => {
      if (val === null || val === undefined) return null;
      const num = typeof val === "string" ? parseFloat(val) : val;
      return isNaN(num) ? null : num.toFixed(2);
    })
    .nullable(),
});

/**
 * Schema para información de la materia
 */
export const subjectInfoSchema = z.object({
  id_grupo: z.number(),
  nombre_materia: z.string(),
  clave_materia: z.string(),
  letra_grupo: z.string(),
});

/**
 * Schema para una materia con sus calificaciones
 */
export const subjectWithGradesSchema = z.object({
  materia: subjectInfoSchema,
  calificaiones: z.array(partialGradeSchema), // Nota: la API tiene typo "calificaiones"
});

/**
 * Schema para información del periodo
 */
export const periodInfoSchema = z.object({
  clave_periodo: z.string(),
  anio: z.number(),
  descripcion_periodo: z.string(),
});

/**
 * Schema para un periodo con sus materias
 */
export const periodWithSubjectsSchema = z.object({
  periodo: periodInfoSchema,
  materias: z.array(subjectWithGradesSchema),
});

/**
 * Schema para la lista completa de periodos con calificaciones
 */
export const gradesDataSchema = z.array(periodWithSubjectsSchema);

/**
 * Tipo para una materia procesada (aplanada para la UI)
 */
export interface ProcessedGrade {
  // Información de la materia
  nombre_materia: string;
  clave_materia: string;
  grupo: string;
  id_grupo: number;
  // Información del periodo
  periodo: string;
  periodo_descripcion: string;
  anio: number;
  // Calificaciones parciales
  parcial1: string | null;
  parcial2: string | null;
  parcial3: string | null;
  parcial4: string | null;
  // Promedio calculado
  promedio: string | null;
}

/**
 * Tipos TypeScript inferidos de los schemas
 */
export type PartialGrade = z.infer<typeof partialGradeSchema>;
export type SubjectInfo = z.infer<typeof subjectInfoSchema>;
export type SubjectWithGrades = z.infer<typeof subjectWithGradesSchema>;
export type PeriodInfo = z.infer<typeof periodInfoSchema>;
export type PeriodWithSubjects = z.infer<typeof periodWithSubjectsSchema>;
export type GradesData = z.infer<typeof gradesDataSchema>;

/**
 * Tipo para el resultado de la acción de obtener calificaciones
 */
export type GradesActionResult =
  | { success: true; data: ProcessedGrade[] }
  | { success: false; error: string };
