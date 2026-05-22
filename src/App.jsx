import { supabase } from './supabase'
import { useState, useEffect } from 'react';
import {
  Pill, Activity, Syringe, Home as HomeIcon, Cross, Heart, BookOpen,
  Phone, MapPin, CheckCircle, Star, Shield, Calendar, User, UserPlus,
  LogOut, Plus, MessageCircle, Menu, X, FileText, Users, Trash2,
  Edit, Stethoscope, Award, Search, ArrowRight, Check, AlertCircle,
  ChevronDown, Tag, UserCog, Clock, Package, Bell, Route
} from 'lucide-react';

const WHATSAPP = '56920489639';           // Número de Mariela
const PHONE = '+56 9 2048 9639';
const PROFESSIONAL_NAME = 'Mariela Droguett';

const HOURS_LABEL_MORNING = '9:00 AM - 12:00 PM';
const HOURS_LABEL_AFTERNOON = '2:00 PM - 6:00 PM';
const HOURS_LABEL_FULL = 'Mañana: ' + HOURS_LABEL_MORNING + ' · Tarde: ' + HOURS_LABEL_AFTERNOON;

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

// ==================== UTILIDADES (definidas UNA sola vez) ====================
const fmtCLP = (n) => '$' + Math.round(n).toLocaleString('es-CL');

const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

const appNetPrice = (a, services) => {
  const gross = a.beneficiaries.reduce((sum, b) => sum + b.services.reduce((s, item) => {
    const svc = services.find(s => s.id === item.serviceId);
    return s + (svc ? svc.price * (item.doses || 1) : 0);
  }, 0), 0);
  const discount = a.beneficiaries.length >= 4 ? 0.15 : a.beneficiaries.length === 3 ? 0.10 : a.beneficiaries.length === 2 ? 0.05 : 0;
  return Math.round(gross * (1 - discount));
};

/* === INTEGRACIÓN CALLMEBOT WHATSAPP === */
const sendWhatsAppToAdmin = async (app, action = 'new', services = [], isSeriesCancel = false) => {
  try {
    let msg = `🔔 *Enfermereando - ${PROFESSIONAL_NAME}*\n\n`;

    if (action === 'new') {
      msg += `📌 *NUEVA SOLICITUD DE ATENCIÓN*\n`;
    } else if (action === 'cancelled') {
      msg += isSeriesCancel 
        ? `❌ *SERIE COMPLETA CANCELADA*\n` 
        : `❌ *ATENCIÓN CANCELADA*\n`;
    } else if (action === 'status_change') {
      msg += `🔄 *Cambio de estado*\n`;
    }

    msg += `Paciente: ${app.patientName}\n`;
    msg += `Fecha: ${new Date(app.date).toLocaleDateString('es-CL')}\n`;
    msg += `Hora: ${fmtTime(app.time)}\n`;
    msg += `Comuna: ${app.comuna || 'No especificada'}\n`;

    if (app.beneficiaries && app.beneficiaries.length > 0) {
      msg += `Beneficiarios: ${app.beneficiaries.length}\n`;
    }

    const url = `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP}&text=${encodeURIComponent(msg)}`;
    const res = await fetch(url, { method: 'GET' });
    
    if (res.ok) {
      console.log('✅ WhatsApp enviado vía CallMeBot');
    } else {
      console.warn('⚠️ CallMeBot respondió con error');
    }
  } catch (error) {
    console.error('❌ Error enviando WhatsApp:', error);
  }
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
  let fixed = { ...app };
  let fixedIssues = [];

  // Normalización previa
  fixed = normalizeApp(fixed);

  // === INTEGRIDAD REFERENCIAL ===
  if (!fixed.patientId || !patients.some(p => p.id === fixed.patientId)) {
    const possiblePatient = patients.find(p => p.name === fixed.patientName);
    if (possiblePatient) {
      fixed.patientId = possiblePatient.id;
      fixedIssues.push('Paciente reasignado automáticamente');
    } else {
      fixedIssues.push('Cita huérfana (paciente inexistente)');
    }
  }

  if (fixed.assignedTo && !professionals.some(p => p.id === fixed.assignedTo)) {
    fixed.assignedTo = null;
    fixed.assignedToName = null;
    fixedIssues.push('Profesional inexistente → asignación removida');
  }

  // Servicios
  fixed.beneficiaries = fixed.beneficiaries.map(b => ({
    ...b,
    services: b.services.filter(item => {
      const exists = services.some(s => s.id === item.serviceId);
      if (!exists) fixedIssues.push(`Servicio ${item.serviceId} inexistente → eliminado`);
      return exists;
    })
  })).filter(b => b.services.length > 0);

  fixed.validationIssues = fixedIssues;
  return fixed;
};

const validateAllAppointments = (apps, patients, professionals, services) => {
  return apps.map(app => validateAndFixAppointment(app, patients, professionals, services));
};

const saveAppointments = async (list, setAppointments, patients, professionals, services) => {
  const { ok, issues } = validateDataIntegrity('appointments', list, patients, professionals, services, list);
  if (!ok) throw new Error('Validación fallida');

  const validated = validateAllAppointments(list, patients, professionals, services);
  setAppointments(validated);
  await sset('enf:appointments', validated);
  return validated;
};

// ==================== PERSISTENCIA ====================
const sget = async (k, def) => {
  try {
    const { data } = await supabase.from('app_storage').select('value').eq('key', k).single();
    return data ? data.value : def;
  } catch {
    return def;
  }
};

const sset = async (k, v) => {
  try {
    await supabase.from('app_storage').upsert({ key: k, value: v });
  } catch (e) {
    console.error(e);
  }
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
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
      <div className="p-5 border-b flex items-center justify-between bg-slate-50">
        <button onClick={() => navigateMonth(-1)} className="p-3 hover:bg-slate-100 rounded-xl">←</button>
        <h2 className="text-2xl font-bold text-slate-900">
          {currentMonth.toLocaleString('es-CL', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={() => navigateMonth(1)} className="p-3 hover:bg-slate-100 rounded-xl">→</button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-500 border-b py-3 bg-white">
        {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 p-px">
        {days.map((day, i) => {
          const dateKey = day.toISOString().split('T')[0];
          const dayApps = appointmentsByDate[dateKey] || [];
          return (
            <div key={i} className="min-h-[110px] bg-white p-2 hover:bg-teal-50">
              <div className="text-right text-sm font-medium">{day.getDate()}</div>
              <div className="mt-2 space-y-1">
                {dayApps.slice(0, 3).map(app => (
                  <div
                    key={app.id}
                    onClick={(e) => { e.stopPropagation(); onEdit(app); }}
                    className="text-[10px] px-2 py-1 bg-teal-100 text-teal-800 rounded flex items-center gap-1 cursor-pointer hover:bg-teal-200"
                  >
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

/* =============================================
   LOGIN VIEW - VERSIÓN MEJORADA CON EMAIL Y VERIFICACIÓN
   ============================================= */
   function LoginView({ onLogin, onBack, patients, professionals }) {
    const [tab, setTab] = useState('login'); // login | register | recovery
    const [role, setRole] = useState('patient'); // patient | professional
  
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [comuna, setComuna] = useState('');
  
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [loading, setLoading] = useState(false);
  
    // ==================== VALIDACIÓN SIMPLE DE EMAIL ====================
    const isValidEmail = (em) => {
      return em.includes('@') && em.includes('.');
    };
  
    // ==================== LOGIN ====================
    const handleLogin = async () => {
      setLoading(true);
      let foundUser = null;
  
      if (role === 'patient') {
        foundUser = patients.find(p => p.email === email && p.password === password);
      } else {
        foundUser = professionals.find(p => p.email === email && p.password === password);
      }
  
      if (foundUser) {
        if (role === 'professional' && foundUser.status === 'pending') {
          alert('⏳ Tu cuenta de profesional está pendiente de aprobación por el administrador.');
        } else {
          onLogin({ ...foundUser, role });
        }
      } else {
        alert('❌ Credenciales incorrectas. Verifica tu correo y contraseña.');
      }
      setLoading(false);
    };
  
    // ==================== REGISTRO CON EMAIL Y VERIFICACIÓN ====================
    const handleRegister = async () => {
      if (!name || !email || !password || !phone) {
        alert('❌ Todos los campos son obligatorios');
        return;
      }
  
      if (!isValidEmail(email)) {
        alert('❌ Ingresa un correo electrónico válido (debe contener @ y .)');
        return;
      }
  
      setLoading(true);
  
      const newUser = {
        id: uid(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,           // En producción debes hashear esto
        phone: phone.trim(),
        comuna: comuna || 'No especificada',
        role: role,
        status: role === 'professional' ? 'pending' : 'active',
        createdAt: new Date().toISOString()
      };
  
      let updatedList = [];
  
      if (role === 'patient') {
        updatedList = [...patients, newUser];
        await sset('enf:patients', updatedList);
      } else {
        updatedList = [...professionals, newUser];
        await sset('enf:professionals', updatedList);
      }
  
      // ==================== VERIFICACIÓN DE CREACIÓN ====================
      console.log('✅ Usuario creado correctamente:', newUser);
      alert(`✅ ¡Usuario creado exitosamente!\n\n` +
            `Nombre: ${newUser.name}\n` +
            `Correo: ${newUser.email}\n` +
            `Rol: ${role === 'patient' ? 'Paciente' : 'Profesional'}\n\n` +
            (role === 'professional' 
              ? 'Tu cuenta está pendiente de aprobación por el administrador.' 
              : 'Ya puedes iniciar sesión.'));
  
      // Limpiar formulario y volver a login
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setComuna('');
      setTab('login');
      setLoading(false);
    };
  
    // ==================== RECUPERACIÓN ====================
    const handleRecovery = async () => {
      if (!recoveryEmail || !isValidEmail(recoveryEmail)) {
        alert('❌ Ingresa un correo electrónico válido');
        return;
      }
  
      setLoading(true);
      const allUsers = [...patients, ...professionals];
      const user = allUsers.find(u => u.email === recoveryEmail.toLowerCase());
  
      if (user) {
        const tempPassword = 'Temp' + Math.floor(100000 + Math.random() * 900000);
        alert(`🔑 Contraseña temporal generada para ${recoveryEmail}:\n\n${tempPassword}\n\nGuárdala. En producción se enviaría por correo.`);
  
        // Actualizar contraseña
        if (patients.some(p => p.id === user.id)) {
          const updated = patients.map(p => p.id === user.id ? { ...p, password: tempPassword } : p);
          await sset('enf:patients', updated);
        } else {
          const updated = professionals.map(p => p.id === user.id ? { ...p, password: tempPassword } : p);
          await sset('enf:professionals', updated);
        }
      } else {
        alert('❌ No encontramos ninguna cuenta con ese correo electrónico.');
      }
  
      setLoading(false);
      setTab('login');
    };
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-9 h-9 text-teal-600" />
              <div className="font-bold text-3xl">Enfermereando</div>
            </div>
            <button onClick={onBack} className="text-slate-400 hover:text-slate-600 text-xl">←</button>
          </div>
  
          {/* Tabs */}
          <div className="flex border-b text-sm">
            <button onClick={() => setTab('login')} className={`flex-1 py-5 font-medium ${tab === 'login' ? 'border-b-4 border-teal-600 text-teal-600' : 'text-slate-500'}`}>Iniciar Sesión</button>
            <button onClick={() => setTab('register')} className={`flex-1 py-5 font-medium ${tab === 'register' ? 'border-b-4 border-teal-600 text-teal-600' : 'text-slate-500'}`}>Registrarse</button>
            <button onClick={() => setTab('recovery')} className={`flex-1 py-5 font-medium ${tab === 'recovery' ? 'border-b-4 border-teal-600 text-teal-600' : 'text-slate-500'}`}>Recuperar</button>
          </div>
  
          <div className="p-8 space-y-6">
            {tab === 'login' && (
              <>
                <div className="flex gap-2 bg-slate-100 rounded-2xl p-1">
                  <button onClick={() => setRole('patient')} className={`flex-1 py-3 rounded-xl ${role === 'patient' ? 'bg-white shadow' : ''}`}>Paciente</button>
                  <button onClick={() => setRole('professional')} className={`flex-1 py-3 rounded-xl ${role === 'professional' ? 'bg-white shadow' : ''}`}>Profesional</button>
                </div>
  
                <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-300 focus:border-teal-500" />
                <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-300 focus:border-teal-500" />
  
                <button onClick={handleLogin} disabled={loading} className="w-full py-5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-3xl text-lg disabled:opacity-70">
                  {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                </button>
              </>
            )}
  
            {tab === 'register' && (
              <div className="space-y-5">
                <div className="flex gap-2 bg-slate-100 rounded-2xl p-1">
                  <button onClick={() => setRole('patient')} className={`flex-1 py-3 rounded-xl ${role === 'patient' ? 'bg-white shadow' : ''}`}>Paciente</button>
                  <button onClick={() => setRole('professional')} className={`flex-1 py-3 rounded-xl ${role === 'professional' ? 'bg-white shadow' : ''}`}>Profesional</button>
                </div>
  
                <input type="text" placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-300 focus:border-teal-500" />
                <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-300 focus:border-teal-500" />
                <input type="tel" placeholder="Teléfono" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-300 focus:border-teal-500" />
                <select value={comuna} onChange={e => setComuna(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-300 focus:border-teal-500">
                  <option value="">Seleccionar comuna</option>
                  {COMUNAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-300 focus:border-teal-500" />
  
                <button onClick={handleRegister} disabled={loading} className="w-full py-5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-3xl text-lg">
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>
              </div>
            )}
  
            {tab === 'recovery' && (
              <div className="space-y-6">
                <p className="text-slate-600">Ingresa tu correo electrónico para recuperar la contraseña.</p>
                <input type="email" placeholder="Correo electrónico" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-300 focus:border-teal-500" />
                <button onClick={handleRecovery} disabled={loading} className="w-full py-5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-3xl text-lg">
                  {loading ? 'Enviando...' : 'Recuperar Contraseña'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

// ==================== PATIENT PORTAL + REQUEST FORM + APPOINTMENT CARD ====================

/* ====================== PATIENT PORTAL ===================================== */
function PatientPortal({ user, services, appointments, saveAppointments, onLogout }) {
  const [tab, setTab] = useState('inicio');
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Filtrar solo las atenciones del paciente actual
  const myAppointments = appointments.filter(app => 
    app.patientName === user.name || 
    (app.beneficiaries && app.beneficiaries.some(b => b.name === user.name))
  );

  // Próximas atenciones (Inicio)
  const upcoming = myAppointments
    .filter(a => a.status !== 'cancelada' && new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Historial
  const history = myAppointments
    .filter(a => a.status === 'cancelada' || new Date(a.date) < new Date())
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // ==================== CANCELACIÓN EN SERIE + WHATSAPP ====================
  const cancelAppointment = async (app) => {
    if (!confirm(`¿Cancelar la atención del ${new Date(app.date).toLocaleDateString('es-CL')}?`)) return;

    const isSeries = !!app.seriesId;
    let appointmentsToCancel = [app.id];

    if (isSeries) {
      const seriesApps = appointments.filter(a => a.seriesId === app.seriesId);
      const cancelAll = confirm(`Esta cita pertenece a una SERIE de ${seriesApps.length} dosis.\n\n¿Cancelar SOLO esta cita o TODA LA SERIE?`);
      if (cancelAll) appointmentsToCancel = seriesApps.map(a => a.id);
    }

    const updated = appointments.map(a => 
      appointmentsToCancel.includes(a.id) ? { ...a, status: 'cancelada' } : a
    );

    await saveAppointments(updated);

    const representative = appointments.find(a => a.id === appointmentsToCancel[0]);
    await sendWhatsAppToAdmin(representative, 'cancelled', services, appointmentsToCancel.length > 1);

    alert(appointmentsToCancel.length > 1 
      ? `✅ Toda la serie (${appointmentsToCancel.length} citas) ha sido cancelada.` 
      : '✅ Cita cancelada correctamente.'
    );
  };

  // ==================== NUEVA SOLICITUD ====================
  const handleNewAppointment = async (newAppointmentsArray) => {
    const updated = [...appointments, ...newAppointmentsArray];
    await saveAppointments(updated);
    setShowRequestForm(false);
    setTab('inicio');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-9 h-9 text-teal-600" />
            <div className="font-bold text-3xl tracking-tight">Enfermereando</div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="font-semibold text-lg">Hola, {user.name}</div>
              <div className="text-teal-600 text-sm">Paciente</div>
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-5 py-2.5 hover:bg-slate-100 rounded-2xl text-slate-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* TABS */}
        <div className="flex border-b mb-8">
          <button
            onClick={() => setTab('inicio')}
            className={`flex-1 md:flex-none px-8 py-4 text-lg font-medium border-b-4 transition-all ${tab === 'inicio' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500'}`}
          >
            Inicio
          </button>
          <button
            onClick={() => setShowRequestForm(true)}
            className={`flex-1 md:flex-none px-8 py-4 text-lg font-medium border-b-4 transition-all ${tab === 'solicitar' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500'}`}
          >
            Solicitar Atención
          </button>
          <button
            onClick={() => setTab('historial')}
            className={`flex-1 md:flex-none px-8 py-4 text-lg font-medium border-b-4 transition-all ${tab === 'historial' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500'}`}
          >
            Historial
          </button>
        </div>

        {/* PESTAÑA INICIO */}
        {tab === 'inicio' && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Próximas Atenciones</h2>
            {upcoming.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center text-slate-400 text-xl">
                No tienes atenciones próximas<br />
                <button 
                  onClick={() => setShowRequestForm(true)}
                  className="mt-6 px-8 py-4 bg-teal-600 text-white rounded-2xl font-medium"
                >
                  Solicitar nueva atención
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {upcoming.map(app => (
                  <div key={app.id} className="bg-white rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-200">
                    <div>
                      <div className="font-semibold text-xl">{app.patientName}</div>
                      <div className="text-slate-500 mt-1">
                        {new Date(app.date).toLocaleDateString('es-CL', { weekday: 'long', month: 'long', day: 'numeric' })} • {fmtTime(app.time)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-6 py-2 bg-teal-100 text-teal-700 rounded-2xl text-sm font-medium">Pendiente</span>
                      <button
                        onClick={() => cancelAppointment(app)}
                        className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Cancelar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA SOLICITAR */}
        {showRequestForm && (
          <RequestForm 
            services={services} 
            onSubmit={handleNewAppointment} 
            onCancel={() => setShowRequestForm(false)} 
          />
        )}

        {/* PESTAÑA HISTORIAL */}
        {tab === 'historial' && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Historial de Atenciones</h2>
            {history.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center text-slate-400">Aún no tienes historial</div>
            ) : (
              <div className="space-y-4">
                {history.map(app => (
                  <div key={app.id} className="bg-white rounded-3xl p-6 opacity-75">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">{app.patientName}</div>
                        <div className="text-sm text-slate-500">
                          {new Date(app.date).toLocaleDateString('es-CL')} • {fmtTime(app.time)}
                        </div>
                      </div>
                      <span className={`px-5 py-1 text-xs font-medium rounded-2xl ${app.status === 'cancelada' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {app.status === 'cancelada' ? 'Cancelada' : 'Completada'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ==================== REQUEST FORM ============================================= */
   function RequestForm({ services, onSubmit, onCancel }) {
    const [beneficiaries, setBeneficiaries] = useState([{
      id: uid(),
      name: '',
      services: [{ serviceId: '', doses: 1, frequency: 'once' }]
    }]);
  
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [comuna, setComuna] = useState('');
    const [notes, setNotes] = useState('');
  
    // ==================== MANEJADORES DE BENEFICIARIOS ====================
    const addBeneficiary = () => {
      setBeneficiaries([
        ...beneficiaries,
        {
          id: uid(),
          name: '',
          services: [{ serviceId: '', doses: 1, frequency: 'once' }]
        }
      ]);
    };
  
    const removeBeneficiary = (benId) => {
      if (beneficiaries.length > 1) {
        setBeneficiaries(beneficiaries.filter(b => b.id !== benId));
      }
    };
  
    const updateBeneficiaryName = (benId, value) => {
      setBeneficiaries(beneficiaries.map(b => 
        b.id === benId ? { ...b, name: value } : b
      ));
    };
  
    // ==================== MANEJADORES DE SERVICIOS POR BENEFICIARIO ====================
    const addServiceToBeneficiary = (benId) => {
      setBeneficiaries(beneficiaries.map(ben => {
        if (ben.id !== benId) return ben;
        return {
          ...ben,
          services: [...ben.services, { serviceId: '', doses: 1, frequency: 'once' }]
        };
      }));
    };
  
    const removeServiceFromBeneficiary = (benId, serviceIndex) => {
      setBeneficiaries(beneficiaries.map(ben => {
        if (ben.id !== benId) return ben;
        const newServices = ben.services.filter((_, i) => i !== serviceIndex);
        return {
          ...ben,
          services: newServices.length ? newServices : [{ serviceId: '', doses: 1, frequency: 'once' }]
        };
      }));
    };
  
    const updateServiceField = (benId, serviceIndex, field, value) => {
      setBeneficiaries(beneficiaries.map(ben => {
        if (ben.id !== benId) return ben;
        const newServices = [...ben.services];
        newServices[serviceIndex] = { ...newServices[serviceIndex], [field]: value };
        return { ...ben, services: newServices };
      }));
    };
  
    // ==================== GENERACIÓN DE SERIE (auto-reserva) ====================
    const generateAppointmentSeries = (baseApp, servicesList) => {
      const seriesId = uid();
      const allAppointments = [];
  
      beneficiaries.forEach((ben, benIndex) => {
        ben.services.forEach((svcItem) => {
          const service = servicesList.find(s => s.id === svcItem.serviceId);
          if (!service) return;
  
          const totalDoses = parseInt(svcItem.doses) || 1;
          const frequency = FREQUENCIES.find(f => f.id === svcItem.frequency);
          const daysStep = frequency ? frequency.days : 0;
  
          for (let i = 0; i < totalDoses; i++) {
            const newDate = new Date(baseApp.date);
            newDate.setDate(newDate.getDate() + i * daysStep);
  
            const seriesApp = {
              ...baseApp,
              id: uid(),
              date: newDate.toISOString().split('T')[0],
              seriesId: seriesId,
              doseNumber: i + 1,
              totalDoses: totalDoses,
              patientName: ben.name || baseApp.patientName,
              beneficiaries: [{
                id: ben.id,
                name: ben.name,
                services: [{
                  serviceId: svcItem.serviceId,
                  doses: totalDoses,
                  frequency: svcItem.frequency,
                  completedDoses: 0
                }]
              }]
            };
            allAppointments.push(seriesApp);
          }
        });
      });
  
      return allAppointments.length > 0 ? allAppointments : [baseApp];
    };
  
    // ==================== SUBMIT ====================
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (!date || !time || !comuna) {
        alert('❌ Por favor completa fecha, hora y comuna');
        return;
      }
  
      // Cita base
      const baseAppointment = {
        id: uid(),
        patientName: beneficiaries[0]?.name || 'Paciente',
        date,
        time,
        comuna,
        notes: notes || '',
        status: 'pendiente',
        assignedTo: null,
        beneficiaries: beneficiaries.map(b => ({
          id: b.id,
          name: b.name,
          services: b.services.map(s => ({
            serviceId: s.serviceId,
            doses: parseInt(s.doses) || 1,
            frequency: s.frequency,
            completedDoses: 0
          }))
        }))
      };
  
      // Generar serie si corresponde
      const finalAppointments = generateAppointmentSeries(baseAppointment, services);
  
      // Notificar por WhatsApp
      await sendWhatsAppToAdmin(baseAppointment, 'new', services);
  
      // Enviar al padre
      onSubmit(finalAppointments);
  
      alert(`✅ Solicitud enviada correctamente.\nSe generaron ${finalAppointments.length} cita(s) y se notificó por WhatsApp.`);
  
      // Limpiar formulario
      onCancel();
    };
  
    return (
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-slate-800">Nueva Solicitud de Atención</h2>
  
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Beneficiarios */}
          {beneficiaries.map((ben, benIndex) => (
            <div key={ben.id} className="border border-slate-200 rounded-3xl p-6 bg-slate-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Beneficiario {benIndex + 1}</h3>
                {beneficiaries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBeneficiary(ben.id)}
                    className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Eliminar
                  </button>
                )}
              </div>
  
              <input
                type="text"
                placeholder="Nombre completo del beneficiario"
                value={ben.name}
                onChange={(e) => updateBeneficiaryName(ben.id, e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-teal-500 mb-6"
                required
              />
  
              {/* Servicios del beneficiario */}
              {ben.services.map((svc, svcIndex) => (
                <div key={svcIndex} className="flex gap-4 items-end mb-4 bg-white p-4 rounded-2xl border">
                  {/* Selector de servicio */}
                  <div className="flex-1">
                    <label className="block text-xs text-slate-500 mb-1">Servicio</label>
                    <select
                      value={svc.serviceId}
                      onChange={(e) => updateServiceField(ben.id, svcIndex, 'serviceId', e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-teal-500"
                      required
                    >
                      <option value="">Seleccionar servicio...</option>
                      {services.filter(s => s.active).map(s => (
                        <option key={s.id} value={s.id}>
                          {s.title} - {fmtCLP(s.price)}
                        </option>
                      ))}
                    </select>
                  </div>
  
                  {/* Dosis */}
                  <div className="w-28">
                    <label className="block text-xs text-slate-500 mb-1">Dosis</label>
                    <input
                      type="number"
                      min="1"
                      value={svc.doses}
                      onChange={(e) => updateServiceField(ben.id, svcIndex, 'doses', e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-teal-500 text-center"
                    />
                  </div>
  
                  {/* Frecuencia */}
                  <div className="flex-1">
                    <label className="block text-xs text-slate-500 mb-1">Frecuencia</label>
                    <select
                      value={svc.frequency}
                      onChange={(e) => updateServiceField(ben.id, svcIndex, 'frequency', e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-teal-500"
                    >
                      {FREQUENCIES.map(f => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                      ))}
                    </select>
                  </div>
  
                  <button
                    type="button"
                    onClick={() => removeServiceFromBeneficiary(ben.id, svcIndex)}
                    className="text-red-500 hover:text-red-600 px-3 py-3"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
  
              <button
                type="button"
                onClick={() => addServiceToBeneficiary(ben.id)}
                className="text-teal-600 hover:text-teal-700 text-sm flex items-center gap-2 mt-2"
              >
                <Plus className="w-4 h-4" /> Agregar otro servicio
              </button>
            </div>
          ))}
  
          <button
            type="button"
            onClick={addBeneficiary}
            className="w-full py-4 border-2 border-dashed border-teal-300 text-teal-600 rounded-3xl hover:bg-teal-50 font-medium flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Agregar otro beneficiario
          </button>
  
          {/* Fecha, Hora y Comuna */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Hora</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Comuna</label>
              <select
                value={comuna}
                onChange={(e) => setComuna(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-teal-500"
                required
              >
                <option value="">Seleccionar comuna...</option>
                {COMUNAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
  
          {/* Notas */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Notas / Observaciones</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-teal-500"
              placeholder="Detalles adicionales sobre la atención..."
            />
          </div>
  
          {/* Botones */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-10 py-4 text-slate-600 hover:bg-slate-100 rounded-2xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-10 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-semibold transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Enviar Solicitud + Notificar por WhatsApp
            </button>
          </div>
        </form>
      </div>
    );
  }

/* ============================ APPOINTMENT CARD ====================================== */
   function AppointmentCard({ app, services, onEdit, onCancel, saveAppointments }) {
    const netPrice = appNetPrice(app, services);
  
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-md transition-all">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="font-semibold text-xl">{app.patientName}</div>
              {app.seriesId && (
                <span className="px-3 py-1 text-xs bg-amber-100 text-amber-700 rounded-2xl font-medium">
                  SERIE • Dosis {app.doseNumber || 1}
                </span>
              )}
            </div>
            <div className="text-slate-500 mt-1 flex items-center gap-4 text-sm">
              <span>{new Date(app.date).toLocaleDateString('es-CL', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              <span className="font-mono">{fmtTime(app.time)}</span>
              <span className="text-teal-600">{app.comuna}</span>
            </div>
          </div>
  
          <div className="text-right">
            <div className="text-sm text-slate-400">Total</div>
            <div className="font-semibold text-lg text-teal-700">{fmtCLP(netPrice)}</div>
          </div>
        </div>
  
        {/* Estado */}
        <div className="mt-4 flex items-center justify-between">
          <span className={`px-5 py-1.5 text-xs font-medium rounded-2xl ${
            app.status === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
            app.status === 'asignada' ? 'bg-blue-100 text-blue-700' :
            app.status === 'en_tratamiento' ? 'bg-purple-100 text-purple-700' :
            app.status === 'completada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'Pendiente'}
          </span>
  
          <div className="flex gap-3">
            <button
              onClick={() => onEdit(app)}
              className="flex items-center gap-2 px-5 py-2 text-teal-600 hover:bg-teal-50 rounded-2xl text-sm font-medium transition-colors"
            >
              <Edit className="w-4 h-4" /> Editar
            </button>
            
            {app.status !== 'cancelada' && (
              <button
                onClick={() => onCancel(app)}
                className="flex items-center gap-2 px-5 py-2 text-red-600 hover:bg-red-50 rounded-2xl text-sm font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

/* ======================= EDIT APPOINTMENT MODAL  ============================= */
   function EditAppointmentModal({ app, services, onSave, onClose }) {
    const [formData, setFormData] = useState({
      date: app.date || '',
      time: app.time || '',
      status: app.status || 'pendiente',
      notes: app.notes || ''
    });
  
    const handleChange = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      const updatedApp = { ...app, ...formData };
      await onSave(updatedApp);
    };
  
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
        <div className="bg-white rounded-3xl max-w-lg w-full mx-4 overflow-hidden">
          <div className="px-8 py-6 border-b flex justify-between items-center">
            <h3 className="text-2xl font-bold">Editar Atención</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-6 h-6" />
            </button>
          </div>
  
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Fecha</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-4 py-4 rounded-2xl border border-slate-300 focus:border-teal-500"
                required
              />
            </div>
  
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Hora</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className="w-full px-4 py-4 rounded-2xl border border-slate-300 focus:border-teal-500"
                required
              />
            </div>
  
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-4 rounded-2xl border border-slate-300 focus:border-teal-500"
              >
                <option value="pendiente">Pendiente</option>
                <option value="asignada">Asignada</option>
                <option value="en_tratamiento">En tratamiento</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
  
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Notas / Observaciones</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
                className="w-full px-4 py-4 rounded-2xl border border-slate-300 focus:border-teal-500"
                placeholder="Notas clínicas o comentarios..."
              />
            </div>
  
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 text-slate-600 hover:bg-slate-100 rounded-2xl font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-semibold"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

/* ========================== LANDING PAGE ======================================== */
   function Landing({ services, onLogin }) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
        {/* HERO SECTION */}
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-3xl shadow-sm mb-6">
                <Stethoscope className="w-6 h-6 text-teal-600" />
                <span className="font-semibold text-teal-700">Enfermereando</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold leading-none text-slate-900 tracking-tighter">
                Atención de enfermería<br />
                <span className="text-teal-600">a domicilio</span>
              </h1>
              
              <p className="mt-8 text-2xl text-slate-600 max-w-lg">
                Inyecciones, curaciones, consejería y más.<br />
                Con profesionalidad, cercanía y en tu hogar.
              </p>
  
              <div className="flex flex-wrap gap-4 mt-10">
                <button 
                  onClick={onLogin}
                  className="px-10 py-5 bg-teal-600 hover:bg-teal-700 text-white text-xl font-semibold rounded-3xl transition-all flex items-center gap-3 shadow-lg shadow-teal-200"
                >
                  Iniciar Sesión
                  <ArrowRight className="w-6 h-6" />
                </button>
                
                <a 
                  href="https://wa.me/56920489639"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-5 bg-white border-2 border-teal-600 text-teal-700 hover:bg-teal-50 text-xl font-semibold rounded-3xl transition-all flex items-center gap-3"
                >
                  <Phone className="w-6 h-6" />
                  Hablar por WhatsApp
                </a>
              </div>
  
              <div className="mt-12 flex items-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-500" />
                  <span className="font-medium">Profesional certificada</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-500" />
                  <span className="font-medium">Atención en tu hogar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-500" />
                  <span className="font-medium">Santiago y alrededores</span>
                </div>
              </div>
            </div>
  
            {/* Imagen hero */}
            <div className="hidden md:block">
              <div className="bg-white rounded-3xl shadow-2xl p-4">
                <img 
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800"
                  alt="Enfermera en domicilio"
                  className="rounded-3xl w-full aspect-video object-cover"
                />
              </div>
            </div>
          </div>
        </div>
  
        {/* SERVICIOS DESTACADOS */}
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900">Nuestros Servicios</h2>
              <p className="text-slate-600 mt-3">Profesionales, seguros y a tu medida</p>
            </div>
  
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service) => {
                const Icon = getIconComponent(service.iconId);
                return (
                  <div key={service.id} className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-teal-200 rounded-3xl p-8 transition-all group">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-teal-600" />
                    </div>
                    <h3 className="font-semibold text-xl mb-2">{service.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">{service.desc}</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-xs text-slate-400">Desde</span>
                        <div className="text-3xl font-bold text-teal-700">{fmtCLP(service.price)}</div>
                      </div>
                      {service.allowDoses && (
                        <span className="text-xs bg-teal-100 text-teal-700 px-4 py-1 rounded-2xl font-medium">Múltiples dosis</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
  
        {/* BENEFICIOS */}
        <div className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-10">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-6">
                  <HomeIcon className="w-8 h-8 text-teal-600" />
                </div>
                <h4 className="font-semibold text-2xl mb-3">En tu hogar</h4>
                <p className="text-slate-600">Sin traslados. Comodidad y seguridad en el lugar que más te gusta.</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-teal-600" />
                </div>
                <h4 className="font-semibold text-2xl mb-3">Profesionalismo</h4>
                <p className="text-slate-600">Técnicas estériles, experiencia y atención personalizada.</p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mb-6">
                  <Clock className="w-8 h-8 text-teal-600" />
                </div>
                <h4 className="font-semibold text-2xl mb-3">Horarios flexibles</h4>
                <p className="text-slate-600">Mañana y tarde. Adaptamos el horario a tus necesidades.</p>
              </div>
            </div>
          </div>
        </div>
  
        {/* CTA FINAL */}
        <div className="bg-teal-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-5xl font-bold mb-6">¿Necesitas atención hoy?</h2>
            <p className="text-2xl mb-10 max-w-xl mx-auto">Agenda tu atención en minutos y recibe atención profesional en casa.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onLogin}
                className="px-12 py-6 bg-white text-teal-700 text-2xl font-semibold rounded-3xl hover:scale-105 transition-transform"
              >
                Iniciar Sesión como Paciente
              </button>
              <a 
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-12 py-6 border-2 border-white text-white text-2xl font-semibold rounded-3xl hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <Phone className="w-7 h-7" />
                Hablar por WhatsApp
              </a>
            </div>
            
            <p className="text-teal-200 mt-8 text-sm">
              📍 Santiago y comunas cercanas • Profesional: {PROFESSIONAL_NAME}
            </p>
          </div>
        </div>
  
        {/* FOOTER */}
        <footer className="bg-slate-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-3">
                <Stethoscope className="w-8 h-8" />
                <div className="font-bold text-2xl">Enfermereando</div>
              </div>
              
              <div className="flex gap-8 text-sm">
                <a href="https://wa.me/56920489639" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                  <Phone className="w-4 h-4" /> WhatsApp
                </a>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {PHONE}
                </div>
              </div>
  
              <div className="text-xs text-slate-400 text-center md:text-right">
                © 2026 Enfermereando • Atención de enfermería a domicilio<br />
                Profesional: {PROFESSIONAL_NAME}
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

// ==================== ADMINPANEL ====================
function AdminPanel({ 
  user, 
  services, 
  appointments, 
  patients, 
  professionals, 
  notifications, 
  saveAppointments, 
  onLogout 
}) {
  const [tab, setTab] = useState('monitoreo');
  const [editingApp, setEditingApp] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50">
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
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b">
          <TabButton active={tab === 'monitoreo'} onClick={() => setTab('monitoreo')} icon={Route}>Monitoreo</TabButton>
          <TabButton active={tab === 'calendario'} onClick={() => setTab('calendario')} icon={Calendar}>Calendario</TabButton>
        </div>

        {tab === 'monitoreo' && (
          <MonitoringPanel 
            appointments={appointments}
            services={services}
            currentUser={user}
            saveAppointments={saveAppointments}
            onEdit={setEditingApp}
          />
        )}

        {tab === 'calendario' && <CalendarView appointments={appointments} onEdit={setEditingApp} />}

        {editingApp && (
          <EditAppointmentModal 
            app={editingApp} 
            services={services} 
            onSave={async (updates) => {
              const newList = appointments.map(a => a.id === updates.id ? { ...a, ...updates } : a);
              await saveAppointments(newList);
              setEditingApp(null);
            }} 
            onClose={() => setEditingApp(null)} 
          />
        )}
      </div>
    </div>
  );
}

// ==================== MONITORING PANEL - VERSIÓN ESTABLE ====================
function MonitoringPanel({ 
  appointments, 
  services, 
  currentUser, 
  saveAppointments,
  onEdit 
}) {
  const [filterStatus, setFilterStatus] = useState('all');
  const isAdmin = currentUser.role === 'admin';

  const myAppointments = isAdmin 
    ? appointments 
    : appointments.filter(a => a.assignedTo === currentUser.id);

  const filteredApps = filterStatus === 'all' 
    ? myAppointments 
    : myAppointments.filter(a => a.status === filterStatus);

  const updateField = async (appId, field, value) => {
    const updated = appointments.map(app => 
      app.id === appId ? { ...app, [field]: value } : app
    );
    await saveAppointments(updated);
  };

  const updateDoses = async (appId, completedDoses) => {
    const updated = appointments.map(app => {
      if (app.id !== appId) return app;
      return {
        ...app,
        beneficiaries: app.beneficiaries.map(ben => ({
          ...ben,
          services: ben.services.map(s => ({
            ...s,
            completedDoses: parseInt(completedDoses) || 0
          }))
        }))
      };
    });
    await saveAppointments(updated);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Monitoreo de Atenciones</h2>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pendiente', 'asignada', 'en_tratamiento', 'completada'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-5 py-2 rounded-2xl text-sm font-medium transition-all ${
              filterStatus === s ? 'bg-teal-600 text-white' : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            {s === 'all' ? 'Todas' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filteredApps.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No hay atenciones para mostrar</div>
        ) : (
          filteredApps.map(app => {
            const net = app.beneficiaries ? appNetPrice(app, services) : 0;
            const isMine = app.assignedTo === currentUser.id;

            return (
              <div key={app.id} className="border border-slate-200 rounded-3xl p-6">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <div className="font-semibold text-lg">{app.patientName}</div>
                    <div className="text-sm text-slate-500">
                      {new Date(app.date).toLocaleDateString('es-CL')} • {fmtTime(app.time)}
                    </div>
                  </div>
                  <button onClick={() => onEdit(app)} className="text-teal-600 hover:text-teal-700">
                    Ver detalle →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">Estado</label>
                    <select
                      value={app.status || 'pendiente'}
                      onChange={(e) => updateField(app.id, 'status', e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-teal-500"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="asignada">Asignada</option>
                      <option value="en_tratamiento">En tratamiento</option>
                      <option value="completada">Completada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">Dosis completadas</label>
                    <input
                      type="number"
                      min="0"
                      value={app.beneficiaries?.[0]?.services?.[0]?.completedDoses || 0}
                      onChange={(e) => updateDoses(app.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-teal-500"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-slate-500 mb-2">Notas / Observaciones</label>
                    <textarea
                      value={app.notes || ''}
                      onChange={(e) => updateField(app.id, 'notes', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-teal-500"
                      placeholder="Observaciones clínicas..."
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ==================== SERVICES MANAGER (NUEVO MÓDULO) ====================
function ServicesManager({ services, saveServices }) {
  const [localServices, setLocalServices] = useState(services);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newService, setNewService] = useState({
    id: '',
    iconId: 'syringe',
    title: '',
    desc: '',
    price: 15000,
    allowDoses: false,
    active: true
  });

  // Sincronizar cuando cambien los servicios desde fuera
  useEffect(() => {
    setLocalServices(services);
  }, [services]);

  const updateService = (id, updates) => {
    const updatedList = localServices.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    setLocalServices(updatedList);
    saveServices(updatedList); // Guarda en Supabase y actualiza estado global
  };

  const toggleActive = (id) => {
    const svc = localServices.find(s => s.id === id);
    if (svc) updateService(id, { active: !svc.active });
  };

  const handlePriceChange = (id, value) => {
    const price = parseInt(value) || 0;
    updateService(id, { price });
  };

  const deleteService = (id) => {
    if (!confirm('¿Eliminar este servicio permanentemente? Esta acción no se puede deshacer.')) return;
    const updatedList = localServices.filter(s => s.id !== id);
    setLocalServices(updatedList);
    saveServices(updatedList);
  };

  const addNewService = () => {
    if (!newService.title || !newService.desc) {
      alert('Título y descripción son obligatorios');
      return;
    }
    const serviceToAdd = {
      ...newService,
      id: newService.id || 'svc-' + Date.now().toString(36)
    };
    const updatedList = [...localServices, serviceToAdd];
    setLocalServices(updatedList);
    saveServices(updatedList);
    setShowNewForm(false);
    setNewService({ id: '', iconId: 'syringe', title: '', desc: '', price: 15000, allowDoses: false, active: true });
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Package className="w-7 h-7 text-teal-600" />
          Gestión de Servicios
        </h2>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="px-5 py-2 bg-teal-600 text-white rounded-3xl font-medium flex items-center gap-2 hover:bg-teal-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nuevo servicio
        </button>
      </div>

      {/* Formulario para nuevo servicio */}
      {showNewForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 mb-8">
          <h3 className="font-semibold mb-4">Agregar nuevo servicio</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Título</label>
              <input
                type="text"
                value={newService.title}
                onChange={e => setNewService(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300"
                placeholder="Nombre del servicio"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Precio</label>
              <input
                type="number"
                value={newService.price}
                onChange={e => setNewService(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1">Descripción</label>
              <textarea
                value={newService.desc}
                onChange={e => setNewService(prev => ({ ...prev, desc: e.target.value }))}
                rows={2}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300"
                placeholder="Breve descripción del servicio"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Icono</label>
              <select
                value={newService.iconId}
                onChange={e => setNewService(prev => ({ ...prev, iconId: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300"
              >
                {ICON_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newService.allowDoses}
                  onChange={e => setNewService(prev => ({ ...prev, allowDoses: e.target.checked }))}
                />
                <span className="text-sm">Permitir paquetes de dosis</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowNewForm(false)}
              className="flex-1 py-3 border border-slate-300 rounded-3xl font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={addNewService}
              className="flex-1 py-3 bg-teal-600 text-white rounded-3xl font-medium"
            >
              Agregar servicio
            </button>
          </div>
        </div>
      )}

      {/* Lista de servicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {localServices.map(svc => {
          const Icon = getIconComponent(svc.iconId);
          return (
            <div key={svc.id} className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-semibold text-slate-900">{svc.title}</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={svc.active}
                        onChange={() => toggleActive(svc.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{svc.desc}</p>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 block mb-1">Precio</label>
                      <input
                        type="number"
                        value={svc.price}
                        onChange={(e) => handlePriceChange(svc.id, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-2xl text-lg font-semibold focus:border-teal-500"
                      />
                    </div>
                    <button
                      onClick={() => deleteService(svc.id)}
                      className="text-red-500 hover:text-red-600 mt-5"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {svc.allowDoses && (
                    <span className="inline-flex items-center gap-1 text-[10px] mt-3 px-3 py-1 bg-amber-100 text-amber-700 rounded-2xl">
                      <Package className="w-3 h-3" /> Paquetes de dosis
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =============================================
   PROFESSIONAL DASHBOARD - Dashboard del Profesional
   ============================================= */
   function ProfessionalDashboard({ 
    user, 
    services, 
    appointments, 
    saveAppointments, 
    onLogout 
  }) {
    const [tab, setTab] = useState('mis-atenciones');
    const [editingApp, setEditingApp] = useState(null);
  
    // Solo las atenciones asignadas a este profesional
    const myAppointments = appointments.filter(a => a.assignedTo === user.id);
  
    // ==================== TOMAR TAREA ====================
    const takeTask = async (app) => {
      if (app.status !== 'pendiente') return;
      const updated = appointments.map(a => 
        a.id === app.id ? { ...a, status: 'asignada', assignedTo: user.id } : a
      );
      await saveAppointments(updated);
      await sendWhatsAppToAdmin(app, 'status_change', services);
    };
  
    // ==================== ACTUALIZAR DOSIS ====================
    const updateDoses = async (appId, completedDoses) => {
      const updated = appointments.map(app => {
        if (app.id !== appId) return app;
        return {
          ...app,
          beneficiaries: app.beneficiaries.map(ben => ({
            ...ben,
            services: ben.services.map(s => ({
              ...s,
              completedDoses: parseInt(completedDoses) || 0
            }))
          }))
        };
      });
      await saveAppointments(updated);
    };
  
    // ==================== ACTUALIZAR ESTADO ====================
    const updateStatus = async (appId, newStatus) => {
      const updated = appointments.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      );
      await saveAppointments(updated);
    };
  
    return (
      <div className="min-h-screen bg-slate-50">
        {/* HEADER */}
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-8 h-8 text-teal-600" />
              <div className="font-bold text-2xl">Enfermereando</div>
              <span className="text-teal-600 font-medium">• Dashboard Profesional</span>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell userId={user.id} notifications={[]} />
              <div>
                <div className="font-semibold">{user.name}</div>
                <div className="text-xs text-teal-600">Profesional</div>
              </div>
              <button onClick={onLogout} className="p-2 hover:bg-slate-100 rounded-xl">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>
  
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* TABS */}
          <div className="flex gap-2 mb-8 border-b pb-2">
            <TabButton 
              active={tab === 'mis-atenciones'} 
              onClick={() => setTab('mis-atenciones')} 
              icon={Users}
            >
              Mis Atenciones
            </TabButton>
            <TabButton 
              active={tab === 'hoy'} 
              onClick={() => setTab('hoy')} 
              icon={Calendar}
            >
              Hoy
            </TabButton>
            <TabButton 
              active={tab === 'calendario'} 
              onClick={() => setTab('calendario')} 
              icon={Calendar}
            >
              Calendario
            </TabButton>
          </div>
  
          {/* MIS ATENCIONES */}
          {tab === 'mis-atenciones' && (
            <div className="space-y-6">
              {myAppointments.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center text-slate-400">
                  No tienes atenciones asignadas aún
                </div>
              ) : (
                myAppointments.map(app => (
                  <div key={app.id} className="bg-white border border-slate-200 rounded-3xl p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-xl">{app.patientName}</div>
                        <div className="text-sm text-slate-500">
                          {new Date(app.date).toLocaleDateString('es-CL')} • {fmtTime(app.time)}
                        </div>
                      </div>
                      <button 
                        onClick={() => setEditingApp(app)}
                        className="text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Ver / Editar →
                      </button>
                    </div>
  
                    <div className="grid grid-cols-3 gap-6 mt-6">
                      {/* Estado */}
                      <div>
                        <label className="text-xs text-slate-500">Estado</label>
                        <select
                          value={app.status || 'pendiente'}
                          onChange={(e) => updateStatus(app.id, e.target.value)}
                          className="w-full mt-2 px-4 py-3 rounded-2xl border border-slate-300"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="asignada">Asignada</option>
                          <option value="en_tratamiento">En tratamiento</option>
                          <option value="completada">Completada</option>
                        </select>
                      </div>
  
                      {/* Dosis */}
                      <div>
                        <label className="text-xs text-slate-500">Dosis completadas</label>
                        <input
                          type="number"
                          min="0"
                          value={app.beneficiaries?.[0]?.services?.[0]?.completedDoses || 0}
                          onChange={(e) => updateDoses(app.id, e.target.value)}
                          className="w-full mt-2 px-4 py-3 rounded-2xl border border-slate-300"
                        />
                      </div>
  
                      {/* Botón tomar tarea */}
                      {app.status === 'pendiente' && (
                        <button
                          onClick={() => takeTask(app)}
                          className="mt-8 h-fit px-8 py-4 bg-teal-600 text-white rounded-2xl font-semibold hover:bg-teal-700"
                        >
                          Tomar esta tarea
                        </button>
                      )}
                    </div>
  
                    {/* Notas rápidas */}
                    <textarea
                      value={app.notes || ''}
                      onChange={(e) => {
                        const updated = appointments.map(a => 
                          a.id === app.id ? { ...a, notes: e.target.value } : a
                        );
                        saveAppointments(updated);
                      }}
                      placeholder="Notas clínicas..."
                      className="w-full mt-6 px-4 py-3 rounded-2xl border border-slate-300 text-sm"
                      rows={2}
                    />
                  </div>
                ))
              )}
            </div>
          )}
  
          {/* HOY */}
          {tab === 'hoy' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Atenciones de Hoy</h2>
              {/* Filtra solo las de hoy */}
              {myAppointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length === 0 ? (
                <div className="text-center py-20 text-slate-400">No tienes atenciones programadas para hoy</div>
              ) : (
                // Reutiliza AppointmentCard o el mismo estilo
                myAppointments.filter(a => a.date === new Date().toISOString().split('T')[0]).map(app => (
                  <AppointmentCard 
                    key={app.id} 
                    app={app} 
                    services={services} 
                    onEdit={setEditingApp} 
                    onCancel={() => {}} 
                    saveAppointments={saveAppointments} 
                  />
                ))
              )}
            </div>
          )}
  
          {/* CALENDARIO */}
          {tab === 'calendario' && (
            <CalendarView appointments={myAppointments} onEdit={setEditingApp} />
          )}
  
          {/* MODAL DE EDICIÓN */}
          {editingApp && (
            <EditAppointmentModal 
              app={editingApp} 
              services={services} 
              onSave={async (updates) => {
                const newList = appointments.map(a => a.id === updates.id ? { ...a, ...updates } : a);
                await saveAppointments(newList);
                setEditingApp(null);
              }} 
              onClose={() => setEditingApp(null)} 
            />
          )}
        </div>
      </div>
    );
  }

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
      let apps = (await sget('enf:appointments', [])).map(normalizeApp || (x => x));
      const pats = await sget('enf:patients', []);
      let profs = await sget('enf:professionals', []);
      const notifs = await sget('enf:notifications', []);

      // ==================== CREACIÓN FORZADA DEL ADMINISTRADOR ====================
      const adminEmail = 'admin@enfermereando.cl';
      const existingAdmin = profs.find(p => 
        p.email === adminEmail || p.username === 'admin' || p.role === 'admin'
      );

      if (!existingAdmin || !existingAdmin.email) {
        // Eliminar cualquier admin antiguo sin email
        profs = profs.filter(p => p.role !== 'admin' && p.username !== 'admin');

        const defaultAdmin = {
          id: 'admin-default',
          name: PROFESSIONAL_NAME,
          email: adminEmail,
          password: 'enfermera2026',
          phone: PHONE,
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString()
        };

        profs = [defaultAdmin, ...profs];
        await sset('enf:professionals', profs);
        console.log('✅ Administrador creado/forzado con email:', defaultAdmin);
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

  const login = (loggedUser) => {
    setUser(loggedUser);
    if (loggedUser.role === 'patient') setView('patient');
    else if (loggedUser.role === 'admin') setView('admin');
    else setView('professional');
  };

  const logout = () => {
    setUser(null);
    setView('landing');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-2xl text-slate-400">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {view === 'landing' && <Landing services={services.filter(s => s.active)} onLogin={() => setView('login')} />}
      {view === 'login' && <LoginView onLogin={login} onBack={() => setView('landing')} patients={patients} professionals={professionals} />}
      {view === 'patient' && user && user.role === 'patient' && <PatientPortal user={user} services={services.filter(s => s.active)} appointments={appointments} saveAppointments={saveAppointmentsLocal} onLogout={logout} />}
      {view === 'professional' && user && user.role === 'professional' && <ProfessionalDashboard user={user} services={services} appointments={appointments} saveAppointments={saveAppointmentsLocal} onLogout={logout} />}
      {view === 'admin' && user && user.role === 'admin' && <AdminPanel user={user} services={services} appointments={appointments} patients={patients} professionals={professionals} notifications={notifications} saveAppointments={saveAppointmentsLocal} onLogout={logout} />}
    </div>
  );
}