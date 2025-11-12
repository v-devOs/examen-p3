"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { refreshKardexAction } from "@/app/actions/student/kardex";
import type { KardexList } from "@/app/actions/student/kardex";

interface KardexDashboardProps {
  kardexData: KardexList;
}

type ViewMode = "cards" | "table";

export default function KardexDashboard({
  kardexData: initialData,
}: KardexDashboardProps) {
  const router = useRouter();
  const [kardexData, setKardexData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  // Obtener semestres únicos para el filtro
  const semesters = useMemo(() => {
    const uniqueSemesters = [
      ...new Set(
        kardexData
          .map((subject) => subject.semestre?.toString())
          .filter(Boolean)
      ),
    ].sort();
    return uniqueSemesters as string[];
  }, [kardexData]);

  // Obtener estatus únicos para el filtro
  const statuses = useMemo(() => {
    const uniqueStatuses = [
      ...new Set(kardexData.map((subject) => subject.estatus).filter(Boolean)),
    ].sort();
    return uniqueStatuses as string[];
  }, [kardexData]);

  // Filtrar materias según búsqueda, semestre y estatus
  const filteredSubjects = useMemo(() => {
    return kardexData.filter((subject) => {
      const matchesSearch = subject.nombre_materia
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesSemester =
        selectedSemester === "all" ||
        subject.semestre?.toString() === selectedSemester;
      const matchesStatus =
        selectedStatus === "all" || subject.estatus === selectedStatus;
      return matchesSearch && matchesSemester && matchesStatus;
    });
  }, [kardexData, searchTerm, selectedSemester, selectedStatus]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (filteredSubjects.length === 0) {
      return {
        promedio: "0.00",
        creditosAcumulados: 0,
        materiasAprobadas: 0,
        materiasReprobadas: 0,
        total: 0,
      };
    }

    const calificaciones = filteredSubjects
      .map((subject) => subject.calificacion)
      .filter((cal): cal is string => cal !== null)
      .map((cal) => parseFloat(cal))
      .filter((cal) => !isNaN(cal));

    const promedio =
      calificaciones.length > 0
        ? calificaciones.reduce((sum, cal) => sum + cal, 0) /
          calificaciones.length
        : 0;

    const creditosAcumulados = filteredSubjects
      .filter(
        (subject) =>
          subject.calificacion &&
          parseFloat(subject.calificacion) >= 70 &&
          subject.estatus?.toLowerCase() !== "reprobada"
      )
      .reduce((sum, subject) => sum + subject.creditos, 0);

    const aprobadas = calificaciones.filter((cal) => cal >= 70).length;
    const reprobadas = calificaciones.filter((cal) => cal < 70).length;

    return {
      promedio: promedio.toFixed(2),
      creditosAcumulados,
      materiasAprobadas: aprobadas,
      materiasReprobadas: reprobadas,
      total: filteredSubjects.length,
    };
  }, [filteredSubjects]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const result = await refreshKardexAction();

    if (result.success && result.data) {
      setKardexData(result.data);
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

  const getStatusColor = (estatus: string | undefined) => {
    if (!estatus) return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    const status = estatus.toLowerCase();
    if (status.includes("aprobad")) return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
    if (status.includes("reprobad")) return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
    if (status.includes("curso") || status.includes("cursand")) return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
    return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
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
                📋 Mi Kardex
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Historial académico completo
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Promedio
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.promedio}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Créditos
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.creditosAcumulados}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Aprobadas
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.materiasAprobadas}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Reprobadas
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.materiasReprobadas}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </p>
          </div>
        </div>

        {/* Controles de búsqueda y filtros */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 mb-6 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar materia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Filtro por semestre */}
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
            >
              <option value="all">Todos los semestres</option>
              {semesters.map((semester) => (
                <option key={semester} value={semester}>
                  Semestre {semester}
                </option>
              ))}
            </select>

            {/* Filtro por estatus */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
            >
              <option value="all">Todos los estatus</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            {/* Toggle de vista */}
            <div className="flex gap-2 bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === "cards"
                    ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
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
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === "table"
                    ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
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
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Contenido: Tarjetas o Tabla */}
        {filteredSubjects.length === 0 ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
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
              No se encontraron materias
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Intenta con otros filtros de búsqueda
            </p>
          </div>
        ) : viewMode === "cards" ? (
          // Vista de Tarjetas
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map((subject, index) => (
              <div
                key={index}
                className={`${getGradeBgColor(
                  subject.calificacion
                )} backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {subject.nombre_materia}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {subject.clave_materia}
                    </p>
                  </div>
                  <span
                    className={`text-3xl font-bold ${getGradeColor(
                      subject.calificacion
                    )}`}
                  >
                    {subject.calificacion || "N/A"}
                  </span>
                </div>

                {/* Información adicional */}
                <div className="space-y-2">
                  {subject.semestre && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
                      <span>Semestre {subject.semestre}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{subject.creditos} créditos</span>
                  </div>

                  {subject.periodo && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{subject.periodo}</span>
                    </div>
                  )}

                  {subject.estatus && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          subject.estatus
                        )}`}
                      >
                        {subject.estatus}
                      </span>
                    </div>
                  )}

                  {subject.observaciones && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        {subject.observaciones}
                      </p>
                    </div>
                  )}
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
                      Semestre
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Créditos
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Calificación
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Estatus
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Periodo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSubjects.map((subject, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {subject.nombre_materia}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {subject.clave_materia}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        {subject.semestre || "-"}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        {subject.creditos}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`text-2xl font-bold ${getGradeColor(
                            subject.calificacion
                          )}`}
                        >
                          {subject.calificacion || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {subject.estatus && (
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              subject.estatus
                            )}`}
                          >
                            {subject.estatus}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        {subject.periodo || "-"}
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
