import { z } from "zod";

/**
 * Schema para el periodo del horario
 */
export const periodSchema = z.object({
  clave_periodo: z.string(),
  anio: z.number(),
  descripcion_periodo: z.string(),
});

export type Period = z.infer<typeof periodSchema>;

/**
 * Schema para una materia RAW del API (con columnas por día)
 */
export const rawScheduleItemSchema = z.object({
  id_grupo: z.number(),
  letra_grupo: z.string(),
  nombre_materia: z.string(),
  clave_materia: z.string(),
  clave_turno: z.string(),
  nombre_plan: z.string(),
  letra_nivel: z.string(),

  // Días de la semana con horarios
  lunes: z.string().nullable(),
  lunes_clave_salon: z.string().nullable(),
  martes: z.string().nullable(),
  martes_clave_salon: z.string().nullable(),
  miercoles: z.string().nullable(),
  miercoles_clave_salon: z.string().nullable(),
  jueves: z.string().nullable(),
  jueves_clave_salon: z.string().nullable(),
  viernes: z.string().nullable(),
  viernes_clave_salon: z.string().nullable(),
  sabado: z.string().nullable(),
  sabado_clave_salon: z.string().nullable(),
});

export type RawScheduleItem = z.infer<typeof rawScheduleItemSchema>;

/**
 * Schema para la respuesta del API (estructura real)
 */
export const apiScheduleResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  flag: z.boolean(),
  data: z.array(
    z.object({
      periodo: periodSchema,
      horario: z.array(rawScheduleItemSchema),
    })
  ),
});

export type ApiScheduleResponse = z.infer<typeof apiScheduleResponseSchema>;

/**
 * Schema para una clase procesada (formato normalizado para el UI)
 */
export const scheduleClassSchema = z.object({
  // Identificadores de la clase/materia
  id_grupo: z.number(),
  clave_materia: z.string(),
  nombre_materia: z.string(),
  letra_grupo: z.string(),

  // Horario específico
  dia: z.string(), // "LUNES", "MARTES", etc.
  hora_inicio: z.string(), // "07:00"
  hora_fin: z.string(), // "09:00"

  // Ubicación
  aula: z.string().optional(),

  // Información adicional
  nombre_plan: z.string().optional(),
  clave_turno: z.string().optional(),
  letra_nivel: z.string().optional(),
});

export type ScheduleClass = z.infer<typeof scheduleClassSchema>;

/**
 * Schema para la lista de clases procesadas
 */
export const scheduleListSchema = z.array(scheduleClassSchema);

export type ScheduleList = z.infer<typeof scheduleListSchema>;

/**
 * Tipo para el resultado de las actions de horario
 */
export interface ScheduleActionResult {
  success: boolean;
  data?: ScheduleList;
  error?: string;
  metadata?: {
    periodo?: Period;
    totalMaterias?: number;
  };
}
