"use server";

import { getAuthToken } from "../../login/jwt-utils";
import { gradesListSchema } from "./schemas";
import type { GradesActionResult } from "./schemas";

const API_BASE_URL = "https://cetech.roque.tecnm.mx/api";

/**
 * Server Action para obtener las calificaciones del estudiante
 * @returns Resultado con las calificaciones o error
 */
export async function getGradesAction(): Promise<GradesActionResult> {
  try {
    console.log(
      "🔍 [GRADES] Iniciando obtención de calificaciones del estudiante..."
    );

    // Obtener el token de autenticación de las cookies
    const token = await getAuthToken();
    console.log(
      "🔑 [GRADES] Token obtenido:",
      token ? "✓ Token presente" : "✗ Sin token"
    );

    if (!token) {
      console.error("❌ [GRADES] No hay token de autenticación");
      return {
        success: false,
        error: "No hay sesión activa. Por favor, inicia sesión nuevamente.",
      };
    }

    console.log(
      `📡 [GRADES] Haciendo petición GET a: ${API_BASE_URL}/movil/estudiante/calificaciones`
    );
    console.log("📋 [GRADES] Headers:", {
      Authorization: `Bearer ${token.substring(0, 20)}...`,
      "Content-Type": "application/json",
    });

    // Realizar la petición a la API
    const response = await fetch(
      `${API_BASE_URL}/movil/estudiante/calificaciones`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store", // Evitar cache para obtener datos actualizados
      }
    );

    console.log(
      `📊 [GRADES] Status HTTP recibido: ${response.status} ${response.statusText}`
    );

    const data = await response.json();

    // Logs detallados para debugging
    console.log("📦 [GRADES] Respuesta completa del servidor:");
    console.log(JSON.stringify(data, null, 2));
    console.log("🔍 [GRADES] Estructura de la respuesta:", {
      responseCodeTxt: data.responseCodeTxt,
      status: data.status,
      flag: data.flag,
      type: data.type,
      hasMessage: !!data.message,
      hasData: !!data.data,
      dataType: typeof data.data,
      isArray: Array.isArray(data.data),
    });

    // Verificar si hay un error en el body de la respuesta
    if (data.status && data.status !== 200) {
      console.error(
        `❌ [GRADES] Error en la respuesta - Status: ${data.status}`
      );
      console.error("📄 [GRADES] Mensaje de error:", data.message);
      console.error("📄 [GRADES] Código de respuesta:", data.responseCodeTxt);

      let errorMessage = "";

      if (data.status === 401) {
        errorMessage =
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
      } else if (data.status === 403) {
        errorMessage = "No tienes permiso para acceder a esta información.";
      } else if (data.status === 404) {
        errorMessage = "No se encontraron calificaciones.";
      } else if (data.status >= 500) {
        errorMessage =
          "El servidor está experimentando problemas. Por favor, intenta más tarde.";
      } else {
        errorMessage =
          data.message ||
          data.responseCodeTxt ||
          `Error ${data.status}: No se pudieron obtener las calificaciones.`;
      }

      console.error(`💬 [GRADES] Mensaje de error final: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Verificar si la respuesta HTTP fue exitosa
    if (!response.ok) {
      console.error(
        `❌ [GRADES] Respuesta HTTP no exitosa: ${response.status}`
      );
      return {
        success: false,
        error: data.message || "Error al obtener las calificaciones",
      };
    }

    // Extraer los datos de calificaciones
    console.log("🔎 [GRADES] Intentando extraer datos de calificaciones...");
    console.log("📍 [GRADES] Buscando en data.data:", !!data.data);
    console.log(
      "📍 [GRADES] Buscando en data.message.calificaciones:",
      !!data.message?.calificaciones
    );
    console.log(
      "📍 [GRADES] Buscando en data.message.grades:",
      !!data.message?.grades
    );

    const gradesData =
      data.data ||
      data.message?.calificaciones ||
      data.message?.grades ||
      data.calificaciones ||
      data;

    console.log("📦 [GRADES] Datos extraídos de calificaciones:");
    console.log(JSON.stringify(gradesData, null, 2));

    // Validar que sea un array
    if (!Array.isArray(gradesData)) {
      console.error("❌ [GRADES] Los datos no son un array");
      console.error("📄 [GRADES] Tipo de datos recibido:", typeof gradesData);
      console.error("📄 [GRADES] Estructura de respuesta completa:");
      console.error(JSON.stringify(data, null, 2));
      return {
        success: false,
        error: "No se recibieron calificaciones válidas",
      };
    }

    console.log(
      `📊 [GRADES] Total de calificaciones encontradas: ${gradesData.length}`
    );

    // Validar y transformar los datos con el schema de Zod
    console.log("🔄 [GRADES] Validando y transformando datos con Zod...");
    try {
      const validatedData = gradesListSchema.parse(gradesData);
      console.log("✅ [GRADES] Datos validados y transformados:");
      console.log(
        `✓ ${validatedData.length} calificaciones procesadas exitosamente`
      );

      return {
        success: true,
        data: validatedData,
      };
    } catch (zodError) {
      console.error("❌ [GRADES] Error de validación Zod:", zodError);
      // Si falla la validación, retornar los datos sin transformar
      console.log(
        "⚠️ [GRADES] Retornando datos sin validar debido a error en schema"
      );
      return {
        success: true,
        data: gradesData,
      };
    }
  } catch (error) {
    console.error("💥 [GRADES] Excepción capturada:", error);
    console.error("📄 [GRADES] Detalles del error:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      success: false,
      error:
        "Error al conectar con el servidor. Por favor, verifica tu conexión.",
    };
  }
}

/**
 * Server Action para refrescar las calificaciones del estudiante
 * Útil cuando se necesita forzar la actualización de datos
 * @returns Resultado con las calificaciones actualizadas
 */
export async function refreshGradesAction(): Promise<GradesActionResult> {
  console.log("🔄 [GRADES] Refrescando calificaciones del estudiante...");
  // Reutiliza la misma lógica pero sin caché
  return getGradesAction();
}
