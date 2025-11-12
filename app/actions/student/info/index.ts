/**
 * @fileoverview
 * Módulo de acciones para obtener información del estudiante
 *
 * Incluye:
 * - actions.ts: Server Actions para obtener y refrescar información del estudiante
 * - schemas.ts: Validaciones con Zod para los datos del estudiante
 */

export { getStudentInfoAction, refreshStudentInfoAction } from "./actions";

export { studentInfoSchema, studentResponseSchema } from "./schemas";

export type {
  StudentInfo,
  StudentResponse,
  StudentInfoActionResult,
} from "./schemas";
