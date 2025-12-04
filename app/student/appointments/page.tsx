import { redirect } from "next/navigation";
import { isAuthenticated } from "../../actions/login/jwt-utils";
import AppointmentsDashboard from "./appointments-dashboard";

export default async function AppointmentsPage() {
  // Verificar autenticación
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/");
  }

  return <AppointmentsDashboard />;
}
