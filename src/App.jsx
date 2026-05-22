import { supabase } from './supabase'
import { useState, useEffect } from 'react';
import {
  Pill, Activity, Syringe, Home as HomeIcon, Cross, Heart, BookOpen,
  Phone, MapPin, CheckCircle, Star, Shield, Calendar, User, UserPlus,
  LogOut, Plus, MessageCircle, Menu, X, FileText, Users, Trash2,
  Edit, Stethoscope, Award, Search, ArrowRight, Check, AlertCircle,
  ChevronDown, Tag, UserCog, Clock, Package, ToggleLeft, ToggleRight,
  Bell, Route, Navigation, ChevronsRight
} from 'lucide-react';

const WHATSAPP = '56920489639';
const PHONE = '+56 9 2048 9639';
const PROFESSIONAL_NAME = 'Mariela Droguett';

const HOURS_MORNING_START = '09:00';
const HOURS_MORNING_END = '12:00';
const HOURS_AFTERNOON_START = '14:00';
const HOURS_AFTERNOON_END = '18:00';
const HOURS_LABEL_MORNING = '9:00 AM - 12:00 PM';
const HOURS_LABEL_AFTERNOON = '2:00 PM - 6:00 PM';
const HOURS_LABEL_FULL = 'Mañana: ' + HOURS_LABEL_MORNING + ' · Tarde: ' + HOURS_LABEL_AFTERNOON;

const SLOT_MINUTES = 30;

const ICON_OPTIONS = [
  { id: 'syringe', icon: Syringe, label: 'Jeringa' },
  { id: 'pill', icon: Pill, label: 'Pastilla' },
  { id: 'cross', icon: Cross, label: 'Cruz médica' },
  { id: 'activity', icon: Activity, label: 'Actividad' },
  { id: 'heart', icon: Heart, label: 'Corazón' },
  { id: 'home', icon: HomeIcon, label: 'Domicilio' },
  { id: 'book', icon: BookOpen, label: 'Libro' },
  { id: 'message', icon: MessageCircle, label: 'Mensaje' },
  { id: 'file', icon: FileText, label: 'Documento' },
  { id: 'stethoscope', icon: Stethoscope, label: 'Estetoscopio' }
];

const getIconComponent = (iconId) => (ICON_OPTIONS.find(i => i.id === iconId) || ICON_OPTIONS[0]).icon;

// ==================== NOTIFICACIONES WHATSAPP (CallMeBot) ====================
const sendWhatsAppToAdmin = async (data, type = 'new_appointment') => {
  try {
    const adminPhone = (import.meta.env.VITE_ADMIN_WHATSAPP || WHATSAPP).replace(/\D/g, '');
    const apiKey = import.meta.env.VITE_CALLMEBOT_APIKEY;

    if (!adminPhone || !apiKey) {
      console.warn("⚠️ CallMeBot: Credenciales no configuradas");
      return false;
    }

    let message = '';

    switch (type) {
      case 'new_appointment':
        const netPrice = data.beneficiaries ? appNetPrice(data, services || []) : 0;
        const totalServices = data.beneficiaries?.reduce((sum, b) => sum + (b.services?.length || 0), 0) || 0;
        message = `*🔔 NUEVA RESERVA - Enfermereando*\n\n` +
          `👤 Paciente: ${data.patientName}\n` +
          `📞 Teléfono: ${data.patientPhone}\n` +
          `📅 Fecha: ${new Date(data.date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}\n` +
          `🕒 Hora: ${fmtTime(data.time)}\n` +
          `📍 Dirección: ${data.address}\n` +
          `👥 Personas: ${data.beneficiaries?.length || 1}\n` +
          `💉 Servicios: ${totalServices}\n` +
          `💰 Total: ${fmtCLP(netPrice)}\n\n` +
          `🔗 Revisar panel para confirmar.`;
        break;

      case 'confirmed':
        message = `*✅ CITA CONFIRMADA*\n\n` +
          `👤 ${data.patientName}\n` +
          `📅 ${new Date(data.date).toLocaleDateString('es-CL')}\n` +
          `🕒 ${fmtTime(data.time)}\n` +
          `👨‍⚕️ ${data.assignedToName || 'Asignado'}`;
        break;

      case 'completed':
        message = `*🏥 VISITA COMPLETADA*\n\n` +
          `👤 ${data.patientName}\n` +
          `📅 ${new Date(data.date).toLocaleDateString('es-CL')}\n` +
          `👨‍⚕️ ${data.completedBy || PROFESSIONAL_NAME}`;
        break;

      case 'cancelled':
        message = `*❌ CITA CANCELADA*\n\n` +
          `👤 ${data.patientName}\n` +
          `📅 ${new Date(data.date).toLocaleDateString('es-CL')}\n` +
          `📝 Motivo: ${data.cancelReason || 'No especificado'}`;
        break;
    }

    const encoded = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encoded}&apikey=${apiKey}`;

    await fetch(url, { method: 'GET', mode: 'no-cors' });
    console.log(`✅ WhatsApp enviado: ${type}`);
    return true;
  } catch (e) {
    console.error(`❌ Error WhatsApp (${type}):`, e);
    return false;
  }
};
// ==================== VALIDACIÓN DE INTEGRIDAD ====================

const normalizeServiceItem = (item) => {
  if (typeof item === 'string') return { serviceId: item, doses: 1, frequency: 'once', completedDoses: 0 };
  return { 
    serviceId: item.serviceId, 
    doses: item.doses || 1, 
    frequency: item.frequency || 'once', 
    completedDoses: item.completedDoses || 0 
  };
};

const normalizeApp = (a) => {
  let app = { ...a };
  if (!app.beneficiaries || !Array.isArray(app.beneficiaries)) {
    app.beneficiaries = [{
      id: 'b0',
      name: app.patientName || 'Paciente',
      relationship: 'Titular',
      services: app.serviceId ? [{ serviceId: app.serviceId }] : []
    }];
  }
  app.beneficiaries = app.beneficiaries.map(b => ({
    ...b,
    services: (b.services || []).map(normalizeServiceItem)
  }));
  if (!app.seriesId) app.seriesId = app.id || app.parentId || uid();
  if (typeof app.doseNumber === 'undefined') app.doseNumber = 1;
  return app;
};

const validateAndFixAppointment = (app, patients, professionals, services) => {
  let fixed = normalizeApp({ ...app });

  // Validar paciente
  if (!fixed.patientId || !patients.some(p => p.id === fixed.patientId)) {
    const possible = patients.find(p => p.name === fixed.patientName);
    if (possible) fixed.patientId = possible.id;
  }

  // Validar profesional
  if (fixed.assignedTo && !professionals.some(p => p.id === fixed.assignedTo)) {
    fixed.assignedTo = null;
    fixed.assignedToName = null;
  }

  // Validar servicios
  fixed.beneficiaries = fixed.beneficiaries.map(b => ({
    ...b,
    services: b.services.filter(item => services.some(s => s.id === item.serviceId))
  })).filter(b => b.services.length > 0);

  return fixed;
};

const validateAllAppointments = (apps, patients, professionals, services) => {
  return apps.map(app => validateAndFixAppointment(app, patients, professionals, services));
};

// ==================== DETECCIÓN DE DUPLICADOS ====================

const findDuplicatePatients = (patients) => {
  const groups = {};
  patients.forEach(p => {
    const keys = [
      p.username?.toLowerCase()?.trim(),
      p.email?.toLowerCase()?.trim(),
      p.phone?.replace(/\D/g, '')?.trim()
    ];
    keys.forEach(key => {
      if (key && key.length > 3) {
        if (!groups[key]) groups[key] = [];
        groups[key].push(p);
      }
    });
  });
  return Object.values(groups).filter(g => g.length > 1);
};

const findDuplicateProfessionals = (professionals) => {
  const groups = {};
  professionals.forEach(p => {
    const keys = [p.username?.toLowerCase()?.trim(), p.email?.toLowerCase()?.trim()];
    keys.forEach(key => {
      if (key && key.length > 3) {
        if (!groups[key]) groups[key] = [];
        groups[key].push(p);
      }
    });
  });
  return Object.values(groups).filter(g => g.length > 1);
};

// ==================== COMPONENTES AUXILIARES ====================

function RoleBadge({ role }) {
  if (role === 'admin') {
    return <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">ADMIN</span>;
  }
  return <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">PRO</span>;
}

function TabButton({ active, onClick, children, icon: Icon }) {
  return (
    <button 
      onClick={onClick} 
      className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 ${active ? 'bg-teal-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

function StatCard({ label, value, color = "teal" }) {
  const colors = {
    teal: "bg-teal-100 text-teal-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    red: "bg-red-100 text-red-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700"
  };
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[color] || colors.teal}`}></div>
      <div className="min-w-0">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
      <Icon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
      <p className="text-slate-500">{text}</p>
    </div>
  );
}

// ==================== CALENDAR VIEW ====================

function CalendarView({ appointments, onEdit }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const startOfMonth = new Date(year, month, 1);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d;
  });

  const appointmentsByDate = {};
  appointments.forEach(app => {
    if (app.status === 'cancelada') return;
    const key = app.date;
    if (!appointmentsByDate[key]) appointmentsByDate[key] = [];
    appointmentsByDate[key].push(app);
  });

  const navigateMonth = (delta) => {
    const newM = new Date(currentMonth);
    newM.setMonth(newM.getMonth() + delta);
    setCurrentMonth(newM);
  };

  const isTodayDate = (d) => d.toISOString().split('T')[0] === todayISO();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-5 border-b flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-slate-100 rounded-lg">
            <ChevronDown className="w-5 h-5 rotate-90" />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">
            {currentMonth.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-slate-100 rounded-lg">
            <ChevronDown className="w-5 h-5 -rotate-90" />
          </button>
        </div>
        <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium">Hoy</button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-500 border-b py-3 bg-white">
        {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200">
        {days.map((day, i) => {
          const dateKey = day.toISOString().split('T')[0];
          const dayApps = appointmentsByDate[dateKey] || [];
          const isCurrentMonth = day.getMonth() === month;
          const isToday = isTodayDate(day);

          return (
            <div
              key={i}
              onClick={() => setSelectedDate(dateKey)}
              className={`min-h-[118px] bg-white p-2 cursor-pointer hover:bg-teal-50 transition ${isCurrentMonth ? '' : 'opacity-40'} ${isToday ? 'bg-teal-50' : ''}`}
            >
              <div className={`text-right text-sm font-medium ${isToday ? 'text-teal-600 font-bold' : ''}`}>{day.getDate()}</div>
              <div className="space-y-1 mt-1">
                {dayApps.slice(0, 3).map(app => (
                  <div
                    key={app.id}
                    onClick={(e) => { e.stopPropagation(); onEdit(app); }}
                    className="text-[10px] px-2 py-1 bg-teal-100 text-teal-800 rounded flex items-center gap-1 truncate hover:bg-teal-200"
                  >
                    <span className="font-mono">{app.time?.slice(0,5)}</span>
                    <span className="truncate">{app.patientName}</span>
                    {app.totalDosesInSeries > 1 && <span className="text-amber-700 font-medium">({app.doseNumber || 1}/{app.totalDosesInSeries})</span>}
                  </div>
                ))}
                {dayApps.length > 3 && <div className="text-[10px] text-slate-400 text-center">+{dayApps.length - 3}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className="p-5 border-t bg-slate-50">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold text-lg">
              {new Date(selectedDate).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            <button onClick={() => setSelectedDate(null)} className="text-slate-400">✕</button>
          </div>
          <div className="space-y-3">
            {(appointmentsByDate[selectedDate] || []).map(app => (
              <div key={app.id} onClick={() => onEdit(app)} className="bg-white p-4 rounded-xl border hover:border-teal-300 cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-lg">{fmtTime(app.time)} — {app.patientName}</div>
                    <div className="text-sm text-slate-600">{app.address}</div>
                  </div>
                  {app.totalDosesInSeries > 1 && (
                    <div className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full font-medium">
                      Dosis {app.doseNumber || 1}/{app.totalDosesInSeries}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== FUNCIONES PRINCIPALES ====================

const sget = async (k, def) => {
  try {
    const { data, error } = await supabase
      .from('app_storage')
      .select('value')
      .eq('key', k)
      .single();
    if (error || !data) return def;
    return data.value;
  } catch (e) {
    console.error('Supabase read error:', e);
    return def;
  }
};

const sset = async (k, v) => {
  try {
    await supabase
      .from('app_storage')
      .upsert({ key: k, value: v }, { onConflict: 'key' });
  } catch (e) {
    console.error('Supabase write error:', e);
  }
};

const saveAppointments = async (list, setAppointments, patients, professionals, services) => {
  const validated = validateAllAppointments(list, patients, professionals, services);
  setAppointments(validated);
  await sset('enf:appointments', validated);
};

// ==================== COMPONENTE PRINCIPAL ====================

export default function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let svcs = await sget('enf:services', null);
      if (!svcs || svcs.length === 0) {
        svcs = DEFAULT_SERVICES;
        await sset('enf:services', svcs);
      }

      let rawApps = await sget('enf:appointments', []);
      let apps = rawApps.map(normalizeApp);
      const pats = await sget('enf:patients', []);
      let profs = await sget('enf:professionals', []);
      const notifs = await sget('enf:notifications', []);

      // Validación completa
      apps = validateAllAppointments(apps, pats, profs, svcs);

      // Admin por defecto
      if (!profs.some(p => p.role === 'admin' && p.active)) {
        profs = [{
          id: 'admin-default',
          username: 'admin',
          password: 'enfermera2026',
          name: PROFESSIONAL_NAME,
          email: '',
          role: 'admin',
          active: true,
          createdAt: Date.now()
        }].concat(profs);
        await sset('enf:professionals', profs);
      }

      setServices(svcs);
      setAppointments(apps);
      setPatients(pats);
      setProfessionals(profs);
      setNotifications(notifs);
      setLoading(false);

      // Recordatorios automáticos
      setTimeout(() => sendAutomaticReminders(apps, addNotification), 1500);
    })();
  }, []);

  const saveAppointmentsWrapper = async (list) => {
    await saveAppointments(list, setAppointments, patients, professionals, services);
  };

  const addNotification = async (notif) => {
    const newList = [{ id: uid(), createdAt: Date.now(), read: false, ...notif }].concat(notifications).slice(0, 150);
    setNotifications(newList);
    await sset('enf:notifications', newList);
  };

  const login = async (data) => {
    // Tu función de login original va aquí
    console.log("Login llamado con:", data);
  };

  const logout = () => {
    setUser(null);
    setView('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="text-teal-700 font-medium">Cargando aplicación...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {view === 'landing' && <Landing services={services.filter(s => s.active)} onLogin={() => setView('login')} />}
      {view === 'login' && <LoginView onLogin={login} onBack={() => setView('landing')} />}
      {view === 'patient' && user && user.role === 'patient' && (
        <PatientPortal 
          user={user} 
          services={services.filter(s => s.active)} 
          appointments={appointments} 
          notifications={notifications} 
          saveAppointments={saveAppointmentsWrapper} 
          addNotification={addNotification} 
          onLogout={logout} 
        />
      )}
      {view === 'admin' && user && user.role !== 'patient' && (
        <AdminPanel 
          user={user} 
          setUser={setUser} 
          services={services} 
          saveServices={saveServices} 
          appointments={appointments} 
          patients={patients} 
          professionals={professionals} 
          notifications={notifications} 
          saveAppointments={saveAppointmentsWrapper} 
          savePatients={savePatients}
          saveProfessionals={saveProfessionals} 
          addNotification={addNotification} 
          onLogout={logout} 
        />
      )}
    </div>
  );
}

// ==================== VISTAS PRINCIPALES ====================

function Landing({ services, onLogin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <>
      {/* NAVEGACIÓN (mantén tu navbar original aquí si ya lo tienes) */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-teal-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-teal-900">Enfermereando</div>
              <div className="text-xs text-teal-600 hidden sm:block">Salud en tu hogar</div>
            </div>
          </div>
          <button onClick={onLogin} className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold">Acceder</button>
        </div>
      </nav>

      {/* Contenido del Landing - mantén tu código original aquí si lo tienes */}
      {/* Por brevedad, aquí va tu sección hero, servicios, etc. */}
      {/* ... */}
    </>
  );
}

function LoginView({ onLogin, onBack }) {
  // Tu código original de LoginView va aquí (mantén intacto)
  // Solo asegúrate de que llame correctamente a onLogin
  return <div>Login View (tu código original)</div>;
}

function NotificationBell({ userId, notifications, markNotifRead, markAllNotifsRead }) {
  const [open, setOpen] = useState(false);
  const myNotifs = notifications.filter(n => n.userId === userId).slice(0, 20);
  const unreadCount = myNotifs.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-slate-100 notification-bell">
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">{unreadCount}</span>}
      </button>
      {/* Resto de tu NotificationBell original */}
    </div>
  );
}

function PatientPortal({ user, services, appointments, notifications, saveAppointments, addNotification, onLogout }) {
  // Tu código original de PatientPortal va aquí
  // Incluye RequestForm, AppointmentCard, etc.
  return <div>Patient Portal (tu código original)</div>;
}

function PatientProfile({ user, patients, savePatients, setUser }) {
  // Tu código original de PatientProfile
  return <div>Patient Profile (tu código original)</div>;
}

// ==================== FIN DE PARTE 5 ====================
// ==================== ADMIN PANEL COMPLETO ====================

function AdminPanel({ 
  user, 
  setUser, 
  services, 
  saveServices, 
  appointments, 
  patients, 
  professionals, 
  notifications, 
  saveAppointments, 
  savePatients, 
  saveProfessionals, 
  addNotification, 
  onLogout 
}) {
  const [tab, setTab] = useState('hoy');
  const [editingApp, setEditingApp] = useState(null);
  const [completingApp, setCompletingApp] = useState(null);

  const isAdmin = user.role === 'admin';
  const visibleApps = isAdmin ? appointments : appointments.filter(a => a.assignedTo === user.id);

  const confirmAppointment = async (appId) => {
    const app = appointments.find(a => a.id === appId);
    if (!app) return;
    const updated = { ...app, status: 'asignada', assignedTo: user.id, assignedToName: user.name };
    await saveAppointments(appointments.map(a => a.id === appId ? updated : a));
    await sendWhatsAppToAdmin(updated, 'confirmed');
  };

  const completeWithEvolutions = async (id, evolutions) => {
    const app = appointments.find(a => a.id === id);
    if (!app) return;
    const updatedApp = { ...app, status: 'completada', completedBy: user.name, evolutions: { ...(app.evolutions || {}), ...evolutions } };
    await saveAppointments(appointments.map(a => a.id === id ? updatedApp : a));
    await sendWhatsAppToAdmin(updatedApp, 'completed');
    setCompletingApp(null);
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-8 h-8 text-teal-600" />
            <div className="font-bold text-xl text-slate-900">Enfermereando</div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell userId={user.id} notifications={notifications} markNotifRead={markNotifRead} />
            <div className="text-right">
              <div className="text-sm font-semibold">{user.name}</div>
              <RoleBadge role={user.role} />
            </div>
            <button onClick={onLogout} className="p-2 hover:bg-slate-100 rounded-lg">
              <LogOut className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <TabButton active={tab === 'hoy'} onClick={() => setTab('hoy')} icon={Calendar}>Hoy</TabButton>
          <TabButton active={tab === 'calendario'} onClick={() => setTab('calendario')} icon={Calendar}>Calendario</TabButton>
          <TabButton active={tab === 'integridad'} onClick={() => setTab('integridad')} icon={Shield}>Integridad</TabButton>
          <TabButton active={tab === 'duplicados'} onClick={() => setTab('duplicados')} icon={Users}>Duplicados</TabButton>
        </div>

        {/* Contenido según tab */}
        {tab === 'calendario' && <CalendarView appointments={visibleApps} onEdit={setEditingApp} />}
        {tab === 'integridad' && <IntegrityDashboard appointments={appointments} patients={patients} professionals={professionals} services={services} currentUser={user} saveAppointments={saveAppointments} />}
        {tab === 'duplicados' && <DuplicateMerger patients={patients} professionals={professionals} appointments={appointments} savePatients={savePatients} saveAppointments={saveAppointments} currentUser={user} />}

      </div>

      {/* Modales */}
      {editingApp && (
        <EditAppointmentModal 
          app={editingApp} 
          services={services} 
          onSave={async (updates) => {
            await saveAppointments(appointments.map(a => a.id === updates.id ? { ...a, ...updates } : a));
            setEditingApp(null);
          }} 
          onClose={() => setEditingApp(null)} 
          onCancelApp={(id) => {
            saveAppointments(appointments.map(a => a.id === id ? { ...a, status: 'cancelada' } : a));
            setEditingApp(null);
          }}
        />
      )}
    </div>
  );
}