"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getAvailableStaffAction,
  getStaffScheduleAction,
  getStaffAppointmentsAction,
  createAppointmentAction,
  getMyAppointmentsAction,
  cancelAppointmentAction,
} from "../../actions/student/appointments";

interface Staff {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  consultation_room_id: number | null;
  consultation_rooms: {
    name: string;
    location: string;
  } | null;
}

interface Appointment {
  id: number;
  appointment_date: Date;
  start_time: Date;
  end_time: Date;
  status: string;
  consultation_type: string | null;
  notes: string | null;
  staff: {
    first_name: string;
    last_name: string;
    consultation_rooms: {
      name: string;
      location: string;
    } | null;
  };
}

export default function AppointmentsDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"new" | "my">("my");
  const [staff, setStaff] = useState<Staff[]>([]);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  // Formulario de nueva cita
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [consultationType, setConsultationType] = useState("Consulta general");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadMyAppointments = useCallback(async () => {
    setLoadingAppointments(true);
    const result = await getMyAppointmentsAction();
    if (result.success && result.data) {
      setMyAppointments(result.data as Appointment[]);
    }
    setLoadingAppointments(false);
  }, []);

  // Cargar psicólogos disponibles al montar el componente
  useEffect(() => {
    const loadStaff = async () => {
      const result = await getAvailableStaffAction();
      if (result.success && result.data) {
        setStaff(result.data);
      }
    };

    loadStaff();
  }, []);

  // Cargar mis citas cuando cambie la pestaña a "my"
  useEffect(() => {
    if (activeTab === "my") {
      loadMyAppointments();
    }
  }, [activeTab, loadMyAppointments]);

  // Cargar horarios disponibles cuando cambien el psicólogo o la fecha
  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (!selectedStaff || !selectedDate) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      setSelectedTime(""); // Resetear la hora seleccionada

      try {
        // Obtener el día de la semana (0 = Domingo, 1 = Lunes, etc.)
        const date = new Date(selectedDate + "T00:00:00");
        const dayOfWeek = date.getDay();

        // Obtener los horarios del psicólogo para ese día
        const schedulesResult = await getStaffScheduleAction(selectedStaff, dayOfWeek);

        if (!schedulesResult.success || !schedulesResult.data) {
          setAvailableSlots([]);
          setLoadingSlots(false);
          return;
        }

        // Obtener las citas ya agendadas para esa fecha
        const appointmentsResult = await getStaffAppointmentsAction(selectedStaff, selectedDate);
        const bookedTimes = appointmentsResult.success && appointmentsResult.data
          ? appointmentsResult.data.map(apt => {
            const time = new Date(apt.start_time);
            return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
          })
          : [];

        // Generar slots disponibles basados en los horarios del psicólogo
        const slots: string[] = [];
        schedulesResult.data.forEach(schedule => {
          const startTime = new Date(schedule.start_time);
          const endTime = new Date(schedule.end_time);

          let currentTime = new Date(startTime);

          while (currentTime < endTime) {
            const timeStr = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;

            // Solo agregar si no está ocupado
            if (!bookedTimes.includes(timeStr)) {
              slots.push(timeStr);
            }

            // Avanzar 1 hora (duración de cada cita)
            currentTime.setHours(currentTime.getHours() + 1);
          }
        });

        setAvailableSlots(slots.sort());
      } catch (error) {
        console.error("Error loading slots:", error);
        setAvailableSlots([]);
      }

      setLoadingSlots(false);
    };

    loadAvailableSlots();
  }, [selectedStaff, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStaff || !selectedDate || !selectedTime) {
      setMessage({ type: "error", text: "Por favor complete todos los campos requeridos" });
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await createAppointmentAction({
      staff_id: selectedStaff,
      appointment_date: selectedDate,
      start_time: selectedTime,
      consultation_type: consultationType,
      notes: notes || undefined,
    });

    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: result.message || "Cita creada exitosamente" });
      // Limpiar formulario
      setSelectedStaff(null);
      setSelectedDate("");
      setSelectedTime("");
      setConsultationType("Consulta general");
      setNotes("");
      // Recargar citas
      loadMyAppointments();
      // Cambiar a la pestaña de mis citas
      setTimeout(() => setActiveTab("my"), 2000);
    } else {
      setMessage({ type: "error", text: result.error || "Error al crear la cita" });
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm("¿Está seguro de que desea cancelar esta cita?")) {
      return;
    }

    const result = await cancelAppointmentAction(appointmentId);
    if (result.success) {
      setMessage({ type: "success", text: result.message || "Cita cancelada exitosamente" });
      loadMyAppointments();
    } else {
      setMessage({ type: "error", text: result.error || "Error al cancelar la cita" });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-MX", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: Date) => {
    return new Date(time).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", label: "Pendiente" },
      confirmed: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", label: "Confirmada" },
      completed: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", label: "Completada" },
      cancelled: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", label: "Cancelada" },
      no_show: { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-700 dark:text-gray-400", label: "No asistió" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/student")}
              className="w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-all"
            >
              <svg
                className="w-6 h-6 text-gray-700 dark:text-gray-200"
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🧠 Citas Psicológicas
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Agenda y consulta tus citas con psicólogos
              </p>
            </div>
          </div>
        </div>

        {/* Mensaje de éxito/error */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl ${message.type === "success"
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
              }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("my")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "my"
              ? "bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
              : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200"
              }`}
          >
            📅 Mis Citas
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "new"
              ? "bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
              : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200"
              }`}
          >
            ➕ Nueva Cita
          </button>
        </div>

        {/* Contenido */}
        {activeTab === "new" ? (
          // Formulario de nueva cita
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Agendar Nueva Cita
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seleccionar Psicólogo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Psicólogo *
                </label>
                <select
                  value={selectedStaff || ""}
                  onChange={(e) => setSelectedStaff(Number(e.target.value))}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccione un psicólogo</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name}
                      {s.consultation_rooms && ` - ${s.consultation_rooms.name}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Hora */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Horario Disponible *
                </label>
                {!selectedStaff || !selectedDate ? (
                  <div className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400">
                    Seleccione primero un psicólogo y una fecha
                  </div>
                ) : loadingSlots ? (
                  <div className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    Cargando horarios...
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="w-full px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl text-yellow-700 dark:text-yellow-400">
                    No hay horarios disponibles para esta fecha. Intente con otra fecha.
                  </div>
                ) : (
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccione un horario</option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Tipo de consulta */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Consulta
                </label>
                <select
                  value={consultationType}
                  onChange={(e) => setConsultationType(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Consulta general">Consulta general</option>
                  <option value="Primera consulta">Primera consulta</option>
                  <option value="Seguimiento">Seguimiento</option>
                  <option value="Urgencia">Urgencia</option>
                </select>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Describe brevemente el motivo de tu consulta..."
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Botón de enviar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Agendando..." : "Agendar Cita"}
              </button>
            </form>
          </div>
        ) : (
          // Lista de mis citas
          <div className="space-y-4">
            {loadingAppointments ? (
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando citas...</p>
              </div>
            ) : myAppointments.length === 0 ? (
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No tienes citas agendadas
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Agenda tu primera cita con un psicólogo
                </p>
                <button
                  onClick={() => setActiveTab("new")}
                  className="px-6 py-3 bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg transition-all"
                >
                  Agendar Cita
                </button>
              </div>
            ) : (
              myAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-200/50 dark:border-gray-700/50"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Dr(a). {appointment.staff.first_name} {appointment.staff.last_name}
                        </h3>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="space-y-1 text-gray-600 dark:text-gray-400">
                        <p className="flex items-center gap-2">
                          <span>📅</span>
                          {formatDate(appointment.appointment_date)}
                        </p>
                        <p className="flex items-center gap-2">
                          <span>🕒</span>
                          {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                        </p>
                        {appointment.consultation_type && (
                          <p className="flex items-center gap-2">
                            <span>📋</span>
                            {appointment.consultation_type}
                          </p>
                        )}
                        {appointment.staff.consultation_rooms && (
                          <p className="flex items-center gap-2">
                            <span>📍</span>
                            {appointment.staff.consultation_rooms.name} - {appointment.staff.consultation_rooms.location}
                          </p>
                        )}
                        {appointment.notes && (
                          <p className="flex items-center gap-2 mt-2">
                            <span>💬</span>
                            <span className="italic">{appointment.notes}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    {appointment.status === "pending" && (
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg transition-all"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
