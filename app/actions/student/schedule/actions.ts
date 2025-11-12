"use server";

import { getAuthToken } from "../../login/jwt-utils";
import {
  scheduleResponseSchema,
  type ScheduleActionResult,
  type ScheduleList,
} from "./schemas";

const API_BASE_URL = "https://cetech.roque.tecnm.mx/api/movil/estudiante";

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
    const response = await fetch(`${API_BASE_URL}/horario`, {
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
    const scheduleData = await response.json();
    console.log("📋 [HORARIO] Respuesta completa de la API:");
    console.log(JSON.stringify(scheduleData, null, 2));

    // 4. Detectar estructura de la respuesta
    const isArray = Array.isArray(scheduleData);
    const isObjectWithHorario =
      typeof scheduleData === "object" &&
      scheduleData !== null &&
      "horario" in scheduleData;

    console.log("🔍 [HORARIO] Análisis de estructura:");
    console.log("  - ¿Es array directo?:", isArray);
    console.log("  - ¿Es objeto con 'horario'?:", isObjectWithHorario);

    if (isArray) {
      console.log("  - Número de clases:", scheduleData.length);
      if (scheduleData.length > 0) {
        console.log(
          "  - Primera clase:",
          JSON.stringify(scheduleData[0], null, 2)
        );
      }
    } else if (isObjectWithHorario) {
      console.log("  - Número de clases:", scheduleData.horario?.length || 0);
      console.log("  - Periodo:", scheduleData.periodo);
      console.log("  - Semestre actual:", scheduleData.semestre_actual);
      console.log("  - Total materias:", scheduleData.total_materias);
      console.log("  - Total créditos:", scheduleData.total_creditos);
      if (scheduleData.horario?.length > 0) {
        console.log(
          "  - Primera clase:",
          JSON.stringify(scheduleData.horario[0], null, 2)
        );
      }
    } else {
      console.log("  - Tipo de dato:", typeof scheduleData);
      console.log("  - Propiedades:", Object.keys(scheduleData || {}));
    }

    // 5. Validar con Zod
    let validatedData;
    try {
      validatedData = scheduleResponseSchema.parse(scheduleData);
      console.log("✅ [HORARIO] Datos validados correctamente con Zod");
    } catch (zodError) {
      console.error("❌ [HORARIO] Error de validación Zod:", zodError);
      console.error(
        "📋 [HORARIO] Datos que causaron el error:",
        JSON.stringify(scheduleData, null, 2)
      );

      // Intentar procesar de todos modos si es un array
      if (isArray) {
        console.log(
          "⚠️ [HORARIO] Intentando procesar array sin validación estricta..."
        );
        return {
          success: true,
          data: scheduleData as ScheduleList,
        };
      }

      // Intentar extraer horario si es objeto
      if (isObjectWithHorario && Array.isArray(scheduleData.horario)) {
        console.log("⚠️ [HORARIO] Intentando extraer 'horario' del objeto...");
        return {
          success: true,
          data: scheduleData.horario as ScheduleList,
          metadata: {
            periodo: scheduleData.periodo,
            semestreActual: scheduleData.semestre_actual,
            totalMaterias: scheduleData.total_materias,
            totalCreditos: scheduleData.total_creditos,
          },
        };
      }

      return {
        success: false,
        error: "Error al validar estructura de horario",
      };
    }

    // 6. Extraer datos según estructura
    let scheduleList: ScheduleList;
    let metadata: ScheduleActionResult["metadata"];

    if (Array.isArray(validatedData)) {
      scheduleList = validatedData;
      console.log(
        "📦 [HORARIO] Datos extraídos (array directo):",
        scheduleList.length,
        "clases"
      );
    } else {
      scheduleList = validatedData.horario;
      metadata = {
        periodo: validatedData.periodo,
        semestreActual: validatedData.semestre_actual,
        totalMaterias: validatedData.total_materias,
        totalCreditos: validatedData.total_creditos,
      };
      console.log("📦 [HORARIO] Datos extraídos (objeto):");
      console.log("  - Clases:", scheduleList.length);
      console.log("  - Metadata:", metadata);
    }

    // 7. Análisis de días y horarios
    const diasUnicos = [
      ...new Set(scheduleList.map((clase) => clase.dia)),
    ].sort();
    const materiasUnicas = [
      ...new Set(scheduleList.map((clase) => clase.clave_materia)),
    ];

    console.log("📊 [HORARIO] Análisis de datos:");
    console.log("  - Total de clases:", scheduleList.length);
    console.log("  - Materias únicas:", materiasUnicas.length);
    console.log("  - Días de clase:", diasUnicos);
    console.log("  - Materias:", materiasUnicas);

    // Mostrar resumen por día
    diasUnicos.forEach((dia) => {
      const clasesPorDia = scheduleList.filter((clase) => clase.dia === dia);
      console.log(`  - ${dia}: ${clasesPorDia.length} clases`);
    });

    console.log("✅ [HORARIO] Horario obtenido exitosamente");

    return {
      success: true,
      data: scheduleList,
      metadata,
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
