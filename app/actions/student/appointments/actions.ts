"use server";

import { prisma } from "@/lib/prisma";
import { createAppointmentSchema } from "./schemas";
import type { CreateAppointmentInput } from "./schemas";
import { getStudentInfoAction } from "../info";

// Obtener los psicólogos disponibles
export async function getAvailableStaffAction() {
  try {
    const staff = await prisma.staff.findMany({
      where: {
        active: true,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        consultation_room_id: true,
        consultation_rooms: {
          select: {
            name: true,
            location: true,
          },
        },
      },
      orderBy: {
        first_name: "asc",
      },
    });

    return {
      success: true,
      data: staff,
    };
  } catch (error) {
    console.error("Error fetching staff:", error);
    return {
      success: false,
      error: "Error al obtener los psicólogos disponibles",
    };
  }
}

// Obtener los horarios disponibles de un psicólogo para un día específico
export async function getStaffScheduleAction(
  staffId: number,
  dayOfWeek: number
) {
  try {
    const schedules = await prisma.schedules.findMany({
      where: {
        staff_id: staffId,
        day_of_week: dayOfWeek,
        available: true,
      },
      orderBy: {
        start_time: "asc",
      },
    });

    return {
      success: true,
      data: schedules,
    };
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return {
      success: false,
      error: "Error al obtener los horarios disponibles",
    };
  }
}

// Obtener las citas existentes de un psicólogo para una fecha específica
export async function getStaffAppointmentsAction(
  staffId: number,
  date: string
) {
  try {
    const appointments = await prisma.appointments.findMany({
      where: {
        staff_id: staffId,
        appointment_date: new Date(date),
        status: {
          in: ["pending", "confirmed"],
        },
      },
      select: {
        start_time: true,
        end_time: true,
      },
    });

    return {
      success: true,
      data: appointments,
    };
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return {
      success: false,
      error: "Error al obtener las citas existentes",
    };
  }
}

// Crear una nueva cita usando los datos del estudiante autenticado
export async function createAppointmentAction(input: CreateAppointmentInput) {
  try {
    // Obtener la información del estudiante autenticado del SII
    const studentResult = await getStudentInfoAction();

    if (!studentResult.success || !studentResult.data) {
      return {
        success: false,
        error: "No se pudo obtener la información del estudiante",
      };
    }

    const studentData = studentResult.data;

    // Extraer nombre y apellido del campo "persona"
    const [firstName, ...lastNameParts] = studentData.persona.split(" ");
    const lastName = lastNameParts.join(" ");

    // Validar los datos de entrada
    const validatedData = createAppointmentSchema.parse(input);

    // Verificar si el paciente ya existe en la BD de psicología
    let patient = await prisma.patients.findUnique({
      where: {
        nu_control: studentData.numero_control,
      },
    });

    // Si no existe, crear el paciente con los datos del SII
    if (!patient) {
      patient = await prisma.patients.create({
        data: {
          first_name: firstName,
          last_name: lastName || firstName,
          email: studentData.email,
          nu_control: studentData.numero_control,
          assigned_psychologist: validatedData.staff_id,
        },
      });
    } else {
      // Si existe, actualizar los datos por si cambiaron en el SII
      patient = await prisma.patients.update({
        where: {
          id: patient.id,
        },
        data: {
          first_name: firstName,
          last_name: lastName || firstName,
          email: studentData.email,
        },
      });
    }

    // Calcular la hora de fin (1 hora después de la hora de inicio)
    const appointmentDate = new Date(validatedData.appointment_date);
    const [hours, minutes] = validatedData.start_time.split(":");
    const startTime = new Date(appointmentDate);
    startTime.setHours(parseInt(hours), parseInt(minutes), 0);

    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);

    // Crear la cita
    const appointment = await prisma.appointments.create({
      data: {
        patient_id: patient.id,
        staff_id: validatedData.staff_id,
        appointment_date: appointmentDate,
        start_time: startTime,
        end_time: endTime,
        status: "pending",
        consultation_type:
          validatedData.consultation_type || "Consulta general",
        notes: validatedData.notes,
      },
      include: {
        staff: {
          select: {
            first_name: true,
            last_name: true,
            consultation_rooms: {
              select: {
                name: true,
                location: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: appointment,
      message: "Cita agendada exitosamente",
    };
  } catch (error) {
    console.error("Error creating appointment:", error);

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return {
        success: false,
        error: "Ya existe una cita en este horario",
      };
    }

    return {
      success: false,
      error: "Error al crear la cita. Por favor, intente nuevamente.",
    };
  }
}

// Obtener las citas del estudiante autenticado
export async function getMyAppointmentsAction() {
  try {
    // Obtener la información del estudiante autenticado
    const studentResult = await getStudentInfoAction();

    if (!studentResult.success || !studentResult.data) {
      return {
        success: false,
        error: "No se pudo obtener la información del estudiante",
      };
    }

    const patient = await prisma.patients.findUnique({
      where: {
        nu_control: studentResult.data.numero_control,
      },
      include: {
        appointments: {
          include: {
            staff: {
              select: {
                first_name: true,
                last_name: true,
                consultation_rooms: {
                  select: {
                    name: true,
                    location: true,
                  },
                },
              },
            },
          },
          orderBy: {
            appointment_date: "desc",
          },
        },
      },
    });

    if (!patient) {
      return {
        success: true,
        data: [],
      };
    }

    return {
      success: true,
      data: patient.appointments,
    };
  } catch (error) {
    console.error("Error fetching student appointments:", error);
    return {
      success: false,
      error: "Error al obtener las citas del estudiante",
    };
  }
}

// Cancelar una cita
export async function cancelAppointmentAction(appointmentId: number) {
  try {
    const appointment = await prisma.appointments.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: "cancelled",
      },
    });

    return {
      success: true,
      data: appointment,
      message: "Cita cancelada exitosamente",
    };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return {
      success: false,
      error: "Error al cancelar la cita",
    };
  }
}
