"use server";

import { getAuthToken } from "../../login/jwt-utils";
import { kardexResponseSchema, type KardexActionResult } from "./schemas";

const API_BASE_URL = "https://cetech.roque.tecnm.mx/api";

/**
 * Obtiene el kardex completo del estudiante
 * Endpoint: /movil/estudiante/kardex
 * @returns Promise con el resultado que contiene la lista de materias del kardex
 */
export async function getKardexAction(): Promise<KardexActionResult> {
  console.log("📚 [KARDEX] Iniciando solicitud de kardex...");

  try {
    // Obtener el token JWT
    const token = await getAuthToken();

    if (!token) {
      console.error("❌ [KARDEX] No se encontró token de autenticación");
      return {
        success: false,
        error: "No autenticado. Por favor, inicia sesión nuevamente.",
      };
    }

    console.log("✅ [KARDEX] Token obtenido, realizando petición...");

    // Realizar la petición al endpoint de kardex
    const response = await fetch(`${API_BASE_URL}/movil/estudiante/kardex`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log(`📡 [KARDEX] Status de respuesta: ${response.status}`);

    if (!response.ok) {
      console.error(
        `❌ [KARDEX] Error en la petición: ${response.status} ${response.statusText}`
      );
      return {
        success: false,
        error: `Error al obtener el kardex: ${response.statusText}`,
      };
    }

    const result = await response.json();

    console.log("📦 [KARDEX] Respuesta completa recibida:");
    console.log(JSON.stringify(result, null, 2));

    // Verificar la estructura de la respuesta
    if (!result.data) {
      console.error("❌ [KARDEX] Respuesta sin campo 'data'");
      console.log("Estructura recibida:", Object.keys(result));
      return {
        success: false,
        error: "Formato de respuesta inválido",
      };
    }

    const kardexData = result.data;

    console.log("📋 [KARDEX] Datos de kardex extraídos:");
    console.log(JSON.stringify(kardexData, null, 2));

    // Log del tipo de dato recibido
    console.log(
      `🔍 [KARDEX] Tipo de kardexData: ${typeof kardexData}, Es array: ${Array.isArray(
        kardexData
      )}`
    );

    // Verificar si es un objeto con la estructura esperada
    if (
      typeof kardexData === "object" &&
      kardexData !== null &&
      "kardex" in kardexData
    ) {
      console.log("📦 [KARDEX] Estructura detectada: objeto con kardex array");
      console.log(
        `📊 [KARDEX] Total de materias: ${kardexData.kardex?.length || 0}`
      );
      console.log(
        `📈 [KARDEX] Porcentaje de avance: ${
          kardexData.porcentaje_avance || "N/A"
        }%`
      );

      // Log de la primera materia para análisis
      if (Array.isArray(kardexData.kardex) && kardexData.kardex.length > 0) {
        console.log("🔎 [KARDEX] Estructura de la primera materia:");
        console.log(JSON.stringify(kardexData.kardex[0], null, 2));
        console.log(
          "🔑 [KARDEX] Campos disponibles:",
          Object.keys(kardexData.kardex[0])
        );
      }
    }

    try {
      // Intentar validar con Zod
      console.log("🔄 [KARDEX] Validando datos con Zod...");
      const validatedData = kardexResponseSchema.parse(kardexData);

      console.log(
        `✅ [KARDEX] Validación exitosa! ${validatedData.kardex.length} materias procesadas`
      );
      console.log(
        `📈 [KARDEX] Porcentaje de avance validado: ${validatedData.porcentaje_avance}%`
      );

      // Log de muestra de datos validados
      if (validatedData.kardex.length > 0) {
        console.log("✨ [KARDEX] Ejemplo de materia validada:");
        console.log(JSON.stringify(validatedData.kardex[0], null, 2));
      }

      return {
        success: true,
        data: validatedData.kardex,
        porcentajeAvance: validatedData.porcentaje_avance,
      };
    } catch (zodError) {
      console.error("❌ [KARDEX] Error de validación Zod:", zodError);

      // Intentar procesar sin validación para devolver los datos
      console.log("⚠️ [KARDEX] Intentando procesar sin validación Zod...");

      try {
        // Si tiene la estructura esperada con kardex array
        if (
          typeof kardexData === "object" &&
          kardexData !== null &&
          "kardex" in kardexData &&
          Array.isArray(kardexData.kardex)
        ) {
          console.log("⚠️ [KARDEX] Devolviendo datos sin validación completa");
          return {
            success: true,
            data: kardexData.kardex,
            porcentajeAvance: kardexData.porcentaje_avance,
          };
        }

        throw new Error("Los datos no tienen la estructura esperada");
      } catch (processingError) {
        console.error(
          "❌ [KARDEX] Error al procesar sin validación:",
          processingError
        );
        return {
          success: false,
          error: "Error al procesar el kardex",
        };
      }
    }
  } catch (error) {
    console.error("❌ [KARDEX] Error general:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error desconocido al obtener el kardex",
    };
  }
}

/**
 * Refresca los datos del kardex del estudiante
 * Útil para actualizar la información después de cambios
 * @returns Promise con el resultado actualizado
 */
export async function refreshKardexAction(): Promise<KardexActionResult> {
  console.log("🔄 [KARDEX] Refrescando datos del kardex...");
  return getKardexAction();
}
