import { redirect } from "next/navigation";
import { isAuthenticated } from "@/app/actions/login";
import { getScheduleAction } from "@/app/actions/student/schedule";
import ScheduleDashboard from "./schedule-dashboard";
import ScheduleError from "./schedule-error";

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
    return <ScheduleError error={result.error} />;
  }

  return <ScheduleDashboard scheduleData={result.data} metadata={result.metadata} />;
}
