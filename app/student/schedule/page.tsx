import { redirect } from "next/navigation";
import { isAuthenticated } from "@/app/actions/login";
import { getScheduleAction } from "@/app/actions/student/schedule";
import ScheduleDashboard from "./schedule-dashboard";

export default async function SchedulePage() {
  // Verificar autenticación
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/login");
  }

  // Obtener horario
  const result = await getScheduleAction();

  // Manejar error
  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Error al cargar horario
              </h2>
              <p className="text-gray-600 mb-6">
                {result.error || "No se pudo obtener el horario"}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ScheduleDashboard scheduleData={result.data} metadata={result.metadata} />;
}
