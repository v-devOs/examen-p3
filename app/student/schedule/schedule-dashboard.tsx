"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { refreshScheduleAction } from "@/app/actions/student/schedule";
import type { ScheduleList, ScheduleActionResult } from "@/app/actions/student/schedule";
import ScheduleHeader from "@/components/schedule-header";
import ScheduleStatsCard from "@/components/schedule-stats-card";
import ScheduleFilters from "@/components/schedule-filters";
import ScheduleCard from "@/components/schedule-card";
import ScheduleDetailedCard from "@/components/schedule-detailed-card";

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
        clase.aula?.toLowerCase().includes(searchTerm.toLowerCase());

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <ScheduleHeader
          title="Mi Horario"
          subtitle={metadata?.periodo ? `Periodo: ${metadata.periodo.descripcion_periodo}` : undefined}
          isRefreshing={isRefreshing}
          onBack={() => router.push("/student")}
          onRefresh={handleRefresh}
        />

        {/* Estadísticas */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ScheduleStatsCard
              title="Total Materias"
              value={totalMaterias}
              gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
              textColor="text-blue-100"
              icon={
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
              }
            />
            <ScheduleStatsCard
              title="Horas Semanales"
              value={Math.round(totalHoras)}
              gradient="bg-gradient-to-br from-purple-500 to-pink-600"
              textColor="text-purple-100"
              icon={
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
              }
            />
            <ScheduleStatsCard
              title="Sesiones"
              value={scheduleData.length}
              gradient="bg-gradient-to-br from-orange-500 to-red-600"
              textColor="text-orange-100"
              icon={
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
            />
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <ScheduleFilters
          searchTerm={searchTerm}
          selectedDay={selectedDay}
          viewMode={viewMode}
          availableDays={availableDays}
          filteredCount={filteredClasses.length}
          totalCount={scheduleData.length}
          onSearchChange={setSearchTerm}
          onDayChange={setSelectedDay}
          onViewModeChange={setViewMode}
        />

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
                      {clasesDelDia.map((clase) => (
                        <ScheduleCard key={`${clase.id_grupo}-${clase.dia}`} clase={clase} formatTime={formatTime} />
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
                  className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${selectedDay === dia
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
                .map((clase) => (
                  <ScheduleDetailedCard 
                    key={`${clase.id_grupo}-${clase.dia}`} 
                    clase={clase} 
                    formatTime={formatTime} 
                  />
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
                    <th className="px-6 py-4 text-left text-sm font-semibold">Grupo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Aula</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredClasses
                    .sort((a, b) => {
                      const diaCompare = DIAS_SEMANA.indexOf(a.dia) - DIAS_SEMANA.indexOf(b.dia);
                      if (diaCompare !== 0) return diaCompare;
                      return a.hora_inicio.localeCompare(b.hora_inicio);
                    })
                    .map((clase) => (
                      <tr
                        key={`${clase.id_grupo}-${clase.dia}`}
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
                          <span className="text-gray-700">{clase.letra_grupo}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-700">
                            {clase.aula || "-"}
                          </span>
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
