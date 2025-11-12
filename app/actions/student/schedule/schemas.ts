import { z } from "zod";

/**
 * Schema para una clase individual del horario
 */
export const scheduleClassSchema = z.object({
  // Identificadores de la clase
  clave_materia: z.string(),
  nombre_materia: z.string(),

  // Información del profesor
  nombre_profesor: z.string().optional(),

  // Horario
  dia: z.string(), // Ejemplo: "LUNES", "MARTES", etc.
  hora_inicio: z.string(), // Formato: "07:00" o "07:00:00"
  hora_fin: z.string(), // Formato: "08:00" o "08:00:00"

  // Ubicación
  aula: z.string().optional(),
  edificio: z.string().optional(),

  // Información adicional
  grupo: z.string().optional(),
  creditos: z.string().optional(),
  semestre: z.union([z.number(), z.string()]).optional(),

  // Otros campos que puedan venir
  tipo_clase: z.string().optional(), // "TEORÍA", "LABORATORIO", etc.
  modalidad: z.string().optional(), // "PRESENCIAL", "VIRTUAL", etc.
});

export type ScheduleClass = z.infer<typeof scheduleClassSchema>;

/**
 * Schema para la lista de clases del horario
 */
export const scheduleListSchema = z.array(scheduleClassSchema);

export type ScheduleList = z.infer<typeof scheduleListSchema>;

/**
 * Schema para la respuesta completa del endpoint de horario
 * Puede ser un array directo o un objeto con propiedades adicionales
 */
export const scheduleResponseSchema = z.union([
  // Caso 1: Array directo de clases
  scheduleListSchema,
  // Caso 2: Objeto con horario y posibles metadatos
  z.object({
    horario: scheduleListSchema,
    periodo: z.string().optional(),
    semestre_actual: z.union([z.number(), z.string()]).optional(),
    total_materias: z.number().optional(),
    total_creditos: z.number().optional(),
  }),
]);

export type ScheduleResponse = z.infer<typeof scheduleResponseSchema>;

/**
 * Tipo para el resultado de las actions de horario
 */
export interface ScheduleActionResult {
  success: boolean;
  data?: ScheduleList;
  error?: string;
  metadata?: {
    periodo?: string;
    semestreActual?: number | string;
    totalMaterias?: number;
    totalCreditos?: number;
  };
}
