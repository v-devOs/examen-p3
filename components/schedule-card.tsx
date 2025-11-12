import type { ScheduleClass } from "@/app/actions/student/schedule";

interface ScheduleCardProps {
  clase: ScheduleClass;
  formatTime: (time: string) => string;
}

export default function ScheduleCard({ clase, formatTime }: ScheduleCardProps) {
  return (
    <div className="bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 border-2 border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
            {clase.nombre_materia}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{clase.clave_materia}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-blue-600 dark:text-blue-400">
          <svg
            className="w-4 h-4 mr-2 shrink-0"
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

        {clase.aula && (
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <svg
              className="w-4 h-4 mr-2 shrink-0"
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
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <svg
              className="w-4 h-4 mr-2 shrink-0"
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
  );
}
