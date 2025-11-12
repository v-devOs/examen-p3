"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { logoutAction } from "../actions/login";
import { refreshStudentInfoAction } from "../actions/student/info";
import type { StudentInfo } from "../actions/student/info";

interface StudentDashboardProps {
  studentData: StudentInfo;
}

export default function StudentDashboard({
  studentData: initialData,
}: StudentDashboardProps) {
  const router = useRouter();
  const [studentData, setStudentData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const result = await refreshStudentInfoAction();

    if (result.success) {
      setStudentData(result.data);
    }

    setIsRefreshing(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAction();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Portal Estudiante
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                TecNM Celaya - Sistema de Información
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-200 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg
                className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {isRefreshing ? "Actualizando..." : "Actualizar"}
            </button>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {isLoggingOut ? "Saliendo..." : "Cerrar Sesión"}
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card de Información Personal */}
          <div className="lg:col-span-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Información Personal
              </h2>
            </div>

            {/* Sección de foto y datos principales */}
            <div className="flex flex-col md:flex-row gap-6 mb-8 p-6 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
              {/* Foto del estudiante */}
              {studentData.foto && (
                <div className="shrink-0">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white dark:ring-gray-700">
                    <Image
                      src={`data:image/jpeg;base64,${studentData.foto}`}
                      alt="Foto del estudiante"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              )}

              {/* Información principal */}
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nombre Completo
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {studentData.persona}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Número de Control
                    </p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {studentData.numero_control}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Correo Institucional
                    </p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white break-all">
                      {studentData.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información Académica */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Información Académica
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Semestre */}
                <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Semestre Actual
                  </label>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {studentData.semestre}°
                  </p>
                </div>

                {/* Porcentaje de Avance */}
                {studentData.porcentaje_avance !== undefined && (
                  <div className="space-y-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Avance de Carrera
                    </label>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {studentData.porcentaje_avance}%
                    </p>
                  </div>
                )}

                {/* Promedio Ponderado */}
                {studentData.promedio_ponderado && (
                  <div className="space-y-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Promedio Ponderado
                    </label>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {studentData.promedio_ponderado}
                    </p>
                  </div>
                )}

                {/* Promedio Aritmético */}
                {studentData.promedio_aritmetico && (
                  <div className="space-y-2 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Promedio Aritmético
                    </label>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {studentData.promedio_aritmetico}
                    </p>
                  </div>
                )}

                {/* Créditos Acumulados */}
                {studentData.creditos_acumulados && (
                  <div className="space-y-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Créditos Acumulados
                    </label>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {studentData.creditos_acumulados}
                    </p>
                  </div>
                )}

                {/* Materias Cursadas */}
                {studentData.materias_cursadas && (
                  <div className="space-y-2 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Materias Cursadas
                    </label>
                    <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                      {studentData.materias_cursadas}
                    </p>
                  </div>
                )}

                {/* Materias Aprobadas */}
                {studentData.materias_aprobadas && (
                  <div className="space-y-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Materias Aprobadas
                    </label>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {studentData.materias_aprobadas}
                    </p>
                  </div>
                )}

                {/* Materias Reprobadas */}
                {studentData.materias_reprobadas && (
                  <div className="space-y-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Materias Reprobadas
                    </label>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {studentData.materias_reprobadas}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card de Acciones Rápidas */}
          <div className="space-y-6">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Accesos Rápidos
                </h3>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push("/student/grades")}
                  className="w-full px-4 py-3 bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-xl shadow-lg transition-all flex items-center justify-between group"
                >
                  <span>📊 Calificaciones</span>
                  <svg
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                <button className="w-full px-4 py-3 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl shadow-lg transition-all flex items-center justify-between group">
                  <span>📚 Kardex</span>
                  <svg
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                <button className="w-full px-4 py-3 bg-linear-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium rounded-xl shadow-lg transition-all flex items-center justify-between group">
                  <span>🕒 Horarios</span>
                  <svg
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Card de Estadísticas */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                📈 Estado Académico
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Estado
                  </span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
                    Activo
                  </span>
                </div>
                {studentData.semestre && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Semestre Actual
                    </span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {studentData.semestre}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
