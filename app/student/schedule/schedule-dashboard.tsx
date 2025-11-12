"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { refreshScheduleAction } from "@/app/actions/student/schedule";
import type { ScheduleList, ScheduleActionResult } from "@/app/actions/student/schedule";

interface ScheduleDashboardProps {
  scheduleData: ScheduleList;
  metadata?: ScheduleActionResult["metadata"];
}

type ViewMode = "weekly" | "daily" | "list";

const DIAS_SEMANA = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];

export default function ScheduleDashboard({
  scheduleData: initialData,
  metadata,
}: ScheduleDashboardProps) {
  const router = useRouter();
  const [scheduleData, setScheduleData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");

  // Obtener días únicos
  const availableDays = useMemo(() => {
    const uniqueDays = [...new Set(scheduleData.map((clase) => clase.dia))];
    return DIAS_SEMANA.filter((dia) => uniqueDays.includes(dia));
  }, [scheduleData]);

  // Filtrar clases según búsqueda y día
  const filteredClasses = useMemo(() => {
    return scheduleData.filter((clase) => {
      const matchesSearch =
        clase.nombre_materia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clase.clave_materia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clase.nombre_profesor?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDay = selectedDay === "all" || clase.dia === selectedDay;

      return matchesSearch && matchesDay;
    });
  }, [scheduleData, searchTerm, selectedDay]);

  // Agrupar clases por día
  const classesByDay = useMemo(() => {
    const grouped: Record<string, typeof scheduleData> = {};
    DIAS_SEMANA.forEach((dia) => {
      grouped[dia] = filteredClasses
        .filter((clase) => clase.dia === dia)
        .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
    });
    return grouped;
  }, [filteredClasses]);

  // Estadísticas
  const totalMaterias = useMemo(() => {
    const uniqueMaterias = new Set(scheduleData.map((c) => c.clave_materia));
    return uniqueMaterias.size;
  }, [scheduleData]);

  const totalHoras = useMemo(() => {
    return scheduleData.reduce((total, clase) => {
      const inicio = clase.hora_inicio.split(":");
      const fin = clase.hora_fin.split(":");
      const horasInicio = parseInt(inicio[0]) + parseInt(inicio[1]) / 60;
      const horasFin = parseInt(fin[0]) + parseInt(fin[1]) / 60;
      return total + (horasFin - horasInicio);
    }, 0);
  }, [scheduleData]);

  const totalCreditos = useMemo(() => {
    const uniqueMaterias = new Map<string, number>();
    scheduleData.forEach((clase) => {
      if (clase.creditos && !uniqueMaterias.has(clase.clave_materia)) {
        uniqueMaterias.set(clase.clave_materia, parseInt(clase.creditos) || 0);
      }
    });
    return Array.from(uniqueMaterias.values()).reduce((sum, val) => sum + val, 0);
  }, [scheduleData]);

  // Refrescar horario
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await refreshScheduleAction();
      if (result.success && result.data) {
        setScheduleData(result.data);
      }
    } catch (error) {
      console.error("Error al refrescar horario:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Formatear hora
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}`;
  };

  // Color según tipo de clase
  const getClassTypeColor = (tipo?: string) => {
    if (!tipo) return "bg-blue-100 text-blue-800 border-blue-200";
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes("laboratorio")) return "bg-purple-100 text-purple-800 border-purple-200";
    if (tipoLower.includes("taller")) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/student")}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
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
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Mi Horario
                </h1>
                {metadata?.periodo && (
                  <p className="text-gray-600 mt-1">Periodo: {metadata.periodo}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className={`w-5 h-5 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Materias</p>
                  <p className="text-3xl font-bold mt-1">{totalMaterias}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <svg
                    className="w-8 h-8"
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
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Horas Semanales</p>
                  <p className="text-3xl font-bold mt-1">{totalHoras.toFixed(0)}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <svg
                    className="w-8 h-8"
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
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Total Créditos</p>
                  <p className="text-3xl font-bold mt-1">{totalCreditos}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar materia, profesor o clave..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
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

            {/* Filtro por día */}
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
            >
              <option value="all">Todos los días</option>
              {availableDays.map((dia) => (
                <option key={dia} value={dia}>
                  {dia}
                </option>
              ))}
            </select>

            {/* Selector de vista */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("weekly")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === "weekly"
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Semanal
              </button>
              <button
                onClick={() => setViewMode("daily")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === "daily"
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Diario
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Lista
              </button>
            </div>
          </div>

          {/* Contador */}
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredClasses.length} de {scheduleData.length} clases
          </div>
        </div>

        {/* Vista Semanal */}
        {viewMode === "weekly" && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableDays.map((dia) => {
                const clasesDelDia = classesByDay[dia];
                if (clasesDelDia.length === 0) return null;

                return (
                  <div key={dia} className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 sticky top-0 bg-white/90 backdrop-blur-sm py-2 rounded-xl px-4">
                      {dia}
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({clasesDelDia.length} {clasesDelDia.length === 1 ? "clase" : "clases"})
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {clasesDelDia.map((clase, idx) => (
                        <div
                          key={`${clase.clave_materia}-${idx}`}
                          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                {clase.nombre_materia}
                              </h4>
                              <p className="text-xs text-gray-500">{clase.clave_materia}</p>
                            </div>
                            {clase.tipo_clase && (
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-lg border ${getClassTypeColor(
                                  clase.tipo_clase
                                )}`}
                              >
                                {clase.tipo_clase}
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center text-blue-600">
                              <svg
                                className="w-4 h-4 mr-2"
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
                              <span className="font-medium">
                                {formatTime(clase.hora_inicio)} - {formatTime(clase.hora_fin)}
                              </span>
                            </div>

                            {clase.nombre_profesor && (
                              <div className="flex items-center text-gray-600">
                                <svg
                                  className="w-4 h-4 mr-2"
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
                                <span className="truncate">{clase.nombre_profesor}</span>
                              </div>
                            )}

                            {(clase.aula || clase.edificio) && (
                              <div className="flex items-center text-gray-600">
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                  />
                                </svg>
                                <span>
                                  {clase.edificio && `${clase.edificio} - `}
                                  {clase.aula}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Vista Diaria (seleccionando un día específico) */}
        {viewMode === "daily" && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {availableDays.map((dia) => (
                <button
                  key={dia}
                  onClick={() => setSelectedDay(dia)}
                  className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                    selectedDay === dia
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {dia}
                  <span className="ml-2 text-sm">
                    ({classesByDay[dia].length})
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {(selectedDay === "all" ? filteredClasses : classesByDay[selectedDay] || [])
                .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
                .map((clase, idx) => (
                  <div
                    key={`${clase.clave_materia}-${idx}`}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Horario destacado */}
                      <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-4 text-center min-w-[120px]">
                        <div className="text-2xl font-bold">
                          {formatTime(clase.hora_inicio)}
                        </div>
                        <div className="text-sm opacity-90">a</div>
                        <div className="text-xl font-bold">
                          {formatTime(clase.hora_fin)}
                        </div>
                      </div>

                      {/* Información de la clase */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {clase.nombre_materia}
                          </h3>
                          <p className="text-gray-600">{clase.clave_materia}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          {clase.nombre_profesor && (
                            <div className="flex items-center text-gray-700">
                              <svg
                                className="w-5 h-5 mr-2 text-blue-500"
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
                              <span>{clase.nombre_profesor}</span>
                            </div>
                          )}

                          {(clase.aula || clase.edificio) && (
                            <div className="flex items-center text-gray-700">
                              <svg
                                className="w-5 h-5 mr-2 text-purple-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                              <span>
                                {clase.edificio && `${clase.edificio} - `}
                                {clase.aula}
                              </span>
                            </div>
                          )}

                          {clase.grupo && (
                            <div className="flex items-center text-gray-700">
                              <svg
                                className="w-5 h-5 mr-2 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              <span>Grupo {clase.grupo}</span>
                            </div>
                          )}

                          {clase.creditos && (
                            <div className="flex items-center text-gray-700">
                              <svg
                                className="w-5 h-5 mr-2 text-orange-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                                />
                              </svg>
                              <span>{clase.creditos} créditos</span>
                            </div>
                          )}
                        </div>

                        {clase.tipo_clase && (
                          <span
                            className={`inline-block px-3 py-1 text-sm font-medium rounded-lg border ${getClassTypeColor(
                              clase.tipo_clase
                            )}`}
                          >
                            {clase.tipo_clase}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {(selectedDay === "all" ? filteredClasses : classesByDay[selectedDay] || [])
                .length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
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
                  </div>
                  <p className="text-gray-500">No hay clases para este día</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vista Lista */}
        {viewMode === "list" && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Día</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Horario</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Materia</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Clave</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Profesor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Ubicación</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Tipo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredClasses
                    .sort((a, b) => {
                      const diaCompare = DIAS_SEMANA.indexOf(a.dia) - DIAS_SEMANA.indexOf(b.dia);
                      if (diaCompare !== 0) return diaCompare;
                      return a.hora_inicio.localeCompare(b.hora_inicio);
                    })
                    .map((clase, idx) => (
                      <tr
                        key={`${clase.clave_materia}-${idx}`}
                        className="hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{clase.dia}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-blue-600 font-medium">
                            {formatTime(clase.hora_inicio)} - {formatTime(clase.hora_fin)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{clase.nombre_materia}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600">{clase.clave_materia}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-700">{clase.nombre_profesor || "-"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-700">
                            {clase.edificio && `${clase.edificio} - `}
                            {clase.aula || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {clase.tipo_clase ? (
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-lg border ${getClassTypeColor(
                                clase.tipo_clase
                              )}`}
                            >
                              {clase.tipo_clase}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {filteredClasses.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">No se encontraron clases</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
