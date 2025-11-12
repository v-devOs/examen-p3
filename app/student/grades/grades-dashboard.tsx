"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { refreshGradesAction } from "@/app/actions/student/grades";
import type { ProcessedGrade } from "@/app/actions/student/grades";

interface GradesDashboardProps {
  gradesData: ProcessedGrade[];
}

type ViewMode = "cards" | "table";

export default function GradesDashboard({
  gradesData: initialData,
}: GradesDashboardProps) {
  const router = useRouter();
  const [gradesData, setGradesData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  // Obtener periodos únicos para el filtro
  const periods = useMemo(() => {
    const uniquePeriods = [
      ...new Set(gradesData.map((grade) => grade.periodo).filter(Boolean)),
    ].sort();
    return uniquePeriods as string[];
  }, [gradesData]);

  // Filtrar calificaciones según búsqueda y periodo
  const filteredGrades = useMemo(() => {
    return gradesData.filter((grade) => {
      const matchesSearch = grade.nombre_materia
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesPeriod =
        selectedPeriod === "all" || grade.periodo === selectedPeriod;
      return matchesSearch && matchesPeriod;
    });
  }, [gradesData, searchTerm, selectedPeriod]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (filteredGrades.length === 0) {
      return {
        promedio: "0.00",
        aprobadas: 0,
        reprobadas: 0,
        total: 0,
      };
    }

    // Usar solo los promedios que no son null
    const promedios = filteredGrades
      .map((grade) => grade.promedio)
      .filter((prom): prom is string => prom !== null)
      .map((prom) => parseFloat(prom))
      .filter((cal) => !isNaN(cal));

    const promedio =
      promedios.length > 0
        ? promedios.reduce((sum, cal) => sum + cal, 0) / promedios.length
        : 0;
    const aprobadas = promedios.filter((cal) => cal >= 70).length;
    const reprobadas = promedios.filter((cal) => cal < 70).length;

    return {
      promedio: promedio.toFixed(2),
      aprobadas,
      reprobadas,
      total: filteredGrades.length,
    };
  }, [filteredGrades]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const result = await refreshGradesAction();

    if (result.success) {
      setGradesData(result.data);
    }

    setIsRefreshing(false);
  };

  const handleBack = () => {
    router.push("/student");
  };

  // Función para obtener el color según la calificación
  const getGradeColor = (calificacion: string | null) => {
    if (!calificacion) return "text-gray-600 dark:text-gray-400";
    const cal = parseFloat(calificacion);
    if (isNaN(cal)) return "text-gray-600 dark:text-gray-400";
    if (cal >= 90) return "text-green-600 dark:text-green-400";
    if (cal >= 80) return "text-blue-600 dark:text-blue-400";
    if (cal >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getGradeBgColor = (calificacion: string | null) => {
    if (!calificacion) return "bg-gray-50 dark:bg-gray-900/20";
    const cal = parseFloat(calificacion);
    if (isNaN(cal)) return "bg-gray-50 dark:bg-gray-900/20";
    if (cal >= 90) return "bg-green-50 dark:bg-green-900/20";
    if (cal >= 80) return "bg-blue-50 dark:bg-blue-900/20";
    if (cal >= 70) return "bg-yellow-50 dark:bg-yellow-900/20";
    return "bg-red-50 dark:bg-red-900/20";
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
            <button
              onClick={handleBack}
              className="w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all flex items-center justify-center"
            >
              <svg
                className="w-6 h-6 text-gray-700 dark:text-gray-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                📊 Mis Calificaciones
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Consulta tu historial académico
              </p>
            </div>
          </div>

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
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Promedio General
                </p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {stats.promedio}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Materias
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Aprobadas
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.aprobadas}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Reprobadas
                </p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {stats.reprobadas}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                🔍 Buscar Materia
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Escribe el nombre de la materia..."
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            {/* Filtro por periodo */}
            <div className="md:w-64">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                📅 Periodo
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
              >
                <option value="all">Todos los periodos</option>
                {periods.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle de vista */}
            <div className="md:w-auto">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                👁️ Vista
              </label>
              <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-4 py-2 rounded-lg transition-all ${viewMode === "cards"
                    ? "bg-white dark:bg-gray-700 shadow-md"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                >
                  <svg
                    className="w-5 h-5 text-gray-700 dark:text-gray-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 rounded-lg transition-all ${viewMode === "table"
                    ? "bg-white dark:bg-gray-700 shadow-md"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                >
                  <svg
                    className="w-5 h-5 text-gray-700 dark:text-gray-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {filteredGrades.length === 0 ? (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg p-12 border border-gray-200/50 dark:border-gray-700/50 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No se encontraron calificaciones
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Intenta con otros filtros de búsqueda
            </p>
          </div>
        ) : viewMode === "cards" ? (
          // Vista de Tarjetas
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGrades.map((grade, index) => (
              <div
                key={index}
                className={`${getGradeBgColor(
                  grade.promedio
                )} backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {grade.nombre_materia}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {grade.clave_materia} - Grupo {grade.grupo}
                    </p>
                  </div>
                  <span
                    className={`text-3xl font-bold ${getGradeColor(
                      grade.promedio
                    )}`}
                  >
                    {grade.promedio || "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>
                    {grade.periodo_descripcion} - {grade.anio}
                  </span>
                </div>

                {/* Parciales */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                    Calificaciones Parciales
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "P1", value: grade.parcial1 },
                      { label: "P2", value: grade.parcial2 },
                      { label: "P3", value: grade.parcial3 },
                      { label: "P4", value: grade.parcial4 },
                    ].map((parcial) => (
                      <div
                        key={parcial.label}
                        className="text-center bg-white/50 dark:bg-gray-800/50 rounded-lg p-2"
                      >
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {parcial.label}
                        </p>
                        <p
                          className={`text-lg font-bold ${getGradeColor(
                            parcial.value
                          )}`}
                        >
                          {parcial.value || "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Vista de Tabla
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Materia
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Periodo
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      P1
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      P2
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      P3
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      P4
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Promedio
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredGrades.map((grade, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {grade.nombre_materia}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {grade.clave_materia} - Grupo {grade.grupo}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <p>{grade.periodo}</p>
                          <p className="text-xs">{grade.periodo_descripcion}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`text-lg font-bold ${getGradeColor(
                            grade.parcial1
                          )}`}
                        >
                          {grade.parcial1 || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`text-lg font-bold ${getGradeColor(
                            grade.parcial2
                          )}`}
                        >
                          {grade.parcial2 || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`text-lg font-bold ${getGradeColor(
                            grade.parcial3
                          )}`}
                        >
                          {grade.parcial3 || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`text-lg font-bold ${getGradeColor(
                            grade.parcial4
                          )}`}
                        >
                          {grade.parcial4 || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`text-2xl font-bold ${getGradeColor(
                            grade.promedio
                          )}`}
                        >
                          {grade.promedio || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
