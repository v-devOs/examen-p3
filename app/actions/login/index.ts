/**
 * @fileoverview
 * Módulo de acciones de autenticación para el login del usuario
 *
 * Incluye:
 * - actions.ts: Server Actions para login y logout
 * - schemas.ts: Validaciones con Zod para los datos de entrada
 * - jwt-utils.ts: Utilidades para manejar JWT en cookies
 */

export { loginAction, logoutAction } from "./actions";
export { loginSchema, loginResponseSchema } from "./schemas";
export type { LoginInput, LoginResponse, LoginActionResult } from "./schemas";
export {
  getAuthToken,
  isAuthenticated,
  decodeJWT,
  isTokenExpired,
} from "./jwt-utils";
