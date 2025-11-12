"use server";

import { getAuthToken } from "../../login/jwt-utils";
import type { StudentInfoActionResult } from "./schemas";

const API_BASE_URL = "https://cetech.roque.tecnm.mx/api";

/**
 * Server Action para obtener la información del estudiante
 * @returns Resultado con la información del estudiante o error
 */
export async function getStudentInfoAction(): Promise<StudentInfoActionResult> {
  try {
    // Obtener el token de autenticación de las cookies
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        error: "No hay sesión activa. Por favor, inicia sesión nuevamente.",
      };
    }

    // Realizar la petición a la API
    const response = await fetch(`${API_BASE_URL}/movil/estudiante`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // Evitar cache para obtener datos actualizados
    });

    const data = await response.json();

    // Log para debugging
    console.log("Respuesta del endpoint estudiante:", data);
    console.log("Status HTTP:", response.status);

    // Verificar si hay un error en el body de la respuesta
    if (data.status && data.status !== 200) {
      let errorMessage = "";

      if (data.status === 401) {
        errorMessage =
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
      } else if (data.status === 403) {
        errorMessage = "No tienes permiso para acceder a esta información.";
      } else if (data.status === 404) {
        errorMessage = "No se encontró información del estudiante.";
      } else if (data.status >= 500) {
        errorMessage =
          "El servidor está experimentando problemas. Por favor, intenta más tarde.";
      } else {
        errorMessage =
          data.message ||
          data.responseCodeTxt ||
          `Error ${data.status}: No se pudo obtener la información.`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Verificar si la respuesta HTTP fue exitosa
    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Error al obtener la información del estudiante",
      };
    }

    // Extraer los datos del estudiante
    // La estructura puede variar, ajusta según la respuesta real
    const studentData =
      data.data || data.message?.student || data.message?.estudiante || data;

    if (!studentData || typeof studentData !== "object") {
      console.error(
        "Estructura de respuesta completa:",
        JSON.stringify(data, null, 2)
      );
      return {
        success: false,
        error: "No se recibió información válida del estudiante",
      };
    }

    console.log("✅ Información del estudiante obtenida exitosamente");

    return {
      success: true,
      data: studentData,
    };
  } catch (error) {
    console.error("Error en getStudentInfoAction:", error);
    return {
      success: false,
      error:
        "Error al conectar con el servidor. Por favor, verifica tu conexión.",
    };
  }
}

/**
 * Server Action para refrescar la información del estudiante
 * Útil cuando se necesita forzar la actualización de datos
 * @returns Resultado con la información actualizada del estudiante
 */
export async function refreshStudentInfoAction(): Promise<StudentInfoActionResult> {
  // Reutiliza la misma lógica pero sin caché
  return getStudentInfoAction();
}
