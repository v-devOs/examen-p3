"use server";

import { getAuthToken } from "../../login/jwt-utils";
import {
  apiScheduleResponseSchema,
  type ScheduleActionResult,
  type ScheduleList,
  type ScheduleClass,
  type RawScheduleItem,
} from "./schemas";

const API_BASE_URL = "https://cetech.roque.tecnm.mx/api";

/**
 * Mapeo de días en español a formato consistente
 */
const DIAS_MAP: Record<string, string> = {
  lunes: "LUNES",
  martes: "MARTES",
  miercoles: "MIÉRCOLES",
  jueves: "JUEVES",
  viernes: "VIERNES",
  sabado: "SÁBADO",
};

/**
 * Transforma una materia RAW del API a múltiples clases (una por cada día que tenga horario)
 */
function transformRawScheduleItem(item: RawScheduleItem): ScheduleClass[] {
  const classes: ScheduleClass[] = [];

  // Iterar sobre cada día de la semana
  Object.keys(DIAS_MAP).forEach((diaKey) => {
    const horario = item[diaKey as keyof RawScheduleItem] as string | null;
    const aula = item[`${diaKey}_clave_salon` as keyof RawScheduleItem] as
      | string
      | null;

    // Si hay horario para este día, crear una clase
    if (horario && horario.trim() !== "") {
      // Parsear horario "07:00-09:00"
      const [hora_inicio, hora_fin] = horario.split("-").map((h) => h.trim());

      classes.push({
        id_grupo: item.id_grupo,
        clave_materia: item.clave_materia,
        nombre_materia: item.nombre_materia,
        letra_grupo: item.letra_grupo,
        dia: DIAS_MAP[diaKey],
        hora_inicio,
        hora_fin,
        aula: aula || undefined,
        nombre_plan: item.nombre_plan,
        clave_turno: item.clave_turno,
        letra_nivel: item.letra_nivel,
      });
    }
  });

  return classes;
}

/**
 * Obtiene el horario del estudiante autenticado
 */
export async function getScheduleAction(): Promise<ScheduleActionResult> {
  try {
    console.log("📅 [HORARIO] Iniciando obtención de horario...");

    // 1. Obtener token de autenticación
    const token = await getAuthToken();
    if (!token) {
      console.error("❌ [HORARIO] No se encontró token de autenticación");
      return {
        success: false,
        error: "No se encontró token de autenticación",
      };
    }

    console.log("🔑 [HORARIO] Token obtenido correctamente");

    // 2. Hacer petición al endpoint de horario
    console.log(
      `📡 [HORARIO] Haciendo petición GET a: ${API_BASE_URL}/movil/estudiante/horarios`
    );

    const response = await fetch(`${API_BASE_URL}/movil/estudiante/horarios`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log("📡 [HORARIO] Status de respuesta:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [HORARIO] Error en respuesta:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return {
        success: false,
        error: `Error al obtener horario: ${response.status} ${response.statusText}`,
      };
    }

    // 3. Parsear respuesta
    const apiResponse = await response.json();
    console.log("📋 [HORARIO] Respuesta completa de la API:");
    console.log(JSON.stringify(apiResponse, null, 2));

    // 4. Validar estructura de la API
    let validatedApiResponse;
    try {
      validatedApiResponse = apiScheduleResponseSchema.parse(apiResponse);
      console.log("✅ [HORARIO] Respuesta del API validada correctamente");
    } catch (zodError) {
      console.error("❌ [HORARIO] Error de validación Zod:", zodError);
      console.error(
        "📋 [HORARIO] Datos que causaron el error:",
        JSON.stringify(apiResponse, null, 2)
      );
      return {
        success: false,
        error: "Error al validar estructura del horario del API",
      };
    }

    // 5. Extraer el horario del primer elemento del array data
    if (validatedApiResponse.data.length === 0) {
      console.log("⚠️ [HORARIO] No hay datos de horario en la respuesta");
      return {
        success: true,
        data: [],
        metadata: {
          totalMaterias: 0,
        },
      };
    }

    const { periodo, horario: rawHorario } = validatedApiResponse.data[0];
    console.log("📅 [HORARIO] Periodo:", periodo.descripcion_periodo);
    console.log("� [HORARIO] Materias RAW encontradas:", rawHorario.length);

    // 6. Transformar horarios RAW a formato normalizado
    const allClasses: ScheduleClass[] = [];
    rawHorario.forEach((item) => {
      const transformedClasses = transformRawScheduleItem(item);
      allClasses.push(...transformedClasses);
    });

    console.log("� [HORARIO] Clases transformadas:", allClasses.length);

    // 7. Análisis de días y horarios
    const diasUnicos = [
      ...new Set(allClasses.map((clase) => clase.dia)),
    ].sort();
    const materiasUnicas = [
      ...new Set(allClasses.map((clase) => clase.clave_materia)),
    ];

    console.log("📊 [HORARIO] Análisis de datos:");
    console.log("  - Total de clases (sesiones):", allClasses.length);
    console.log("  - Materias únicas:", materiasUnicas.length);
    console.log("  - Días de clase:", diasUnicos);

    // Mostrar resumen por día
    diasUnicos.forEach((dia) => {
      const clasesPorDia = allClasses.filter((clase) => clase.dia === dia);
      console.log(`  - ${dia}: ${clasesPorDia.length} sesiones`);
    });

    console.log("✅ [HORARIO] Horario obtenido y transformado exitosamente");

    return {
      success: true,
      data: allClasses,
      metadata: {
        periodo,
        totalMaterias: materiasUnicas.length,
      },
    };
  } catch (error) {
    console.error("❌ [HORARIO] Error inesperado:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error desconocido al obtener horario",
    };
  }
}

/**
 * Refresca el horario del estudiante (para uso en Client Components)
 */
export async function refreshScheduleAction(): Promise<ScheduleActionResult> {
  console.log("🔄 [HORARIO] Refrescando horario...");
  return getScheduleAction();
}
