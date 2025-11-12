import { redirect } from "next/navigation";
import { isAuthenticated } from "@/app/actions/login/jwt-utils";
import { getKardexAction } from "@/app/actions/student/kardex";
import KardexDashboard from "./kardex-dashboard";

export default async function KardexPage() {
  // Verificar autenticación
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/login");
  }

  // Obtener datos del kardex
  const result = await getKardexAction();

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-200/50 dark:border-gray-700/50">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error al cargar el kardex
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {result.error || "No se pudo obtener la información del kardex"}
          </p>
          <a
            href="/student"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return <KardexDashboard kardexData={result.data} />;
}
