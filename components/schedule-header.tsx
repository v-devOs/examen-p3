interface ScheduleHeaderProps {
  title: string;
  subtitle?: string;
  isRefreshing: boolean;
  onBack: () => void;
  onRefresh: () => void;
}

export default function ScheduleHeader({
  title,
  subtitle,
  isRefreshing,
  onBack,
  onRefresh,
}: ScheduleHeaderProps) {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-600 dark:text-gray-300"
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
            <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>
            {subtitle && <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}
