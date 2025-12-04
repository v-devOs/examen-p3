import { z } from "zod";

// Schema para crear una cita - solo necesitamos los datos de la cita
export const createAppointmentSchema = z.object({
  staff_id: z.number().int().positive("Debe seleccionar un psicólogo"),
  appointment_date: z.string().min(1, "La fecha es requerida"),
  start_time: z.string().min(1, "La hora de inicio es requerida"),
  consultation_type: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
