"use server";

import { loginSchema, type LoginActionResult } from "./schemas";
import { setAuthToken, removeAuthToken } from "./jwt-utils";

const API_BASE_URL = "https://cetech.roque.tecnm.mx/api";

/**
 * Server Action para realizar el login del usuario
 * @param formData - FormData con email y password
 * @returns Resultado de la operación de login
 */
export async function loginAction(
  formData: FormData
): Promise<LoginActionResult> {
  try {
    // Extraer datos del FormData
    const email = formData.get("email");
    const password = formData.get("password");

    // Validar los datos con Zod
    const validationResult = loginSchema.safeParse({ email, password });

    if (!validationResult.success) {
      // Convertir los errores de Zod a un formato más amigable
      const fieldErrors: Record<string, string[]> = {};
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      });

      return {
        success: false,
        error: "Datos de entrada inválidos",
        fieldErrors,
      };
    }

    // Realizar la petición a la API
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validationResult.data),
    });

    const data = await response.json();

    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Error al iniciar sesión",
        fieldErrors: data.errors,
      };
    }

    // Verificar que se recibió un token
    if (!data.token) {
      return {
        success: false,
        error: "No se recibió un token de autenticación",
      };
    }

    // Guardar el token en una cookie segura
    await setAuthToken(data.token);

    return {
      success: true,
      data: {
        token: data.token,
        user: data.user,
      },
    };
  } catch (error) {
    console.error("Error en loginAction:", error);
    return {
      success: false,
      error: "Error al conectar con el servidor. Por favor, intenta de nuevo.",
    };
  }
}

/**
 * Server Action para cerrar sesión del usuario
 * @returns Resultado de la operación de logout
 */
export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    await removeAuthToken();
    return { success: true };
  } catch (error) {
    console.error("Error en logoutAction:", error);
    return { success: false };
  }
}
