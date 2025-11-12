interface ScheduleFiltersProps {
  searchTerm: string;
  selectedDay: string;
  viewMode: "weekly" | "daily" | "list";
  availableDays: string[];
  onSearchChange: (value: string) => void;
  onDayChange: (value: string) => void;
  onViewModeChange: (mode: "weekly" | "daily" | "list") => void;
  filteredCount: number;
  totalCount: number;
}

export default function ScheduleFilters({
  searchTerm,
  selectedDay,
  viewMode,
  availableDays,
  onSearchChange,
  onDayChange,
  onViewModeChange,
  filteredCount,
  totalCount,
}: ScheduleFiltersProps) {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Búsqueda */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar materia, clave o aula..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
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
          onChange={(e) => onDayChange(e.target.value)}
          className="px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 text-gray-900 dark:text-white"
        >
          <option value="all">Todos los días</option>
          {availableDays.map((dia) => (
            <option key={dia} value={dia}>
              {dia}
            </option>
          ))}
        </select>

        {/* Selector de vista */}
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
          <button
            onClick={() => onViewModeChange("weekly")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === "weekly"
                ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            Semanal
          </button>
          <button
            onClick={() => onViewModeChange("daily")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === "daily"
                ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            Diario
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === "list"
                ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            Lista
          </button>
        </div>
      </div>

      {/* Contador */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Mostrando {filteredCount} de {totalCount} clases
      </div>
    </div>
  );
}
