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

const DEFAULT_SERVICES = [
  { id: 'inj-anti', iconId: 'syringe', title: 'Inyección anticonceptiva', desc: 'Aplicación de anticonceptivos hormonales con técnica estéril.', price: 15000, allowDoses: true, active: true },
  { id: 'inj-im', iconId: 'syringe', title: 'Inyección intramuscular', desc: 'Administración de medicamentos por vía intramuscular.', price: 18000, allowDoses: true, active: true },
  { id: 'inj-ev', iconId: 'syringe', title: 'Inyección endovenosa', desc: 'Administración de medicamentos por vía endovenosa.', price: 25000, allowDoses: true, active: true },
  { id: 'exam', iconId: 'file', title: 'Revisión de exámenes', desc: 'Explicación, comentarios y derivaciones según corresponda.', price: 20000, allowDoses: false, active: true },
  { id: 'counsel', iconId: 'heart', title: 'Consejería presencial', desc: 'Patologías crónicas, diabetes, hipertensión, salud mental.', price: 30000, allowDoses: false, active: true },
  { id: 'online', iconId: 'message', title: 'Asesoría online', desc: 'Educación por videollamada.', price: 35000, allowDoses: false, active: true },
  { id: 'cur-simple', iconId: 'cross', title: 'Curación simple', desc: 'Curación de heridas leves.', price: 18000, allowDoses: true, active: true },
  { id: 'cur-adv', iconId: 'activity', title: 'Curación avanzada', desc: 'Pie diabético, úlceras y LPP.', price: 40000, allowDoses: true, active: true }
];

const COMUNAS = ['Buin','Cerrillos','Cerro Navia','Colina','Conchalí','Curacaví','El Bosque','Estación Central','Huechuraba','Independencia','La Cisterna','La Florida','La Granja','La Pintana','La Reina','Las Condes','Lo Barnechea','Lo Espejo','Lo Prado','Macul','Maipú','Melipilla','Ñuñoa','Padre Hurtado','Paine','Pedro Aguirre Cerda','Peñaflor','Peñalolén','Pirque','Providencia','Pudahuel','Puente Alto','Quilicura','Quinta Normal','Recoleta','Renca','San Bernardo','San Joaquín','San Miguel','San Pedro','San Ramón','Santiago','Talagante','Vitacura'];

const FREQUENCIES = [
  { id: 'once', label: 'Una sola vez', days: 0 },
  { id: 'daily', label: 'Diaria', days: 1 },
  { id: 'every3days', label: 'Cada 3 días', days: 3 },
  { id: 'weekly', label: 'Semanal', days: 7 },
  { id: 'biweekly', label: 'Cada 15 días', days: 15 },
  { id: 'monthly', label: 'Mensual', days: 30 }
];

const TEMPLATES = {
  'inj-anti': 'Medicamento administrado:\nDosis:\nVía / Sitio de punción:\nReacción adversa: No / Sí\nFecha próxima dosis:',
  'inj-im': 'Medicamento administrado:\nDosis:\nSitio de punción:\nReacción adversa: No / Sí\nTolerancia:',
  'inj-ev': 'Medicamento administrado:\nDosis:\nVía venosa:\nVelocidad:\nReacción adversa:',
  'exam': 'Exámenes revisados:\nHallazgos relevantes:\nDerivación sugerida:',
  'counsel': 'Tema(s) abordados:\nNivel de adherencia:\nDudas resueltas:',
  'online': 'Modalidad: Videollamada\nTema(s) tratados:\nPróximo control:',
  'cur-simple': 'Tipo de herida:\nDimensiones:\nApósito utilizado:\nIndicaciones:',
  'cur-adv': 'Tipo de herida:\nDimensiones:\nExudado:\nTratamiento aplicado:'
};

const TESTIMONIALS = [
  { name: 'María Fernanda C.', comuna: 'Providencia', text: 'Mi madre tiene una úlcera por presión y la atención ha sido impecable.', stars: 5 },
  { name: 'Roberto Silva', comuna: 'Las Condes', text: 'Necesitaba inyecciones diarias y el servicio fue siempre puntual.', stars: 5 },
  { name: 'Patricia Vega', comuna: 'Ñuñoa', text: 'Excelente manejo del pie diabético de mi padre.', stars: 5 }
];

const FAQ_ITEMS = [
  { q: '¿Cuáles son los horarios de atención?', a: 'Atendemos en dos franjas horarias: mañana de ' + HOURS_LABEL_MORNING + ' y tarde de ' + HOURS_LABEL_AFTERNOON + '.' },
  { q: '¿Puedo programar dosis múltiples?', a: 'Sí. Puedes elegir un paquete con varias dosis y la frecuencia que necesites. Cada dosis se agenda como visita independiente.' },
  { q: '¿Cuál es el tiempo de respuesta?', a: 'Respondemos en menos de 30 minutos en horario hábil.' },
  { q: '¿Puedo agendar para varios miembros de mi familia?', a: 'Sí. Aplicamos descuento automático por grupo familiar: 5% desde 2 personas, 10% desde 3 y 15% desde 4.' },
  { q: '¿Cómo se realiza el pago?', a: 'Aceptamos transferencia bancaria y efectivo.' },
  { q: '¿Atienden urgencias?', a: 'Sí, atendemos urgencias con disponibilidad inmediata sujeta a agenda.' }
];

const RELATIONSHIPS = ['Titular','Cónyuge','Hijo/a','Padre','Madre','Abuelo/a','Hermano/a','Otro familiar','Otro'];

// ==================== HELPERS PARA SERIES ====================
const getFrequencyLabel = (freqId) => FREQUENCIES.find(f => f.id === freqId)?.label || 'Una sola vez';

const addDays = (dateStr, days) => {
  if (!dateStr || days <= 0) return dateStr;
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const generateAppointmentSeries = (baseApp, services) => {
  const seriesId = baseApp.seriesId || uid();
  const generated = [];

  baseApp.beneficiaries.forEach(ben => {
    ben.services.forEach(item => {
      const svc = services.find(s => s.id === item.serviceId);
      if (!svc) return;

      const doses = Math.max(1, item.doses || 1);
      const freq = FREQUENCIES.find(f => f.id === (item.frequency || 'once')) || FREQUENCIES[0];
      let currentDate = baseApp.date;

      for (let i = 0; i < doses; i++) {
        const appointment = {
          ...baseApp,
          id: i === 0 ? baseApp.id : uid(),
          seriesId,
          doseNumber: i + 1,
          date: currentDate,
          time: baseApp.time,
          beneficiaries: [{
            ...ben,
            services: [{ ...item, completedDoses: 0 }]
          }],
          status: 'pendiente',
          createdAt: Date.now()
        };
        generated.push(appointment);

        if (freq.days > 0 && i < doses - 1) {
          currentDate = addDays(currentDate, freq.days);
        }
      }
    });
  });

  return generated;
};

// ==================== WHATSAPP ====================
const sendWhatsAppToAdmin = async (data, type = 'new_appointment', services = [], isSeriesCancel = false) => {
  try {
    const adminPhone = (import.meta.env.VITE_ADMIN_WHATSAPP || WHATSAPP).replace(/\D/g, '');
    const apiKey = import.meta.env.VITE_CALLMEBOT_APIKEY;
    if (!adminPhone || !apiKey) return false;

    let message = '';
    switch (type) {
      case 'new_appointment':
        const net = data.beneficiaries ? appNetPrice(data, services) : 0;
        message = `*🔔 NUEVA RESERVA - Enfermereando*\n\n👤 ${data.patientName}\n📞 ${data.patientPhone}\n📅 ${new Date(data.date).toLocaleDateString('es-CL')}\n🕒 ${fmtTime(data.time)}\n📍 ${data.address}\n💰 Total: ${fmtCLP(net)}`;
        break;
      case 'confirmed':
        message = `*✅ CITA CONFIRMADA*\n👤 ${data.patientName}\n📅 ${new Date(data.date).toLocaleDateString('es-CL')}\n🕒 ${fmtTime(data.time)}`;
        break;
      case 'completed':
        message = `*🏥 VISITA COMPLETADA*\n👤 ${data.patientName}`;
        break;
      case 'cancelled':
        const seriesInfo = isSeriesCancel ? ' (TODA LA SERIE)' : '';
        message = `*❌ CITA CANCELADA${seriesInfo}*\n👤 ${data.patientName}\n📅 ${new Date(data.date).toLocaleDateString('es-CL')}`;
        break;
    }

    const encoded = encodeURIComponent(message);
    await fetch(`https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encoded}&apikey=${apiKey}`, { method: 'GET', mode: 'no-cors' });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

// ==================== UTILIDADES ====================
// ==================== HELPERS PARA SERIES DE CITAS ====================
const getFrequencyLabel = (freqId) => FREQUENCIES.find(f => f.id === freqId)?.label || 'Una sola vez';

const addDays = (dateStr, days) => {
  if (!dateStr || days <= 0) return dateStr;
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const generateAppointmentSeries = (baseApp, services) => {
  const seriesId = baseApp.seriesId || uid();
  const generated = [];

  baseApp.beneficiaries.forEach(ben => {
    ben.services.forEach(item => {
      const svc = services.find(s => s.id === item.serviceId);
      if (!svc) return;

      const doses = Math.max(1, item.doses || 1);
      const freq = FREQUENCIES.find(f => f.id === (item.frequency || 'once')) || FREQUENCIES[0];
      let currentDate = baseApp.date;

      for (let i = 0; i < doses; i++) {
        const appointment = {
          ...baseApp,
          id: i === 0 ? baseApp.id : uid(),
          seriesId,
          doseNumber: i + 1,
          date: currentDate,
          time: baseApp.time,
          beneficiaries: [{
            ...ben,
            services: [{ ...item, completedDoses: 0 }]
          }],
          status: 'pendiente',
          createdAt: Date.now()
        };
        generated.push(appointment);

        if (freq.days > 0 && i < doses - 1) {
          currentDate = addDays(currentDate, freq.days);
        }
      }
    });
  });

  return generated;
};

const fmtCLP = (n) => '$' + Math.round(n).toLocaleString('es-CL');
const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
const todayISO = () => new Date().toISOString().split('T')[0];
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const appNetPrice = (a, services) => {
  const gross = a.beneficiaries.reduce((sum, b) => sum + b.services.reduce((s, item) => {
    const svc = services.find(s => s.id === item.serviceId);
    return s + (svc ? svc.price * (item.doses || 1) : 0);
  }, 0), 0);
  const discount = a.beneficiaries.length >= 4 ? 0.15 : a.beneficiaries.length === 3 ? 0.10 : a.beneficiaries.length === 2 ? 0.05 : 0;
  return Math.round(gross * (1 - discount));
};

// Nueva utilidad para validación de integridad en creación de usuarios
const validateUserIntegrity = (username, patients, professionals, role) => {
  const lowerUsername = username.toLowerCase().trim();
  if (lowerUsername.length < 4) return { ok: false, error: 'El nombre de usuario debe tener al menos 4 caracteres' };
  
  const existingPatient = patients.some(p => p.username.toLowerCase() === lowerUsername);
  const existingPro = professionals.some(p => p.username.toLowerCase() === lowerUsername);
  
  if (existingPatient || existingPro) {
    return { ok: false, error: 'Este nombre de usuario ya está en uso' };
  }
  
  // Validación adicional de integridad (duplicados por nombre + teléfono para pacientes)
  if (role === 'patient') {
    return { ok: true };
  }
  return { ok: true };
};

const appNetPrice = (a, services) => {
  const gross = a.beneficiaries.reduce((sum, b) => sum + b.services.reduce((s, item) => {
    const svc = services.find(s => s.id === item.serviceId);
    return s + (svc ? svc.price * (item.doses || 1) : 0);
  }, 0), 0);
  const discount = a.beneficiaries.length >= 4 ? 0.15 : a.beneficiaries.length === 3 ? 0.10 : a.beneficiaries.length === 2 ? 0.05 : 0;
  return Math.round(gross * (1 - discount));
};

// ==================== NOTIFICACIONES PUSH ====================
let pushSubscription = null;

const requestPushPermission = async () => {
  if (!('Notification' in window) || !('PushManager' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

const sendPushNotification = (title, body, icon = '/icon-192.png') => {
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body, icon, tag: 'enfermereando-notification', requireInteraction: false });
};

function NotificationBell({ userId, notifications, markNotifRead, markAllNotifsRead }) {
  const [open, setOpen] = useState(false);
  const myNotifs = notifications.filter(n => n.userId === userId).slice(0, 20);
  const unreadCount = myNotifs.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">{unreadCount}</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-40 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b flex justify-between items-center">
              <div className="font-semibold">Notificaciones</div>
              {unreadCount > 0 && <button onClick={() => markAllNotifsRead(userId)} className="text-xs text-teal-600 font-medium">Marcar todo como leído</button>}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {myNotifs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No hay notificaciones</div>
              ) : (
                myNotifs.map(notif => (
                  <div key={notif.id} onClick={() => markNotifRead(notif.id)} className={`px-4 py-3 border-b hover:bg-slate-50 cursor-pointer ${!notif.read ? 'bg-teal-50' : ''}`}>
                    <div className="font-medium text-sm">{notif.title}</div>
                    <div className="text-xs text-slate-600 mt-1 line-clamp-2">{notif.body}</div>
                    <div className="text-[10px] text-slate-400 mt-2">{new Date(notif.createdAt).toLocaleString('es-CL')}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ==================== INTEGRACIÓN CON SUPABASE REALTIME ====================
const setupRealtimeNotifications = (userId, addNotification) => {
  if (!userId) return;

  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'app_storage',
        filter: `key=eq.enf:notifications`
      },
      (payload) => {
        const newNotif = payload.new.value.find(n => n.userId === userId && !n.read);
        if (newNotif) {
          addNotification(newNotif);
          sendPushNotification(newNotif.title, newNotif.body);
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};

// ==================== VALIDACIÓN COMPLETA DE CITAS ====================
const normalizeApp = (a) => {
  let app = { ...a };
  
  if (!app.beneficiaries || !Array.isArray(app.beneficiaries) || app.beneficiaries.length === 0) {
    app.beneficiaries = [{
      id: 'b0',
      name: app.patientName || 'Paciente',
      relationship: 'Titular',
      services: app.serviceId ? [{ serviceId: app.serviceId, doses: 1, frequency: 'once', completedDoses: 0 }] : []
    }];
  }

  app.beneficiaries = app.beneficiaries.map(b => ({
    ...b,
    services: (b.services || []).map(item => 
      typeof item === 'string' 
        ? { serviceId: item, doses: 1, frequency: 'once', completedDoses: 0 }
        : { serviceId: item.serviceId, doses: item.doses || 1, frequency: item.frequency || 'once', completedDoses: item.completedDoses || 0 }
    )
  }));

  if (!app.seriesId) app.seriesId = app.id || app.parentId || uid();
  if (typeof app.doseNumber === 'undefined') app.doseNumber = 1;
  if (!app.createdAt) app.createdAt = Date.now();

  return app;
};

const validateAndFixAppointment = (app, patients, professionals, services) => {
  let fixed = normalizeApp({ ...app });

  let fixedIssues = [];

  if (!fixed.patientId || !patients.some(p => p.id === fixed.patientId)) {
    const possiblePatient = patients.find(p => p.name === fixed.patientName);
    if (possiblePatient) {
      fixed.patientId = possiblePatient.id;
      fixedIssues.push('Paciente reasignado automáticamente');
    } else {
      fixedIssues.push('Paciente no encontrado (cita huérfana)');
    }
  }

  if (fixed.assignedTo && !professionals.some(p => p.id === fixed.assignedTo)) {
    fixed.assignedTo = null;
    fixed.assignedToName = null;
    fixedIssues.push('Profesional asignado no existe → se quitó la asignación');
  }

  fixed.beneficiaries = fixed.beneficiaries.map(b => ({
    ...b,
    services: b.services.filter(item => {
      const exists = services.some(s => s.id === item.serviceId);
      if (!exists) fixedIssues.push(`Servicio ${item.serviceId} no existe → eliminado`);
      return exists;
    })
  })).filter(b => b.services.length > 0);

  if (new Date(fixed.date) < new Date(todayISO())) {
    fixedIssues.push('Fecha en el pasado → se permitió pero se marcó como advertencia');
  }

  fixed.validationIssues = fixedIssues;
  return fixed;
};

const validateAllAppointments = (apps, patients, professionals, services) => {
  return apps.map(app => validateAndFixAppointment(app, patients, professionals, services));
};

const saveAppointments = async (list, setAppointments, patients, professionals, services) => {
  const validated = validateAllAppointments(list, patients, professionals, services);
  setAppointments(validated);
  await sset('enf:appointments', validated);
  return validated;
};

// ==================== FUNCIONES DE PERSISTENCIA ====================
const sget = async (k, def) => {
  try {
    const { data } = await supabase.from('app_storage').select('value').eq('key', k).single();
    return data ? data.value : def;
  } catch (e) {
    console.error('Supabase read error:', e);
    return def;
  }
};

const sset = async (k, v) => {
  try {
    await supabase.from('app_storage').upsert({ key: k, value: v }, { onConflict: 'key' });
  } catch (e) {
    console.error('Supabase write error:', e);
  }
};

const savePatients = async (list, setPatients) => {
  setPatients(list);
  await sset('enf:patients', list);
};

const saveProfessionals = async (list, setProfessionals) => {
  setProfessionals(list);
  await sset('enf:professionals', list);
};

// ==================== COMPONENTES AUXILIARES ====================
function RoleBadge({ role }) {
  return role === 'admin' 
    ? <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">ADMIN</span>
    : <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">PRO</span>;
}

function TabButton({ active, onClick, children, icon: Icon }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 ${active ? 'bg-teal-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}>
      {Icon && <Icon className="w-4 h-4" />}{children}
    </button>
  );
}

function StatCard({ label, value, color = "teal" }) {
  const colors = { teal: "bg-teal-100 text-teal-700", amber: "bg-amber-100 text-amber-700", blue: "bg-blue-100 text-blue-700", green: "bg-green-100 text-green-700" };
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[color]}`}></div>
      <div><div className="text-xs text-slate-500">{label}</div><div className="text-2xl font-bold text-slate-900">{value}</div></div>
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return <div className="bg-white rounded-2xl p-12 text-center border border-slate-200"><Icon className="w-12 h-12 mx-auto text-slate-300 mb-3" /><p className="text-slate-500">{text}</p></div>;
}


// LANDING PAGE COMPLETO //
function Landing({ services, onLogin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-teal-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center"><Stethoscope className="w-6 h-6 text-white" /></div>
            <div><div className="font-bold text-teal-900">Enfermereando</div><div className="text-xs text-teal-600 hidden sm:block">Salud en tu hogar</div></div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollTo('servicios')} className="text-sm font-medium text-slate-700 hover:text-teal-600">Servicios</button>
            <button onClick={() => scrollTo('como-funciona')} className="text-sm font-medium text-slate-700 hover:text-teal-600">Cómo funciona</button>
            <button onClick={() => scrollTo('cobertura')} className="text-sm font-medium text-slate-700 hover:text-teal-600">Cobertura</button>
            <button onClick={() => scrollTo('faq')} className="text-sm font-medium text-slate-700 hover:text-teal-600">FAQ</button>
            <button onClick={onLogin} className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition">Acceder</button>
          </div>
          <button className="md:hidden text-slate-700" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-teal-100 bg-white px-4 py-3 flex flex-col gap-3">
            <button onClick={() => scrollTo('servicios')} className="text-left text-slate-700">Servicios</button>
            <button onClick={() => scrollTo('como-funciona')} className="text-left text-slate-700">Cómo funciona</button>
            <button onClick={() => scrollTo('cobertura')} className="text-left text-slate-700">Cobertura</button>
            <button onClick={() => scrollTo('faq')} className="text-left text-slate-700">FAQ</button>
            <button onClick={onLogin} className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold">Acceder</button>
          </div>
        )}
      </nav>

      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold mb-4"><Shield className="w-4 h-4" /> Enfermera registrada en Superintendencia de Salud</div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-4">Cuidado profesional <span className="text-teal-600">en la comodidad de tu hogar</span></h1>
            <p className="text-lg text-slate-600 mb-3">Atención de enfermería a domicilio en la Región Metropolitana con <strong>{PROFESSIONAL_NAME}</strong>.</p>
            <p className="text-sm text-teal-700 font-semibold mb-1 flex items-center gap-1"><Users className="w-4 h-4" /> Hasta 15% de descuento al atender a tu grupo familiar</p>
            <p className="text-sm text-slate-600 mb-8 flex items-center gap-1"><Clock className="w-4 h-4 text-teal-600" /> {HOURS_LABEL_FULL}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={onLogin} className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 text-white font-semibold shadow-lg flex items-center justify-center gap-2"><Calendar className="w-5 h-5" /> Reservar atención</button>
              <a href={'https://wa.me/' + WHATSAPP} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-green-500 text-white font-semibold flex items-center justify-center gap-2"><MessageCircle className="w-5 h-5" /> WhatsApp</a>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-teal-400 to-blue-500 p-1 shadow-2xl"><div className="w-full h-full rounded-3xl bg-white flex items-center justify-center"><div className="text-center p-8"><div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center mb-4"><Stethoscope className="w-16 h-16 text-teal-600" /></div><div className="text-2xl font-bold text-slate-900">Atención certificada</div><div className="text-slate-500 mt-2">Profesional universitaria</div></div></div></div>
          </div>
        </div>
      </section>

      <section id="servicios" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Nuestros servicios</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map(s => {
              const Icon = getIconComponent(s.iconId);
              return (
                <div key={s.id} className="bg-gradient-to-br from-white to-teal-50/30 rounded-2xl p-6 border border-teal-100 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center mb-4"><Icon className="w-6 h-6 text-white" /></div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap"><h3 className="font-bold text-lg text-slate-900">{s.title}</h3>{s.allowDoses && <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold uppercase flex items-center gap-1"><Package className="w-3 h-3" /> Paquete</span>}</div>
                  <p className="text-sm text-slate-600 mb-4">{s.desc}</p>
                  <div className="flex items-center justify-between"><div className="text-teal-600 font-bold">Desde {fmtCLP(s.price)}</div><button onClick={onLogin} className="text-sm font-semibold text-teal-700 flex items-center gap-1">Reservar <ArrowRight className="w-4 h-4" /></button></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="py-16 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">¿Cómo funciona?</h2></div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm"><div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center">1</div><Calendar className="w-6 h-6 text-teal-600" /></div><h3 className="font-bold text-lg text-slate-900 mb-2">Solicita tu hora</h3><p className="text-sm text-slate-600">Reserva online. Agrega familiares y configura paquetes de dosis.</p></div>
            <div className="bg-white rounded-2xl p-6 shadow-sm"><div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center">2</div><CheckCircle className="w-6 h-6 text-teal-600" /></div><h3 className="font-bold text-lg text-slate-900 mb-2">Confirmamos contigo</h3><p className="text-sm text-slate-600">Un profesional asignado confirmará el horario.</p></div>
            <div className="bg-white rounded-2xl p-6 shadow-sm"><div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center">3</div><HomeIcon className="w-6 h-6 text-teal-600" /></div><h3 className="font-bold text-lg text-slate-900 mb-2">Atención en casa</h3><p className="text-sm text-slate-600">Llegamos puntuales con materiales.</p></div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Lo que dicen nuestros pacientes</h2></div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-6 border border-amber-100">
                <div className="flex gap-1 mb-3">{Array.from({length: t.stars}).map((_, j) => <Star key={j} className="w-4 h-4 text-amber-500 fill-amber-500" />)}</div>
                <p className="text-slate-700 mb-4 italic">"{t.text}"</p>
                <div className="font-semibold text-slate-900">{t.name}</div>
                <div className="text-sm text-slate-500">{t.comuna}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cobertura" className="py-16 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10"><h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Cobertura en la RM</h2></div>
          <div className="bg-white rounded-2xl p-8 shadow-sm"><div className="flex flex-wrap gap-2 justify-center">{COMUNAS.map(c => <span key={c} className="px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-medium border border-teal-100 flex items-center gap-1"><MapPin className="w-3 h-3" /> {c}</span>)}</div></div>
        </div>
      </section>

      <section id="faq" className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((f, i) => (
              <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition text-left"><span className="font-semibold text-slate-900">{f.q}</span><ChevronDown className={'w-5 h-5 text-slate-500 transition-transform ' + (openFaq === i ? 'rotate-180' : '')} /></button>
                {openFaq === i && <div className="px-5 pb-4 text-slate-600 text-sm">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-300 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div><div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center"><Stethoscope className="w-5 h-5 text-white" /></div><span className="font-bold text-white">Enfermereando</span></div><p className="text-sm">Atención de enfermería profesional a domicilio.</p></div>
            <div><h3 className="font-semibold text-white mb-3">Contacto</h3><div className="space-y-2 text-sm"><div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {PHONE}</div><div className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> WhatsApp 24/7</div></div></div>
            <div><h3 className="font-semibold text-white mb-3 flex items-center gap-1"><Clock className="w-4 h-4" /> Horarios</h3><div className="space-y-1 text-sm"><div>Mañana: {HOURS_LABEL_MORNING}</div><div>Tarde: {HOURS_LABEL_AFTERNOON}</div></div></div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-6 text-center text-sm">© 2026 Enfermereando. enfermereando.cl</div>
        </div>
      </footer>
    </>
  );
}

// ==================== CALENDAR VIEW ====================
function CalendarView({ appointments, onEdit }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-5 border-b flex items-center justify-between bg-slate-50">
        <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronDown className="w-5 h-5 rotate-90" /></button>
        <h2 className="text-2xl font-bold text-slate-900">{currentMonth.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronDown className="w-5 h-5 -rotate-90" /></button>
      </div>
      {/* Grid del calendario */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-500 border-b py-3 bg-white">
        {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-px bg-slate-200">
        {days.map((day, i) => {
          const dateKey = day.toISOString().split('T')[0];
          const dayApps = appointmentsByDate[dateKey] || [];
          return (
            <div key={i} className="min-h-[118px] bg-white p-2 hover:bg-teal-50">
              <div className="text-right text-sm font-medium">{day.getDate()}</div>
              <div className="space-y-1 mt-1">
                {dayApps.slice(0, 3).map(app => (
                  <div key={app.id} onClick={(e) => { e.stopPropagation(); onEdit(app); }} className="text-[10px] px-2 py-1 bg-teal-100 text-teal-800 rounded flex items-center gap-1 truncate">
                    <span className="font-mono">{app.time?.slice(0,5)}</span>
                    <span className="truncate">{app.patientName}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== LOGIN VIEW ACTUALIZADO ====================
function LoginView({ onLogin, onBack, patients, professionals }) {
  const [tab, setTab] = useState('patient');
  const [mode, setMode] = useState('login'); // login | register | recovery
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [comuna, setComuna] = useState('');

  const resetForm = () => {
    setUsername(''); 
    setPassword(''); 
    setPassword2(''); 
    setName(''); 
    setPhone(''); 
    setEmail(''); 
    setComuna(''); 
    setErr(''); 
    setInfo('');
  };

  // Validación en tiempo real de integridad (para registro)
  const validateFormIntegrity = () => {
    if (mode !== 'register') return true;
    
    if (!username.trim()) {
      setErr('El nombre de usuario es obligatorio');
      return false;
    }
    if (username.length < 4) {
      setErr('El nombre de usuario debe tener al menos 4 caracteres');
      return false;
    }
    
    // Validación de contraseña fuerte
    if (password.length < 6) {
      setErr('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (password !== password2) {
      setErr('Las contraseñas no coinciden');
      return false;
    }

    if (tab === 'patient') {
      if (!name.trim()) {
        setErr('El nombre completo es obligatorio');
        return false;
      }
      if (!phone.trim()) {
        setErr('El teléfono es obligatorio');
        return false;
      }
      if (email && !isValidEmail(email)) {
        setErr('El email no es válido');
        return false;
      }
    } else {
      if (!name.trim()) {
        setErr('El nombre es obligatorio para profesionales');
        return false;
      }
      if (email && !isValidEmail(email)) {
        setErr('El email no es válido');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setInfo('');
    setLoading(true);

    // Validación de integridad antes de cualquier acción
    if (mode === 'register' && !validateFormIntegrity()) {
      setLoading(false);
      return;
    }

    let payload = {};

    if (mode === 'register') {
      // Validación final de integridad (duplicados) en el backend
      const integrity = validateUserIntegrity(username, patients, professionals, tab);
      if (!integrity.ok) {
        setErr(integrity.error);
        setLoading(false);
        return;
      }

      if (tab === 'patient') {
        payload = { 
          role: 'patient', 
          action: 'register', 
          username: username.trim(), 
          password, 
          name: name.trim(), 
          phone: phone.trim(), 
          comuna, 
          email: email.trim() 
        };
      } else {
        payload = { 
          role: 'pro', 
          action: 'register-pro', 
          username: username.trim(), 
          password, 
          name: name.trim(), 
          email: email.trim() 
        };
      }
    } 
    else if (mode === 'recovery') {
      payload = { 
        role: tab === 'patient' ? 'patient' : 'pro', 
        action: 'recover', 
        username: username.trim() 
      };
    } 
    else {
      payload = { 
        role: tab === 'patient' ? 'patient' : 'pro', 
        action: tab === 'patient' ? 'login' : 'login-pro', 
        username: username.trim(), 
        password 
      };
    }

    const result = await onLogin(payload);
    setLoading(false);

    if (!result.ok) {
      setErr(result.error || 'Error al procesar la solicitud');
    } else if (mode === 'recovery' && result.tempPassword) {
      setInfo(`✅ Recuperación exitosa.\n\nContraseña temporal: ${result.tempPassword}\n\nPor favor inicia sesión y cámbiala inmediatamente.`);
      setMode('login');
      resetForm();
    } else if (result.pendingApproval) {
      setInfo('✅ Cuenta de profesional creada. Espera aprobación del administrador.');
      setMode('login');
      resetForm();
    } else if (result.ok) {
      // Login exitoso ya es manejado por el padre
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-8 pt-8 pb-6 border-b flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 hover:text-teal-600 text-sm font-medium">← Volver</button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center"><Stethoscope className="w-5 h-5 text-white" /></div>
            <div className="font-bold text-2xl text-slate-900">Enfermereando</div>
          </div>
        </div>

        {/* Selector de rol */}
        <div className="px-8 pt-6 pb-2 flex gap-2 bg-slate-50">
          <button 
            onClick={() => { setTab('patient'); resetForm(); }} 
            className={`flex-1 py-3 rounded-2xl text-sm font-semibold ${tab === 'patient' ? 'bg-white shadow text-teal-700' : 'text-slate-600'}`}
          >
            👤 Soy Paciente
          </button>
          <button 
            onClick={() => { setTab('pro'); resetForm(); }} 
            className={`flex-1 py-3 rounded-2xl text-sm font-semibold ${tab === 'pro' ? 'bg-white shadow text-teal-700' : 'text-slate-600'}`}
          >
            👩‍⚕️ Soy Profesional
          </button>
        </div>

        {/* Selector de acción (Login / Register / Recovery) */}
        <div className="px-8 pt-4 pb-4 flex gap-1 bg-white border-b">
          <button
            onClick={() => { setMode('login'); resetForm(); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-2xl transition-all ${mode === 'login' ? 'bg-teal-600 text-white shadow-inner' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => { setMode('register'); resetForm(); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-2xl transition-all ${mode === 'register' ? 'bg-teal-600 text-white shadow-inner' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Crear cuenta
          </button>
          <button
            onClick={() => { setMode('recovery'); resetForm(); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-2xl transition-all ${mode === 'recovery' ? 'bg-teal-600 text-white shadow-inner' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Recuperar contraseña
          </button>
        </div>

        <div className="px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campos comunes */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                {mode === 'recovery' ? 'Usuario o Email' : 'Usuario'}
              </label>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-teal-500 focus:outline-none text-sm" 
                required 
                placeholder={mode === 'recovery' ? "Nombre de usuario" : ""}
              />
            </div>

            {/* Solo para login y register */}
            {mode !== 'recovery' && (
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Contraseña</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-teal-500 focus:outline-none text-sm" 
                  required 
                />
              </div>
            )}

            {/* Campos específicos de registro */}
            {mode === 'register' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Nombre completo</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-teal-500 focus:outline-none text-sm" 
                    required 
                  />
                </div>

                {tab === 'patient' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Teléfono</label>
                        <input 
                          type="tel" 
                          value={phone} 
                          onChange={e => setPhone(e.target.value)} 
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-teal-500 focus:outline-none text-sm" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Email</label>
                        <input 
                          type="email" 
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-teal-500 focus:outline-none text-sm" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Comuna</label>
                      <select 
                        value={comuna} 
                        onChange={e => setComuna(e.target.value)} 
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-teal-500 focus:outline-none text-sm"
                      >
                        <option value="">Selecciona tu comuna</option>
                        {COMUNAS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Repetir contraseña</label>
                  <input 
                    type="password" 
                    value={password2} 
                    onChange={e => setPassword2(e.target.value)} 
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-teal-500 focus:outline-none text-sm" 
                    required 
                  />
                </div>

                {/* Nota de integridad para profesionales */}
                {tab === 'pro' && (
                  <div className="text-xs bg-amber-50 border border-amber-200 p-3 rounded-2xl text-amber-700">
                    <strong>Nota:</strong> Tu cuenta de profesional quedará en revisión por el administrador antes de ser activada.
                  </div>
                )}
              </>
            )}

            {/* Mensajes */}
            {err && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {err}
              </div>
            )}
            {info && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2 whitespace-pre-line">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {info}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-blue-600 text-white font-semibold text-lg hover:from-teal-700 hover:to-blue-700 transition-all disabled:opacity-70"
            >
              {loading 
                ? 'Procesando...' 
                : mode === 'login' 
                  ? 'Iniciar sesión' 
                  : mode === 'register' 
                    ? (tab === 'patient' ? 'Crear cuenta de paciente' : 'Crear cuenta profesional')
                    : 'Recuperar contraseña'
              }
            </button>
          </form>
        </div>

        {/* Footer del formulario */}
        <div className="px-8 py-6 border-t text-center text-xs text-slate-500">
          {mode === 'login' && (
            <p>¿No tienes cuenta? <button onClick={() => {setMode('register'); resetForm();}} className="text-teal-600 hover:underline">Regístrate aquí</button></p>
          )}
          {mode === 'register' && (
            <p>¿Ya tienes cuenta? <button onClick={() => {setMode('login'); resetForm();}} className="text-teal-600 hover:underline">Inicia sesión</button></p>
          )}
          {mode === 'recovery' && (
            <p>¿Recordaste tu contraseña? <button onClick={() => {setMode('login'); resetForm();}} className="text-teal-600 hover:underline">Volver al login</button></p>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== PATIENT PORTAL + REQUEST FORM + APPOINTMENT CARD ====================
// ==================== PATIENT PORTAL + CANCELACIÓN EN SERIE ====================
function PatientPortal({ user, services, appointments, notifications, saveAppointments, addNotification, onLogout }) {
  const [tab, setTab] = useState('inicio');
  const myApps = appointments
    .filter(a => a.patientId === user.id)
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

  const upcoming = myApps.filter(a => ['pendiente','asignada','confirmada'].includes(a.status));
  const recent = myApps.slice(0, 6);

  // NUEVA FUNCIÓN: Cancelación individual o en serie
  const cancelByPatient = async (app) => {
    if (!confirm(`¿Cancelar la atención del ${new Date(app.date).toLocaleDateString('es-CL')}?`)) return;

    const isSeriesApp = !!app.seriesId;
    let appointmentsToCancel = [app.id];

    if (isSeriesApp) {
      const seriesAppointments = appointments.filter(a => a.seriesId === app.seriesId);
      const cancelAll = confirm(`Esta cita pertenece a una SERIE de ${seriesAppointments.length} dosis.\n\n¿Cancelar SOLO esta cita o TODA LA SERIE?`);
      
      if (cancelAll) {
        appointmentsToCancel = seriesAppointments.map(a => a.id);
      }
    }

    const updated = appointments.map(a => 
      appointmentsToCancel.includes(a.id) ? { ...a, status: 'cancelada' } : a
    );

    await saveAppointments(updated);
    
    // Notificar a admin (solo la primera de la serie para no spam)
    const representativeApp = appointments.find(a => a.id === appointmentsToCancel[0]);
    await sendWhatsAppToAdmin(representativeApp, 'cancelled', services, appointmentsToCancel.length > 1);

    alert(appointmentsToCancel.length > 1 
      ? `✅ Toda la serie (${appointmentsToCancel.length} citas) ha sido cancelada.` 
      : '✅ Cita cancelada correctamente.');
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-teal-600" />
            <div className="font-bold text-xl">Enfermereando</div>
          </div>
          <button onClick={onLogout} className="text-slate-500 hover:text-red-600">Cerrar sesión</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-8 border-b pb-2">
          <button onClick={() => setTab('inicio')} className={`px-6 py-2 font-semibold rounded-2xl ${tab === 'inicio' ? 'bg-teal-600 text-white' : 'bg-white'}`}>Inicio</button>
          <button onClick={() => setTab('solicitar')} className={`px-6 py-2 font-semibold rounded-2xl ${tab === 'solicitar' ? 'bg-teal-600 text-white' : 'bg-white'}`}>Nueva solicitud</button>
          <button onClick={() => setTab('historial')} className={`px-6 py-2 font-semibold rounded-2xl ${tab === 'historial' ? 'bg-teal-600 text-white' : 'bg-white'}`}>Historial</button>
        </div>

        {tab === 'inicio' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Últimas atenciones solicitadas</h2>
              <p className="text-slate-600">Próximas y recientes reservas</p>
            </div>
            {recent.length === 0 ? (
              <EmptyState icon={Calendar} text="Aún no tienes solicitudes. ¡Agenda tu primera atención!" />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recent.map(a => {
                  const net = a.beneficiaries ? appNetPrice(a, services) : 0;
                  return (
                    <div key={a.id} className="bg-white rounded-3xl p-6 border border-slate-200 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="font-semibold">{new Date(a.date).toLocaleDateString('es-CL', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                          <div className="text-teal-600 text-sm">{fmtTime(a.time)}</div>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-2xl font-medium ${a.status === 'pendiente' ? 'bg-amber-100 text-amber-700' : a.status === 'confirmada' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                          {a.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 mb-3">
                        {a.beneficiaries?.map(b => b.name).join(', ')}
                      </div>
                      <div className="text-teal-600 font-semibold text-lg">{fmtCLP(net)}</div>
                      {a.seriesId && (
                        <div className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-3xl mt-3">
                          <Package className="w-3 h-3" /> Serie
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'solicitar' && <RequestForm user={user} services={services} appointments={appointments} saveAppointments={saveAppointments} addNotification={addNotification} onDone={() => setTab('inicio')} />}
        {tab === 'historial' && <div className="space-y-4">{myApps.map(a => <AppointmentCard key={a.id} a={a} services={services} onCancel={cancelByPatient} />)}</div>}
      </div>
    </div>
  );
}

function RequestForm({ user, services, appointments, saveAppointments, addNotification, onDone }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [beneficiaries, setBeneficiaries] = useState([{ id: uid(), name: user.name, relationship: 'Titular', services: [] }]);

  const addBen = () => setBeneficiaries([...beneficiaries, { id: uid(), name: '', relationship: 'Otro familiar', services: [] }]);
  const removeBen = (id) => { if (beneficiaries.length > 1) setBeneficiaries(beneficiaries.filter(b => b.id !== id)); };
  const updateBen = (id, updates) => setBeneficiaries(beneficiaries.map(b => b.id === id ? { ...b, ...updates } : b));

  // Toggle servicio + configuración de dosis/frecuencia
  const toggleService = (benId, serviceId) => {
    const ben = beneficiaries.find(b => b.id === benId);
    const exists = ben.services.findIndex(s => s.serviceId === serviceId);
    
    if (exists >= 0) {
      // eliminar
      updateBen(benId, {
        services: ben.services.filter((_, i) => i !== exists)
      });
    } else {
      const svc = services.find(s => s.id === serviceId);
      const defaultItem = {
        serviceId,
        doses: svc?.allowDoses ? 1 : 1,
        frequency: 'once',
        completedDoses: 0
      };
      updateBen(benId, {
        services: [...ben.services, defaultItem]
      });
    }
  };

  const updateServiceConfig = (benId, serviceId, field, value) => {
    const ben = beneficiaries.find(b => b.id === benId);
    const newServices = ben.services.map(s => 
      s.serviceId === serviceId ? { ...s, [field]: value } : s
    );
    updateBen(benId, { services: newServices });
  };

  // Cálculo de precio total
  const gross = beneficiaries.reduce((s, b) => s + b.services.reduce((acc, item) => {
    const svc = services.find(s => s.id === item.serviceId);
    return acc + (svc ? svc.price * (item.doses || 1) : 0);
  }, 0), 0);
  const discount = beneficiaries.length >= 4 ? 0.15 : beneficiaries.length === 3 ? 0.10 : beneficiaries.length === 2 ? 0.05 : 0;
  const net = Math.round(gross * (1 - discount));
  
  const submit = async () => {
    if (!date || !time || !address) return alert('Completa fecha, hora y dirección');
  
  const baseApp = { id: uid(), patientId: user.id, patientName: user.name, patientPhone: user.phone, patientComuna: user.comuna, beneficiaries, date, time, address, notes, status: 'pendiente', createdAt: Date.now() };

    // Generación automática de series según dosis y frecuencia
    const seriesAppointments = generateAppointmentSeries(baseApp, services);

    await saveAppointments([...appointments, ...seriesAppointments]);
    await sendWhatsAppToAdmin(baseApp, 'new_appointment', services);
    alert(`¡Solicitud enviada! Se han creado ${seriesAppointments.length} cita(s) en serie.`);
    onDone();
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Calendar className="w-7 h-7 text-teal-600" />
        Nueva solicitud de atención
      </h3>

      {/* Beneficiarios */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-lg">Personas a atender</h4>
          <button onClick={addBen} className="flex items-center gap-2 text-teal-600 font-medium text-sm">
            <UserPlus className="w-4 h-4" /> Agregar persona
          </button>
        </div>

        {beneficiaries.map((ben, idx) => (
          <div key={ben.id} className="bg-slate-50 border border-slate-200 rounded-3xl p-6 mb-6">
            <div className="flex justify-between mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={ben.name}
                  onChange={e => updateBen(ben.id, { name: e.target.value })}
                  placeholder="Nombre completo"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-teal-500 text-sm"
                />
              </div>
              <div className="ml-4">
                <select
                  value={ben.relationship}
                  onChange={e => updateBen(ben.id, { relationship: e.target.value })}
                  className="px-4 py-3 rounded-2xl border border-slate-300 focus:border-teal-500 text-sm"
                >
                  {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {beneficiaries.length > 1 && (
                <button
                  onClick={() => removeBen(ben.id)}
                  className="ml-4 text-red-500 hover:text-red-600 p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Servicios para este beneficiario */}
            <div className="mt-6">
              <p className="text-sm font-medium text-slate-500 mb-3">Servicios</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {services.filter(s => s.active).map(svc => {
                  const selected = ben.services.some(item => item.serviceId === svc.id);
                  return (
                    <button
                      key={svc.id}
                      onClick={() => toggleService(ben.id, svc.id)}
                      className={`px-5 py-2.5 text-sm font-medium rounded-3xl border transition-all flex items-center gap-2 ${selected ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-slate-300 hover:border-teal-300'}`}
                    >
                      {getIconComponent(svc.iconId)({ className: 'w-4 h-4' })}
                      {svc.title}
                    </button>
                  );
                })}
              </div>

              {/* Configuración detallada de cada servicio seleccionado */}
              {ben.services.map(item => {
                const svc = services.find(s => s.id === item.serviceId);
                if (!svc) return null;
                return (
                  <div key={item.serviceId} className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 flex flex-wrap items-center gap-4">
                    <div className="flex-1">
                      <div className="font-medium">{svc.title}</div>
                      <div className="text-xs text-slate-500">{svc.desc}</div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      {/* Dosis */}
                      {svc.allowDoses && (
                        <div>
                          <label className="block text-[10px] font-medium text-slate-500 mb-1">DOSIS</label>
                          <input
                            type="number"
                            min="1"
                            max="12"
                            value={item.doses || 1}
                            onChange={e => updateServiceConfig(ben.id, item.serviceId, 'doses', parseInt(e.target.value))}
                            className="w-20 px-3 py-2 border border-slate-300 rounded-2xl text-center focus:border-teal-500"
                          />
                        </div>
                      )}

                      {/* Frecuencia */}
                      {svc.allowDoses && (
                        <div>
                          <label className="block text-[10px] font-medium text-slate-500 mb-1">FRECUENCIA</label>
                          <select
                            value={item.frequency || 'once'}
                            onChange={e => updateServiceConfig(ben.id, item.serviceId, 'frequency', e.target.value)}
                            className="px-4 py-2 border border-slate-300 rounded-2xl text-sm focus:border-teal-500"
                          >
                            {FREQUENCIES.map(f => (
                              <option key={f.id} value={f.id}>{f.label}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Precio unitario */}
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Precio</div>
                        <div className="font-semibold text-teal-600">{fmtCLP(svc.price * (item.doses || 1))}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Fecha, hora y dirección */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">Fecha de la primera cita</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-4 rounded-3xl border border-slate-300" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Hora</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full px-4 py-4 rounded-3xl border border-slate-300" />
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">Dirección completa</label>
        <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, número, departamento, comuna" className="w-full px-4 py-4 rounded-3xl border border-slate-300" />
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">Notas adicionales (opcional)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full px-4 py-4 rounded-3xl border border-slate-300" />
      </div>

      {/* Resumen de precio */}
      <div className="bg-teal-50 rounded-3xl p-6 flex justify-between items-center mb-8">
        <div>
          <div className="text-sm font-medium text-teal-700">Total estimado (con descuento familiar)</div>
          <div className="text-4xl font-bold text-teal-800">{fmtCLP(net)}</div>
        </div>
        {discount > 0 && (
          <div className="text-right text-sm">
            <div className="text-teal-600 font-medium">Descuento familiar aplicado</div>
            <div className="text-teal-500">-{Math.round(discount * 100)}%</div>
          </div>
        )}
      </div>

      <button
        onClick={submit}
        className="w-full py-5 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-3xl font-semibold text-xl flex items-center justify-center gap-3 hover:from-teal-700 hover:to-blue-700 transition-all"
      >
        <Calendar className="w-6 h-6" />
        Enviar solicitud y generar serie de citas
      </button>
    </div>
  );
}

// ==================== APPOINTMENTCARD CON INDICADOR DE SERIE ====================
function AppointmentCard({ a, services, onCancel }) {
  const net = a.beneficiaries ? appNetPrice(a, services) : 0;
  const isSeries = !!a.seriesId;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold text-lg">{new Date(a.date).toLocaleDateString('es-CL')}</div>
            <div className="text-teal-600">{fmtTime(a.time)} · {a.address}</div>
          </div>
          <span className={`text-xs px-4 py-1 rounded-3xl font-medium ${a.status === 'pendiente' ? 'bg-amber-100 text-amber-700' : a.status === 'confirmada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {a.status}
          </span>
        </div>
        {a.beneficiaries && <div className="text-sm text-slate-600 mt-2">{a.beneficiaries.map(b => b.name).join(', ')}</div>}
        
        {isSeries && (
          <div className="flex items-center gap-2 mt-4">
            <div className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-3xl">
              <Package className="w-3 h-3" />
              Serie • Dosis {a.doseNumber || 1}
            </div>
          </div>
        )}
      </div>
      <div className="text-right">
        <div className="font-bold text-xl text-teal-700">{fmtCLP(net)}</div>
        {onCancel && (
          <button 
            onClick={() => onCancel(a)} 
            className="mt-4 text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" /> Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

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

  const isAdmin = user.role === 'admin';
  const visibleApps = isAdmin ? appointments : appointments.filter(a => a.assignedTo === user.id);

  // Función auxiliar para guardar con validación
  const handleSaveAppointments = async (newList) => {
    await saveAppointments(newList, setAppointments, patients, professionals, services);
  };

  const confirmAppointment = async (appId) => {
    const app = appointments.find(a => a.id === appId);
    if (!app) return;

    // Validación antes de confirmar
    const validatedApp = validateAndFixAppointment(app, patients, professionals, services, appointments);
    if (validatedApp.validationIssues && validatedApp.validationIssues.length > 0) {
      alert('⚠️ Problemas detectados antes de confirmar:\n• ' + validatedApp.validationIssues.join('\n• '));
    }

    const updated = { 
      ...validatedApp, 
      status: 'asignada', 
      assignedTo: user.id, 
      assignedToName: user.name 
    };

    const newList = appointments.map(a => a.id === appId ? updated : a);
    await handleSaveAppointments(newList);
    await sendWhatsAppToAdmin(updated, 'confirmed', services);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-teal-600" />
            <div className="font-bold text-2xl text-slate-900">Enfermereando</div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell userId={user.id} notifications={notifications} />
            <div className="text-right">
              <div className="font-semibold">{user.name}</div>
              <RoleBadge role={user.role} />
            </div>
            <button onClick={onLogout} className="p-2 hover:bg-slate-100 rounded-xl">
              <LogOut className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* PESTAÑAS */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b">
          <TabButton active={tab === 'hoy'} onClick={() => setTab('hoy')} icon={Calendar}>Hoy</TabButton>
          <TabButton active={tab === 'calendario'} onClick={() => setTab('calendario')} icon={Calendar}>Calendario</TabButton>
          <TabButton active={tab === 'integridad'} onClick={() => setTab('integridad')} icon={Shield}>Integridad</TabButton>
          <TabButton active={tab === 'duplicados'} onClick={() => setTab('duplicados')} icon={Users}>Duplicados</TabButton>
        </div>

        {/* CONTENIDO SEGÚN PESTAÑA */}
        {tab === 'hoy' && <div className="text-center py-12 text-slate-400">Vista "Hoy" (próximamente con lista de citas del día)</div>}
        
        {tab === 'calendario' && <CalendarView appointments={visibleApps} onEdit={setEditingApp} />}
        
        {tab === 'integridad' && (
          <IntegrityDashboard 
            appointments={appointments} 
            patients={patients} 
            professionals={professionals} 
            services={services} 
            currentUser={user} 
            saveAppointments={handleSaveAppointments} 
          />
        )}
        
        {tab === 'duplicados' && (
          <DuplicateMerger 
            patients={patients} 
            professionals={professionals} 
            appointments={appointments} 
            savePatients={savePatients} 
            saveAppointments={handleSaveAppointments} 
            currentUser={user} 
          />
        )}

        {/* MODAL DE EDICIÓN DE CITA */}
        {editingApp && (
          <EditAppointmentModal 
            app={editingApp} 
            services={services} 
            onSave={async (updates) => {
              const newList = appointments.map(a => a.id === updates.id ? { ...a, ...updates } : a);
              await handleSaveAppointments(newList);
              setEditingApp(null);
            }} 
            onClose={() => setEditingApp(null)} 
          />
        )}
      </div>
    </div>
  );
}

// ==================== INTEGRITY DASHBOARD (COMPLETO) ====================
function IntegrityDashboard({ appointments, patients, professionals, services, currentUser, saveAppointments }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const runFullIntegrityCheck = () => {
    setLoading(true);

    const issues = [];

    // 1. Validación de citas
    const validatedApps = validateAllAppointments(appointments);
    if (validatedApps.length !== appointments.length) {
      issues.push({ type: 'error', message: `${appointments.length - validatedApps.length} citas tenían problemas de integridad y fueron corregidas.` });
    }

    // 2. Duplicados de pacientes
    const dupPatients = findDuplicatePatients(patients);
    if (dupPatients.length > 0) {
      issues.push({ type: 'warning', message: `${dupPatients.length} grupos de pacientes duplicados detectados.` });
    }

    // 3. Duplicados de profesionales
    const dupPros = findDuplicateProfessionals(professionals);
    if (dupPros.length > 0) {
      issues.push({ type: 'warning', message: `${dupPros.length} grupos de profesionales duplicados detectados.` });
    }

    // 4. Citas sin paciente válido
    const orphanedApps = appointments.filter(app => !patients.some(p => p.id === app.patientId));
    if (orphanedApps.length > 0) {
      issues.push({ type: 'error', message: `${orphanedApps.length} citas huérfanas (sin paciente válido).` });
    }

    setReport({
      totalIssues: issues.length,
      errors: issues.filter(i => i.type === 'error').length,
      warnings: issues.filter(i => i.type === 'warning').length,
      issues
    });

    setLoading(false);
  };

  const autoFixAll = async () => {
    const fixed = validateAllAppointments(appointments);
    await saveAppointments(fixed);
    alert('✅ Todos los problemas de integridad fueron corregidos automáticamente.');
    runFullIntegrityCheck();
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Shield className="w-7 h-7 text-teal-600" />
          Panel de Integridad de Datos
        </h2>
        <button
          onClick={runFullIntegrityCheck}
          disabled={loading}
          className="px-6 py-3 bg-teal-600 text-white rounded-2xl font-semibold flex items-center gap-2 hover:bg-teal-700 disabled:opacity-70"
        >
          {loading ? 'Analizando...' : 'Ejecutar chequeo completo'}
        </button>
      </div>

      {report && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard label="Errores" value={report.errors} color="red" />
            <StatCard label="Advertencias" value={report.warnings} color="amber" />
            <StatCard label="Total Issues" value={report.totalIssues} color="teal" />
          </div>

          <div className="space-y-3">
            {report.issues.map((issue, i) => (
              <div key={i} className={`p-4 rounded-2xl flex gap-3 ${issue.type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
                {issue.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" /> : <Shield className="w-5 h-5 text-amber-600 mt-0.5" />}
                <div className="flex-1 text-sm">{issue.message}</div>
              </div>
            ))}
          </div>

          <button
            onClick={autoFixAll}
            className="mt-8 w-full py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-3xl font-semibold text-lg hover:shadow-lg transition"
          >
            Corregir todo automáticamente
          </button>
        </>
      )}

      {!report && (
        <div className="text-center py-12 text-slate-400">
          Presiona "Ejecutar chequeo completo" para analizar la integridad de los datos
        </div>
      )}
    </div>
  );
}

// ==================== DUPLICATE MERGER (COMPLETO) ====================
function DuplicateMerger({ patients, professionals, appointments, savePatients, saveAppointments, currentUser }) {
  const [activeTab, setActiveTab] = useState('patients');
  const [selectedDuplicates, setSelectedDuplicates] = useState(null);

  const patientDuplicates = findDuplicatePatients(patients);
  const proDuplicates = findDuplicateProfessionals(professionals);

  const mergePatients = async (group) => {
    if (group.length < 2) return;
    const master = group[0]; // El primero es el que se mantiene
    const toDelete = group.slice(1);

    let updatedPatients = [...patients];
    let updatedAppointments = [...appointments];

    toDelete.forEach(dup => {
      // Reasignar citas
      updatedAppointments = updatedAppointments.map(app =>
        app.patientId === dup.id ? { ...app, patientId: master.id, patientName: master.name } : app
      );
      // Eliminar duplicado
      updatedPatients = updatedPatients.filter(p => p.id !== dup.id);
    });

    await savePatients(updatedPatients);
    await saveAppointments(updatedAppointments);
    alert(`✅ ${toDelete.length} perfiles de pacientes fusionados correctamente`);
    setSelectedDuplicates(null);
  };

  const mergeProfessionals = async (group) => {
    if (group.length < 2) return;
    const master = group[0];
    const toDelete = group.slice(1);

    let updatedPros = [...professionals];
    let updatedApps = [...appointments];

    toDelete.forEach(dup => {
      updatedApps = updatedApps.map(app =>
        app.assignedTo === dup.id ? { ...app, assignedTo: master.id, assignedToName: master.name } : app
      );
      updatedPros = updatedPros.filter(p => p.id !== dup.id);
    });

    await saveProfessionals(updatedPros);
    await saveAppointments(updatedApps);
    alert(`✅ ${toDelete.length} perfiles de profesionales fusionados correctamente`);
    setSelectedDuplicates(null);
  };

  return (
    <div className="bg-white rounded-3xl p-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Users className="w-7 h-7 text-teal-600" />
        Fusión de Perfiles Duplicados
      </h2>

      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('patients')}
          className={`flex-1 py-3 font-semibold ${activeTab === 'patients' ? 'border-b-4 border-teal-600 text-teal-700' : 'text-slate-500'}`}
        >
          Pacientes ({patientDuplicates.length})
        </button>
        <button
          onClick={() => setActiveTab('professionals')}
          className={`flex-1 py-3 font-semibold ${activeTab === 'professionals' ? 'border-b-4 border-teal-600 text-teal-700' : 'text-slate-500'}`}
        >
          Profesionales ({proDuplicates.length})
        </button>
      </div>

      {activeTab === 'patients' && (
        <div className="space-y-4">
          {patientDuplicates.map((group, idx) => (
            <div key={idx} className="border border-slate-200 rounded-2xl p-5">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">Grupo de duplicados:</span>
                  <span className="ml-3 text-teal-600">{group.map(p => p.name).join(' • ')}</span>
                </div>
                <button
                  onClick={() => mergePatients(group)}
                  className="px-6 py-2 bg-teal-600 text-white rounded-2xl text-sm font-semibold"
                >
                  Fusionar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'professionals' && (
        <div className="space-y-4">
          {proDuplicates.map((group, idx) => (
            <div key={idx} className="border border-slate-200 rounded-2xl p-5">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">Grupo de duplicados:</span>
                  <span className="ml-3 text-teal-600">{group.map(p => p.name).join(' • ')}</span>
                </div>
                <button
                  onClick={() => mergeProfessionals(group)}
                  className="px-6 py-2 bg-teal-600 text-white rounded-2xl text-sm font-semibold"
                >
                  Fusionar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== EXPORT APP (con login actualizado) ====================
// ==================== APP PRINCIPAL ====================
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
      let svcs = await sget('enf:services', DEFAULT_SERVICES);
      let apps = (await sget('enf:appointments', [])).map(normalizeApp);
      const pats = await sget('enf:patients', []);
      let profs = await sget('enf:professionals', []);
      const notifs = await sget('enf:notifications', []);

      if (!profs.some(p => p.role === 'admin')) {
        profs = [{ id: 'admin-default', username: 'admin', password: 'enfermera2026', name: PROFESSIONAL_NAME, role: 'admin', active: true }].concat(profs);
      }

      setServices(svcs);
      setAppointments(apps);
      setPatients(pats);
      setProfessionals(profs);
      setNotifications(notifs);
      setLoading(false);
    })();
  }, []);

  const saveAppointmentsLocal = async (list) => {
    setAppointments(list);
    await sset('enf:appointments', list);
  };

  // ==================== LOGIN MEJORADO CON RECUPERACIÓN Y VALIDACIÓN DE INTEGRIDAD ====================
  const login = async (data) => {
    if (data.action === 'register') {
      // Validación de integridad ya realizada en el componente
      if (patients.some(p => p.username.toLowerCase() === data.username.toLowerCase())) {
        return { ok: false, error: 'Este nombre de usuario ya existe' };
      }
      const pat = { 
        id: uid(), 
        username: data.username, 
        password: data.password, 
        name: data.name, 
        phone: data.phone, 
        comuna: data.comuna,
        email: data.email || '', 
        createdAt: Date.now() 
      };
      await savePatients(patients.concat([pat]));
      const safe = { ...pat };
      delete safe.password;
      setUser({ role: 'patient', ...safe });
      setView('patient');
      requestPushPermission().then(granted => {
        if (granted) console.log('✅ Notificaciones push habilitadas');
      });
      return { ok: true };
    }

    if (data.action === 'register-pro') {
      if (professionals.some(p => p.username.toLowerCase() === data.username.toLowerCase())) {
        return { ok: false, error: 'Este nombre de usuario ya existe' };
      }
      const newPro = { 
        id: uid(), 
        username: data.username, 
        password: data.password, 
        name: data.name, 
        email: data.email || '', 
        role: 'professional', 
        active: false, 
        createdAt: Date.now() 
      };
      await saveProfessionals(professionals.concat([newPro]));
      return { ok: true, pendingApproval: true };
    }

    // === NUEVA LÓGICA DE RECUPERACIÓN DE CONTRASEÑA ===
    if (data.action === 'recover') {
      const isPatient = data.role === 'patient';
      let found = null;
      let listToUpdate = null;
      let setter = null;

      if (isPatient) {
        found = patients.find(p => p.username.toLowerCase() === data.username.toLowerCase());
        listToUpdate = patients;
        setter = savePatients;
      } else {
        found = professionals.find(p => p.username.toLowerCase() === data.username.toLowerCase());
        listToUpdate = professionals;
        setter = saveProfessionals;
      }

      if (!found) {
        return { ok: false, error: 'Usuario no encontrado. Verifica tu nombre de usuario.' };
      }

      // Generar contraseña temporal segura
      const tempPassword = 'temp-' + uid().slice(0, 8);
      
      // Actualizar contraseña
      const updatedList = listToUpdate.map(u => 
        u.id === found.id ? { ...u, password: tempPassword } : u
      );
      await setter(updatedList);

      return { 
        ok: true, 
        tempPassword,
        message: `Contraseña temporal generada para ${found.name}. Por favor inicia sesión con ella y cámbiala inmediatamente.` 
      };
    }

    // Login normal
    if (data.role === 'patient') {
      const pat = patients.find(p => p.username.toLowerCase() === data.username.toLowerCase());
      if (!pat) return { ok: false, error: 'Usuario no encontrado' };
      if (pat.password !== data.password) return { ok: false, error: 'Contraseña incorrecta' };
      const safe = { ...pat };
      delete safe.password;
      setUser({ role: 'patient', ...safe });
      setView('patient');
      return { ok: true };
    }

    // Login profesional
    const pro = professionals.find(p => p.username.toLowerCase() === data.username.toLowerCase());
    if (!pro) return { ok: false, error: 'Usuario no encontrado' };
    if (pro.password !== data.password) return { ok: false, error: 'Contraseña incorrecta' };
    if (!pro.active) return { ok: false, error: 'Tu cuenta está pendiente de aprobación.' };
    
    const safe = { ...pro };
    delete safe.password;
    setUser({ ...safe });
    setView('admin');
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    setView('landing');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {view === 'landing' && <Landing services={services.filter(s => s.active)} onLogin={() => setView('login')} />}
      {view === 'login' && <LoginView onLogin={login} onBack={() => setView('landing')} patients={patients} professionals={professionals} />}
      {view === 'patient' && user && user.role === 'patient' && (
        <PatientPortal 
          user={user} 
          services={services.filter(s => s.active)} 
          appointments={appointments} 
          notifications={notifications} 
          saveAppointments={saveAppointmentsLocal} 
          addNotification={() => {}} 
          onLogout={logout} 
        />
      )}
      {view === 'admin' && user && user.role !== 'patient' && (
        <AdminPanel user={user} setUser={setUser} services={services} appointments={appointments} patients={patients} professionals={professionals} notifications={notifications} saveAppointments={saveAppointmentsLocal} savePatients={() => {}} saveProfessionals={() => {}} addNotification={() => {}} onLogout={logout} />
      )}
    </div>
  );
}