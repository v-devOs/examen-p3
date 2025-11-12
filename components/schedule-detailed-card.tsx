import type { ScheduleClass } from "@/app/actions/student/schedule";

interface ScheduleDetailedCardProps {
  clase: ScheduleClass;
  formatTime: (time: string) => string;
}

export default function ScheduleDetailedCard({
  clase,
  formatTime,
}: ScheduleDetailedCardProps) {
  return (
    <div className="bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border-2 border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Horario destacado */}
        <div className="shrink-0 bg-linear-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-4 text-center min-w-[120px]">
          <div className="text-2xl font-bold">{formatTime(clase.hora_inicio)}</div>
          <div className="text-sm opacity-90">a</div>
          <div className="text-xl font-bold">{formatTime(clase.hora_fin)}</div>
        </div>

        {/* Información de la clase */}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {clase.nombre_materia}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{clase.clave_materia}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {clase.aula && (
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <svg
                  className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400 shrink-0"
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
                <span>{clase.aula}</span>
              </div>
            )}

            {clase.letra_grupo && (
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <svg
                  className="w-5 h-5 mr-2 text-green-500 dark:text-green-400 shrink-0"
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
                <span>Grupo {clase.letra_grupo}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
