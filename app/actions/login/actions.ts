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

    // Log para debugging - ver la estructura de la respuesta
    console.log("Respuesta de la API:", data);
    console.log("Status HTTP:", response.status);

    // La API devuelve status 200 pero indica el error en data.status
    // Verificar si hay un error en el body de la respuesta
    if (data.status && data.status !== 200) {
      // Mensaje personalizado según el código de error
      let errorMessage = "";

      if (data.status === 401) {
        errorMessage =
          "Las credenciales ingresadas son incorrectas. Por favor, verifica que tu correo electrónico institucional (@celaya.tecnm.mx) y contraseña sean correctos.";
      } else if (data.status === 403) {
        errorMessage =
          "No tienes permiso para acceder al sistema. Contacta al administrador.";
      } else if (data.status === 404) {
        errorMessage = "Usuario no encontrado en el sistema.";
      } else if (data.status >= 500) {
        errorMessage =
          "El servidor está experimentando problemas. Por favor, intenta más tarde.";
      } else {
        errorMessage =
          data.message ||
          data.responseCodeTxt ||
          `Error ${data.status}: No se pudo completar el inicio de sesión.`;
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
        error: data.message || "Error al iniciar sesión",
        fieldErrors: data.errors,
      };
    }

    // Verificar que se recibió un token
    // La API devuelve el token en data.message.login.token
    const token =
      data.message?.login?.token ||
      data.token ||
      data.access_token ||
      data.data?.token;

    if (!token || typeof token !== "string") {
      console.error(
        "Estructura de respuesta completa:",
        JSON.stringify(data, null, 2)
      );
      return {
        success: false,
        error: "No se recibió un token de autenticación válido",
      };
    }

    // Guardar el token en una cookie segura
    await setAuthToken(token);

    console.log("✅ Login exitoso, token guardado");

    return {
      success: true,
      data: {
        token: token,
        user: data.user || data.message?.user || data.data?.user,
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
