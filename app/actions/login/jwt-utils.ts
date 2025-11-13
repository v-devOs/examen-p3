"use server";
import { cookies } from "next/headers";

const TOKEN_NAME = "auth_token";
const TOKEN_MAX_AGE = 60 * 60; // 1 hora en segundos (ajusta según tu API)

/**
 * Guarda el token JWT en una cookie httpOnly
 */
export async function setAuthToken(token: string): Promise<void> {
  const cookieStore = await cookies();

  // Detectar si estamos en HTTPS o HTTP
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: false, // <-- fuerza a permitir HTTP
    sameSite: "lax",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
}

/**
 * Obtiene el token JWT de las cookies
 */
export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME);
  return token?.value;
}

/**
 * Elimina el token JWT de las cookies
 */
export async function removeAuthToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

/**
 * Verifica si el usuario está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}

/**
 * Decodifica el payload del JWT sin verificar la firma
 * Útil para extraer información básica del token
 */
export async function decodeJWT(
  token: string
): Promise<Record<string, unknown> | null> {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

/**
 * Verifica si el token JWT ha expirado
 */
export async function isTokenExpired(token: string): Promise<boolean> {
  const decoded = await decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  const expirationTime = (decoded.exp as number) * 1000; // Convertir a milisegundos
  return Date.now() >= expirationTime;
}
