import { supabase } from './supabase'

import { useState, useEffect } from 'react';
import {
  Pill, Activity, Syringe, Home as HomeIcon, Cross, Heart, BookOpen,
  Phone, MapPin, CheckCircle, Star, Shield, Calendar, User, UserPlus,
  LogOut, Plus, MessageCircle, Menu, X, FileText, Users, Trash2,
  Edit, Stethoscope, Award, Search, ArrowRight, Check, AlertCircle,
  ChevronDown, Tag, UserCog, Clock,
  Package, ToggleLeft, ToggleRight, Bell, Route, Navigation,
  ChevronsRight
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
  { id: 'counsel', iconId: 'heart', title: 'Consejería presencial', desc: 'Patologías crónicas, diabetes, hipertensión, salud mental, uso de medicamentos y adherencia al tratamiento. Material incluido.', price: 30000, allowDoses: false, active: true },
  { id: 'online', iconId: 'message', title: 'Asesoría online', desc: 'Educación sobre diabetes, hipertensión, salud mental, uso de insulina y revisión de exámenes por videollamada.', price: 35000, allowDoses: false, active: true },
  { id: 'cur-simple', iconId: 'cross', title: 'Curación simple', desc: 'Curación de heridas leves con técnica estéril.', price: 18000, allowDoses: true, active: true },
  { id: 'cur-adv', iconId: 'activity', title: 'Curación avanzada', desc: 'Pie diabético, úlceras y LPP con apósitos avanzados.', price: 40000, allowDoses: true, active: true }
];

const COMUNAS = ['Buin','Cerrillos','Cerro Navia','Colina','Conchalí','Curacaví','El Bosque','Estación Central','Huechuraba','Independencia','La Cisterna','La Florida','La Granja','La Pintana','La Reina','Las Condes','Lo Barnechea','Lo Espejo','Lo Prado','Macul','Maipú','Melipilla','Ñuñoa','Padre Hurtado','Paine','Pedro Aguirre Cerda','Peñaflor','Peñalolén','Pirque','Providencia','Pudahuel','Puente Alto','Quilicura','Quinta Normal','Recoleta','Renca','San Bernardo','San Joaquín','San Miguel','San Pedro','San Ramón','Santiago','Talagante','Vitacura',
];

// ==============================
// COORDENADAS COMUNAS RM
// ==============================

export const COMUNA_COORDS = {
  'Buin': { lat: -33.7333, lng: -70.7500 },
  'Cerrillos': { lat: -33.5000, lng: -70.7167 },
  'Cerro Navia': { lat: -33.4167, lng: -70.7333 },
  'Colina': { lat: -33.2000, lng: -70.6833 },
  'Conchalí': { lat: -33.3833, lng: -70.6833 },
  'Curacaví': { lat: -33.4167, lng: -71.1667 },
  'El Bosque': { lat: -33.5667, lng: -70.6667 },
  'Estación Central': { lat: -33.4566, lng: -70.6841 },
  'Huechuraba': { lat: -33.3667, lng: -70.6500 },
  'Independencia': { lat: -33.4144, lng: -70.6692 },
  'La Cisterna': { lat: -33.5375, lng: -70.6639 },
  'La Florida': { lat: -33.5223, lng: -70.5982 },
  'La Granja': { lat: -33.5378, lng: -70.6187 },
  'La Pintana': { lat: -33.5833, lng: -70.6333 },
  'La Reina': { lat: -33.4434, lng: -70.5378 },
  'Las Condes': { lat: -33.4172, lng: -70.5476 },
  'Lo Barnechea': { lat: -33.3477, lng: -70.5198 },
  'Lo Espejo': { lat: -33.5167, lng: -70.7167 },
  'Lo Prado': { lat: -33.4447, lng: -70.7253 },
  'Macul': { lat: -33.4892, lng: -70.5996 },
  'Maipú': { lat: -33.5169, lng: -70.7589 },
  'Melipilla': { lat: -33.6833, lng: -71.2167 },
  'Ñuñoa': { lat: -33.4569, lng: -70.5970 },
  'Padre Hurtado': { lat: -33.5667, lng: -70.8333 },
  'Paine': { lat: -33.8167, lng: -70.7500 },
  'Pedro Aguirre Cerda': { lat: -33.5000, lng: -70.6667 },
  'Peñaflor': { lat: -33.6167, lng: -70.8667 },
  'Peñalolén': { lat: -33.4827, lng: -70.5375 },
  'Pirque': { lat: -33.7167, lng: -70.5667 },
  'Providencia': { lat: -33.4244, lng: -70.6107 },
  'Pudahuel': { lat: -33.4333, lng: -70.7500 },
  'Puente Alto': { lat: -33.6111, lng: -70.5754 },
  'Quilicura': { lat: -33.3667, lng: -70.7333 },
  'Quinta Normal': { lat: -33.4400, lng: -70.7000 },
  'Recoleta': { lat: -33.4039, lng: -70.6386 },
  'Renca': { lat: -33.4000, lng: -70.7167 },
  'San Bernardo': { lat: -33.6000, lng: -70.7000 },
  'San Joaquín': { lat: -33.5000, lng: -70.6167 },
  'San Miguel': { lat: -33.4945, lng: -70.6516 },
  'San Pedro': { lat: -33.9000, lng: -71.4667 },
  'San Ramón': { lat: -33.5500, lng: -70.6500 },
  'Santiago': { lat: -33.4489, lng: -70.6693 },
  'Talagante': { lat: -33.6667, lng: -70.9333 },
  'Vitacura': { lat: -33.3823, lng: -70.5731 },
};

const RELATIONSHIPS = ['Titular','Cónyuge','Hijo/a','Padre','Madre','Abuelo/a','Hermano/a','Otro familiar','Otro'];
const ROLE_LABELS = { admin: 'Administrador', professional: 'Profesional' };

const FREQUENCIES = [
  { id: 'once', label: 'Dosis única', days: 0, short: 'Única' },
  { id: 'daily', label: 'Diaria', days: 1, short: 'Diaria' },
  { id: 'interdaily', label: 'Interdiaria (día por medio)', days: 2, short: 'Día x medio' },
  { id: 'weekly', label: 'Semanal', days: 7, short: 'Semanal' },
  { id: 'biweekly', label: 'Quincenal', days: 14, short: 'Quincenal' },
  { id: 'monthly', label: 'Mensual', days: 30, short: 'Mensual' },
  { id: 'bimonthly', label: 'Bimensual', days: 60, short: 'Bimensual' },
  { id: 'quarterly', label: 'Trimestral', days: 90, short: 'Trimestral' },
  { id: 'yearly', label: 'Anual', days: 365, short: 'Anual' }
];
const getFreqConfig = (id) => FREQUENCIES.find(f => f.id === id) || FREQUENCIES[0];

const TEMPLATES = {
  'inj-anti': 'Medicamento administrado:\nDosis:\nVía / Sitio de punción:\nReacción adversa: No / Sí\nFecha próxima dosis:\nIndicaciones entregadas:',
  'inj-im': 'Medicamento administrado:\nDosis:\nSitio de punción:\nReacción adversa: No / Sí\nTolerancia del paciente:\nObservaciones:',
  'inj-ev': 'Medicamento administrado:\nDosis:\nVía venosa utilizada:\nVelocidad de infusión:\nReacción adversa: No / Sí\nTolerancia:\nObservaciones:',
  'exam': 'Exámenes revisados:\nHallazgos relevantes:\nValores fuera de rango:\nDerivación sugerida:\nIndicaciones entregadas al paciente:',
  'counsel': 'Tema(s) abordados:\nSituación actual del paciente:\nNivel de adherencia al tratamiento:\nFactores de riesgo:\nDudas resueltas:\nMaterial entregado:\nPróximos pasos:',
  'online': 'Modalidad: Videollamada\nDuración:\nTema(s) tratados:\nNivel de comprensión:\nMaterial enviado:\nDudas resueltas:\nPróximo control:',
  'cur-simple': 'Tipo de herida:\nDimensiones (cm):\nLecho de la herida:\nApósito utilizado:\nDolor (EVA 0-10):\nIndicaciones entregadas:\nPróxima curación:',
  'cur-adv': 'Tipo de herida:\nDimensiones (cm):\nLecho de la herida:\nExudado (cantidad/aspecto):\nPiel perilesional:\nTratamiento aplicado:\nApósito utilizado:\nDolor (EVA 0-10):\nIndicaciones entregadas:\nPróxima curación:'
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
  { q: '¿Cómo se realiza el pago?', a: 'Aceptamos transferencia bancaria, efectivo y tarjetas.' },
  { q: '¿Atienden urgencias?', a: 'Sí, atendemos urgencias con disponibilidad inmediata sujeta a agenda.' }
];

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
const fmtCLP = (n) => '$' + Math.round(n).toLocaleString('es-CL');
const fmtTime = (t) => {
  if (!t) return '';
  const parts = t.split(':');
  const h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  if (isNaN(h)) return t;
  const p = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return h12 + ':' + m + ' ' + p;
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
const todayISO = () => new Date().toISOString().split('T')[0];

const isTimeInOperatingHours = (t) => {
  if (!t) return false;
  return (t >= HOURS_MORNING_START && t <= HOURS_MORNING_END) || (t >= HOURS_AFTERNOON_START && t <= HOURS_AFTERNOON_END);
};

const minutesFromMidnight = (t) => { const parts = t.split(':').map(Number); return parts[0] * 60 + parts[1]; };
const timeFromMinutes = (mins) => String(Math.floor(mins/60)).padStart(2,'0') + ':' + String(mins%60).padStart(2,'0');
const timesConflict = (t1, t2) => Math.abs(minutesFromMidnight(t1) - minutesFromMidnight(t2)) < SLOT_MINUTES;

const findAlternativeSlot = (desiredTime, appointments, professionalId, date) => {
  const taken = appointments
    .filter(a => a.date === date && a.assignedTo === professionalId && a.status !== 'cancelada')
    .map(a => minutesFromMidnight(a.time));
  const desired = minutesFromMidnight(desiredTime);
  const checkBounds = (m) => {
    if (m >= minutesFromMidnight(HOURS_MORNING_START) && m <= minutesFromMidnight(HOURS_MORNING_END)) return true;
    if (m >= minutesFromMidnight(HOURS_AFTERNOON_START) && m <= minutesFromMidnight(HOURS_AFTERNOON_END)) return true;
    return false;
  };
  for (let delta = SLOT_MINUTES; delta <= 240; delta += SLOT_MINUTES) {
    for (const sign of [1, -1]) {
      const candidate = desired + (delta * sign);
      if (!checkBounds(candidate)) continue;
      if (taken.every(t => Math.abs(t - candidate) >= SLOT_MINUTES)) return timeFromMinutes(candidate);
    }
  }
  return null;
};

const getGroupDiscount = (count) => count >= 4 ? 0.15 : count === 3 ? 0.10 : count === 2 ? 0.05 : 0;

const generateDoseDates = (startDate, count, freqId) => {
  const freq = getFreqConfig(freqId);
  if (!startDate || count <= 0) return [];
  const dates = [];
  const start = new Date(startDate + 'T00:00');
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + (freq.days * i));
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

const calculateVisitProgram = (app) => {
  let maxDoses = 1;
  let frequency = 'once';
  app.beneficiaries.forEach(b => {
    b.services.forEach(item => {
      if ((item.doses || 1) > maxDoses) {
        maxDoses = item.doses || 1;
        frequency = item.frequency || 'once';
      }
    });
  });
  return { totalVisits: maxDoses, frequency };
};

const generateFollowUpAppointments = (parentApp, assignedToId, assignedToName) => {
  const { totalVisits, frequency } = calculateVisitProgram(parentApp);
  if (totalVisits <= 1) return [];
  const dates = generateDoseDates(parentApp.date, totalVisits, frequency);
  const followUps = [];
  for (let i = 1; i < dates.length; i++) {
    followUps.push({
      id: uid(),
      patientId: parentApp.patientId,
      patientName: parentApp.patientName,
      patientPhone: parentApp.patientPhone,
      patientComuna: parentApp.patientComuna,
      beneficiaries: parentApp.beneficiaries.map(b => ({
        ...b,
        services: b.services.map(s => ({ ...s, completedDoses: 0 }))
      })),
      date: dates[i],
      time: parentApp.time,
      address: parentApp.address,
      notes: parentApp.notes,
      status: 'asignada',
      evolutions: {},
      createdAt: Date.now(),
      assignedTo: assignedToId,
      assignedToName: assignedToName,
      parentId: parentApp.id,
      seriesId: parentApp.id,
      doseNumber: i + 1,
      totalDosesInSeries: totalVisits,
      isFollowUp: true,
      visitNumber: 0
    });
  }
  return followUps;
};

const getSeriesVisits = (app, appointments) => {
  const seriesId = app.seriesId || app.parentId || app.id;
  return appointments.filter(x =>
    x.id === seriesId || x.seriesId === seriesId || x.parentId === seriesId
  ).sort((x, y) => new Date(x.date + 'T' + x.time) - new Date(y.date + 'T' + y.time));
};

const getSeriesProgress = (app, appointments) => {
  const allVisits = getSeriesVisits(app, appointments);
  const activeVisits = allVisits.filter(v => v.status !== 'cancelada');
  const completed = activeVisits.filter(v => v.status === 'completada').length;
  const total = activeVisits.length;
  return { completed, total, allComplete: completed === total && total > 0, visits: allVisits };
};

const normalizeServiceItem = (item) => {
  if (typeof item === 'string') return { serviceId: item, doses: 1, frequency: 'once', completedDoses: 0 };
  return { serviceId: item.serviceId, doses: item.doses || 1, frequency: item.frequency || 'once', completedDoses: item.completedDoses || 0 };
};

const normalizeApp = (a) => {
  let app = a;
  if (!app.beneficiaries) {
    app = { ...app, beneficiaries: [{ id: 'b0', name: app.patientName || 'Paciente', relationship: 'Titular', services: app.serviceId ? [app.serviceId] : [] }], evolutions: app.evolution ? { b0: app.evolution } : {} };
  }
  app = { ...app, beneficiaries: app.beneficiaries.map(b => ({ ...b, services: (b.services || []).map(normalizeServiceItem) })) };
  if (!app.assignedTo) app.assignedTo = null;
  if (!app.parentId) app.parentId = null;
  if (typeof app.doseNumber === 'undefined') app.doseNumber = null;
  if (typeof app.totalDosesInSeries === 'undefined') app.totalDosesInSeries = null;
  return app;
};

const getServiceById = (services, id) => services.find(s => s.id === id);
const itemSubtotal = (item, services) => { const svc = getServiceById(services, item.serviceId); if (!svc) return 0; return svc.price * item.doses; };
const appGrossPrice = (a, services) => a.beneficiaries.reduce((sum, b) => sum + b.services.reduce((s, item) => s + itemSubtotal(item, services), 0), 0);
const appNetPrice = (a, services) => Math.round(appGrossPrice(a, services) * (1 - getGroupDiscount(a.beneficiaries.length)));

const startOfWeek = (date) => { const d = new Date(date); d.setHours(0,0,0,0); const day = d.getDay(); d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day)); return d; };
const addDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate() + n); return d; };
const isoDate = (d) => d.toISOString().split('T')[0];

const haversineKm = (a, b) => {
  if (!a || !b) return 0;
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(a.lat * Math.PI/180) * Math.cos(b.lat * Math.PI/180) * Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
};

const estimateTravelTime = (originComuna, destComuna, timeHHMM) => {
  if (originComuna === destComuna) return { minutes: 8, km: 1.5, trafficLevel: 'bajo' };
  const o = COMUNA_COORDS[originComuna];
  const d = COMUNA_COORDS[destComuna];
  if (!o || !d) return { minutes: 30, km: 10, trafficLevel: 'medio' };
  const km = haversineKm(o, d);
  const hour = parseInt(timeHHMM.split(':')[0], 10);
  let avgSpeed, trafficLevel;
  if (hour >= 7 && hour <= 9) { avgSpeed = 18; trafficLevel = 'alto'; }
  else if (hour >= 17 && hour <= 20) { avgSpeed = 16; trafficLevel = 'alto'; }
  else if (hour >= 12 && hour <= 14) { avgSpeed = 25; trafficLevel = 'medio'; }
  else { avgSpeed = 32; trafficLevel = 'bajo'; }
  const baseMinutes = (km / avgSpeed) * 60;
  const minutes = Math.max(8, Math.round(baseMinutes * 1.4));
  return { minutes: minutes, km: Math.round(km * 1.4 * 10) / 10, trafficLevel: trafficLevel };
};

const extractComuna = (address) => {
  if (!address) return null;
  const lower = address.toLowerCase();
  return COMUNAS.find(c => lower.includes(c.toLowerCase())) || null;
};

const optimizeRoute = (visits, startComuna) => {
  if (visits.length === 0) return [];
  const remaining = visits.slice();
  const route = [];
  let currentComuna = startComuna || 'Providencia';
  let currentTime = visits[0].time;
  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestScore = Infinity;
    remaining.forEach((v, i) => {
      const comuna = extractComuna(v.address) || 'Santiago';
      const tt = estimateTravelTime(currentComuna, comuna, currentTime);
      const timeDiff = Math.abs(minutesFromMidnight(v.time) - minutesFromMidnight(currentTime));
      const score = tt.minutes + timeDiff * 0.3;
      if (score < bestScore) { bestScore = score; bestIdx = i; }
    });
    const chosen = remaining.splice(bestIdx, 1)[0];
    const comuna = extractComuna(chosen.address) || 'Santiago';
    const tt = estimateTravelTime(currentComuna, comuna, currentTime);
    route.push({ ...chosen, _travel: tt, _comuna: comuna });
    currentComuna = comuna;
    currentTime = chosen.time;
  }
  return route;
};

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
      if (!svcs || svcs.length === 0) { svcs = DEFAULT_SERVICES; await sset('enf:services', svcs); }
      const apps = (await sget('enf:appointments', [])).map(normalizeApp);
      const pats = await sget('enf:patients', []);
      let profs = await sget('enf:professionals', []);
      if (!profs.some(p => p.role === 'admin' && p.active)) {
        profs = [{ id: 'admin-default', username: 'admin', password: 'enfermera2026', name: PROFESSIONAL_NAME, email: '', role: 'admin', active: true, createdAt: Date.now() }].concat(profs);
        await sset('enf:professionals', profs);
      }
      const notifs = await sget('enf:notifications', []);
      setServices(svcs);
      setAppointments(apps);
      setPatients(pats);
      setProfessionals(profs);
      setNotifications(notifs);
      setLoading(false);
    })();
  }, []);

  const saveAppointments = async (list) => { setAppointments(list); await sset('enf:appointments', list); };
  const savePatients = async (list) => { setPatients(list); await sset('enf:patients', list); };
  const saveProfessionals = async (list) => { setProfessionals(list); await sset('enf:professionals', list); };
  const saveServices = async (list) => { setServices(list); await sset('enf:services', list); };
  const saveNotifications = async (list) => { setNotifications(list); await sset('enf:notifications', list); };

  const addNotification = async (notif) => {
    const newList = [{ id: uid(), createdAt: Date.now(), read: false, ...notif }].concat(notifications).slice(0, 100);
    await saveNotifications(newList);
  };
  const markNotifRead = async (id) => { await saveNotifications(notifications.map(n => n.id === id ? {...n, read: true} : n)); };
  const markAllNotifsRead = async (userId) => { await saveNotifications(notifications.map(n => n.userId === userId ? {...n, read: true} : n)); };

  const login = async (data) => {
    if (data.role === 'patient') {
      if (data.action === 'register') {
        if (patients.some(p => p.username.toLowerCase() === data.username.toLowerCase())) return { ok: false, error: 'Este nombre de usuario ya existe' };
        const pat = { id: uid(), username: data.username, password: data.password, name: data.name, phone: data.phone, comuna: data.comuna,email: data.email || '', createdAt: Date.now() };
        await savePatients(patients.concat([pat]));
        const safe = { ...pat };
        delete safe.password;
        setUser({ role: 'patient', ...safe });
        setView('patient');
        return { ok: true };
      }
      const pat = patients.find(p => p.username.toLowerCase() === data.username.toLowerCase());
      if (!pat) return { ok: false, error: 'Usuario no encontrado' };
      if (pat.password !== data.password) return { ok: false, error: 'Contraseña incorrecta' };
      const safe = { ...pat };
      delete safe.password;
      setUser({ role: 'patient', ...safe });
      setView('patient');
      return { ok: true };
    }
    if (data.action === 'register-pro') {
      if (professionals.some(p => p.username.toLowerCase() === data.username.toLowerCase())) return { ok: false, error: 'Este nombre de usuario ya existe' };
      const newPro = { id: uid(), username: data.username, password: data.password, name: data.name, email: data.email || '', role: 'professional', active: false, createdAt: Date.now() };
      await saveProfessionals(professionals.concat([newPro]));
      return { ok: true, pendingApproval: true };
    }
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

  const logout = () => { setUser(null); setView('landing'); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="text-teal-700 font-medium">Cargando...</div>
    </div>
  );

  const activeServices = services.filter(s => s.active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {view === 'landing' && <Landing services={activeServices} onLogin={() => setView('login')} />}
      {view === 'login' && <LoginView onLogin={login} onBack={() => setView('landing')} />}
      {view === 'patient' && user && user.role === 'patient' && <PatientPortal user={user} services={activeServices} appointments={appointments} notifications={notifications} saveAppointments={saveAppointments} addNotification={addNotification} markNotifRead={markNotifRead} markAllNotifsRead={markAllNotifsRead} onLogout={logout} />}
      {view === 'admin' && user && user.role !== 'patient' && <AdminPanel user={user} setUser={setUser} services={services} saveServices={saveServices} appointments={appointments} patients={patients} professionals={professionals} notifications={notifications} saveAppointments={saveAppointments} saveProfessionals={saveProfessionals} addNotification={addNotification} markNotifRead={markNotifRead} onLogout={logout} />}
      {view === 'landing' && <WhatsAppButton />}
    </div>
  );
}

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

function LoginView({ onLogin, onBack }) {
  const [tab, setTab] = useState('patient');
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [comuna, setComuna] = useState('');
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => { setUsername(''); setPassword(''); setPassword2(''); setName(''); setPhone(''); setEmail(''); setComuna(''); setErr(''); setInfo(''); };

  const submit = async () => {
    setErr(''); setInfo('');
    if (mode === 'register') {
      if (!name.trim() || !username.trim() || !password) return setErr('Completa todos los campos obligatorios');
      if (username.length < 4) return setErr('El usuario debe tener al menos 4 caracteres');
      if (password.length < 6) return setErr('La contraseña debe tener al menos 6 caracteres');
      if (password !== password2) return setErr('Las contraseñas no coinciden');
      if (tab === 'patient' && !phone.trim()) return setErr('Completa el teléfono');
      setLoading(true);
      const action = tab === 'patient' ? 'register' : 'register-pro';
      const payload = tab === 'patient' ? { role: 'patient', action: action, username: username.trim(), password: password, name: name.trim(), phone: phone.trim(), comuna: comuna,email: email.trim() } : { role: 'pro', action: action, username: username.trim(), password: password, name: name.trim(), email: email.trim() };
      const r = await onLogin(payload);
      setLoading(false);
      if (!r.ok) return setErr(r.error);
      if (r.pendingApproval) { setMode('login'); reset(); setInfo('Cuenta creada. Tu acceso debe ser aprobado por un administrador.'); }
    } else {
      if (!username.trim() || !password) return setErr('Ingresa usuario y contraseña');
      setLoading(true);
      const action = tab === 'patient' ? 'login' : 'login-pro';
      const r = await onLogin({ role: tab === 'patient' ? 'patient' : 'pro', action: action, username: username.trim(), password: password });
      setLoading(false);
      if (!r.ok) setErr(r.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <button onClick={onBack} className="text-sm text-slate-500 mb-4">← Volver al inicio</button>
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center mb-3"><Stethoscope className="w-7 h-7 text-white" /></div>
          <h1 className="text-2xl font-bold text-slate-900">Bienvenido a Enfermereando</h1>
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-5">
          <button onClick={() => { setTab('patient'); reset(); }} className={'flex-1 py-2 rounded-lg text-sm font-semibold ' + (tab === 'patient' ? 'bg-white shadow text-teal-700' : 'text-slate-600')}>Soy Paciente</button>
          <button onClick={() => { setTab('pro'); reset(); }} className={'flex-1 py-2 rounded-lg text-sm font-semibold ' + (tab === 'pro' ? 'bg-white shadow text-teal-700' : 'text-slate-600')}>Soy Profesional</button>
        </div>
        <div className="flex gap-2 mb-4 border-b border-slate-200">
          <button onClick={() => { setMode('login'); setErr(''); setInfo(''); }} className={'pb-2 px-1 text-sm font-semibold border-b-2 ' + (mode === 'login' ? 'text-teal-700 border-teal-600' : 'text-slate-500 border-transparent')}>Iniciar sesión</button>
          <button onClick={() => { setMode('register'); setErr(''); setInfo(''); }} className={'pb-2 px-1 text-sm font-semibold border-b-2 ' + (mode === 'register' ? 'text-teal-700 border-teal-600' : 'text-slate-500 border-transparent')}>Crear cuenta</button>
        </div>
        {mode === 'login' ? (
          <div className="space-y-3">
            <div><label className="text-xs font-semibold text-slate-600 block mb-1">Usuario</label><input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="tu_usuario" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none" /></div>
            <div><label className="text-xs font-semibold text-slate-600 block mb-1">Contraseña</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none" onKeyDown={e => e.key === 'Enter' && submit()} /></div>

          </div>
        ) : (
          <div className="space-y-3">
            <div><label className="text-xs font-semibold text-slate-600 block mb-1">Nombre completo *</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="María González" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none" /></div>
            <div><label className="text-xs font-semibold text-slate-600 block mb-1">Usuario *</label><input type="text" value={username} onChange={e => setUsername(e.target.value.replace(/\s/g, ''))} placeholder="mín. 4 caracteres" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-semibold text-slate-600 block mb-1">Contraseña *</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="mín. 6" className="w-full px-3 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none" /></div>
              <div><label className="text-xs font-semibold text-slate-600 block mb-1">Repetir *</label><input type="password" value={password2} onChange={e => setPassword2(e.target.value)} placeholder="confirmar" className="w-full px-3 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none" /></div>
            </div>
            {tab === 'patient' ? (
              <>
                <div><label className="text-xs font-semibold text-slate-600 block mb-1">Teléfono *</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+56 9 1234 5678" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none" /></div>
                <div><label className="text-xs font-semibold text-slate-600 block mb-1">Email (opcional)</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.cl" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none" /></div>
                <div><label className="text-xs font-semibold text-slate-600 block mb-1">Comuna</label><select value={comuna} onChange={e => setComuna(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none"><option value="">Selecciona tu comuna</option>{COMUNAS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              </>
            ) : (
              <>
                <div><label className="text-xs font-semibold text-slate-600 block mb-1">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="profesional@correo.cl" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none" /></div>
                <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 flex items-start gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />Las cuentas profesionales requieren aprobación de un administrador.</div>
              </>
            )}
          </div>
        )}
        {err && <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" />{err}</div>}
        {info && <div className="mt-3 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0" />{info}</div>}
        <button onClick={submit} disabled={loading} className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 text-white font-semibold disabled:opacity-60">{loading ? 'Procesando...' : (mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta')}</button>
      </div>
    </div>
  );
}

function NotificationBell({ userId, notifications, markNotifRead, markAllNotifsRead }) {
  const [open, setOpen] = useState(false);
  const myNotifs = notifications.filter(n => n.userId === userId).slice(0, 20);
  const unreadCount = myNotifs.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-slate-100">
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">{unreadCount}</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-40 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="font-bold text-slate-900 text-sm">Notificaciones</div>
              {unreadCount > 0 && markAllNotifsRead && <button onClick={() => markAllNotifsRead(userId)} className="text-xs text-teal-600 font-semibold">Marcar todo leído</button>}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {myNotifs.length === 0 ? <div className="p-8 text-center text-sm text-slate-400">Sin notificaciones</div> : myNotifs.map(n => (
                <button key={n.id} onClick={() => markNotifRead(n.id)} className={'w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 ' + (!n.read ? 'bg-teal-50/30' : '')}>
                  <div className="flex items-start gap-2">
                    <div className={'w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ' + (!n.read ? 'bg-teal-500' : 'bg-transparent')} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-900">{n.title}</div>
                      <div className="text-xs text-slate-600 mt-0.5 whitespace-pre-line">{n.body}</div>
                      <div className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString('es-CL')}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PatientPortal({ user, services, appointments, notifications, saveAppointments, addNotification, markNotifRead, markAllNotifsRead, onLogout }) {
  const [tab, setTab] = useState('inicio');
  const myApps = appointments.filter(a => a.patientId === user.id).sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
  const upcoming = myApps.filter(a => a.status !== 'cancelada' && a.status !== 'completada' && (a.status === 'en_tratamiento' || new Date(a.date) >= new Date(todayISO()))).reverse();

  const cancelByPatient = async (app) => {
    const reason = prompt('¿Por qué cancelas la reserva? (opcional)') || '';
    if (reason === null) return;
  
    const updated = appointments.map(a => a.id === app.id ? { ...a, status: 'cancelada', cancelReason: reason, cancelledAt: Date.now() } : a);
    await saveAppointments(updated);
  
    // Notificar al admin
    try {
      fetch('/api/notify-cancellation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: user.name,
          patientPhone: user.phone,
          date: new Date(app.date + 'T00:00').toLocaleDateString('es-CL'),
          time: app.time,
          address: app.address,
          reason: reason,
        }),
      }).catch(e => console.log('Notify cancel:', e));
    } catch (e) {
      console.error(e);
    }
    alert('Reserva cancelada. El profesional ha sido notificado.');
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center"><Stethoscope className="w-5 h-5 text-white" /></div><div><div className="font-bold text-slate-900 text-sm">Enfermereando</div><div className="text-xs text-slate-500">Portal del paciente</div></div></div>
          <div className="flex items-center gap-2">
            <NotificationBell userId={user.id} notifications={notifications} markNotifRead={markNotifRead} markAllNotifsRead={markAllNotifsRead} />
            <div className="hidden sm:block text-right"><div className="text-sm font-semibold text-slate-900">{user.name}</div><div className="text-xs text-slate-500">{user.comuna}</div></div>
            <button onClick={onLogout} className="p-2 rounded-lg hover:bg-slate-100"><LogOut className="w-5 h-5 text-slate-600" /></button>
          </div>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setTab('inicio')} className={'px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ' + (tab === 'inicio' ? 'bg-teal-600 text-white' : 'bg-white text-slate-700 border border-slate-200')}>Inicio</button>
          <button onClick={() => setTab('solicitar')} className={'px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ' + (tab === 'solicitar' ? 'bg-teal-600 text-white' : 'bg-white text-slate-700 border border-slate-200')}>Solicitar atención</button>
          <button onClick={() => setTab('historial')} className={'px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ' + (tab === 'historial' ? 'bg-teal-600 text-white' : 'bg-white text-slate-700 border border-slate-200')}>Historial</button>
        </div>
        {tab === 'inicio' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-teal-600 to-blue-700 rounded-2xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-1">Hola, {user.name.split(' ')[0]} 👋</h2>
              <p className="text-teal-50">Tienes {upcoming.length} {upcoming.length === 1 ? 'atención agendada' : 'atenciones agendadas'}</p>
              <button onClick={() => setTab('solicitar')} className="mt-4 px-4 py-2 rounded-lg bg-white text-teal-700 font-semibold text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Nueva solicitud</button>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-3">Próximas atenciones</h3>
              {upcoming.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200"><Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" /><p className="text-slate-500 mb-4">No tienes atenciones agendadas</p><button onClick={() => setTab('solicitar')} className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold">Solicitar atención</button></div>
              ) : (
                <div className="space-y-3">{upcoming.map(a => <AppointmentCard key={a.id} a={a} services={services} appointments={appointments} onCancel={cancelByPatient} />)}</div>
              )}
            </div>
          </div>
        )}
        {tab === 'solicitar' && <RequestForm user={user} services={services} appointments={appointments} saveAppointments={saveAppointments} addNotification={addNotification} onDone={() => setTab('inicio')} />}
        {tab === 'historial' && (
          <div>
            <h3 className="font-bold text-slate-900 mb-3">Historial completo ({myApps.length})</h3>
            {myApps.length === 0 ? <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500">Aún no tienes atenciones registradas</div> : <div className="space-y-3">{myApps.map(a => <AppointmentCard key={a.id} a={a} services={services} appointments={appointments} showEvolutions onCancel={cancelByPatient} />)}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentCard({ a, services, appointments, showEvolutions, professionals }) {
  const statusColors = { pendiente: 'bg-amber-100 text-amber-700', confirmada: 'bg-blue-100 text-blue-700', asignada: 'bg-indigo-100 text-indigo-700', en_tratamiento: 'bg-purple-100 text-purple-700', completada: 'bg-green-100 text-green-700', cancelada: 'bg-red-100 text-red-700' };
  const statusLabels = { pendiente: 'pendiente', confirmada: 'confirmada', asignada: 'asignada', en_tratamiento: 'en tratamiento', completada: 'completada', cancelada: 'cancelada' };
  const gross = appGrossPrice(a, services);
  const net = appNetPrice(a, services);
  const discount = getGroupDiscount(a.beneficiaries.length);
  const assignedPro = professionals ? professionals.find(p => p.id === a.assignedTo) : null;

  // Calcular progreso de dosis
  const totalDoses = a.beneficiaries.reduce((sum, b) => sum + b.services.reduce((s, it) => s + (it.doses || 1), 0), 0);
  const completedDoses = a.beneficiaries.reduce((sum, b) => sum + b.services.reduce((s, it) => s + (it.completedDoses || 0), 0), 0);
  const hasMultipleDoses = totalDoses > 1;
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div>
          <div className="text-sm text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(a.date + 'T00:00').toLocaleDateString('es-CL', {weekday: 'short', day: 'numeric', month: 'short'})} · {fmtTime(a.time)}</div>
          <div className="text-sm text-slate-600 mt-1 flex items-start gap-1"><MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" /> {a.address}</div>
          {a.doseNumber && a.totalDosesInSeries && <div className="text-xs text-amber-700 font-semibold mt-1 flex items-center gap-1"><Package className="w-3 h-3" /> Dosis {a.doseNumber} de {a.totalDosesInSeries}</div>}
          {assignedPro && <div className="text-xs text-indigo-700 mt-1 flex items-center gap-1"><UserCog className="w-3 h-3" /> Asignado a {assignedPro.name}</div>}
        </div>
        <span className={'text-xs px-2 py-1 rounded-full font-semibold ' + statusColors[a.status]}>{statusLabels[a.status] || a.status}</span>
      </div>
      {hasMultipleDoses && (a.status === 'en_tratamiento' || a.status === 'completada') && (
        <div className="mb-3 p-2.5 rounded-lg bg-gradient-to-r from-purple-50 to-teal-50 border border-purple-200">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-purple-800 flex items-center gap-1"><Package className="w-3.5 h-3.5" /> Progreso del tratamiento</span>
            <span className="font-bold text-purple-700">{completedDoses}/{totalDoses} dosis</span>
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden border border-purple-100">
            <div className="h-full bg-gradient-to-r from-purple-500 to-teal-500 transition-all" style={{width: (completedDoses / totalDoses * 100) + '%'}} />
          </div>
        </div>
      )}
      <div className="space-y-2 mb-3">{a.beneficiaries.map(b => <BeneficiaryLine key={b.id} b={b} services={services} evolution={showEvolutions ? (a.evolutions && a.evolutions[b.id]) : null} />)}</div>
      <div className="pt-3 border-t border-slate-100">
        {discount > 0 ? (
          <div className="flex items-end justify-between flex-wrap gap-1">
            <div className="text-xs text-green-700 font-semibold flex items-center gap-1"><Tag className="w-3 h-3" /> {Math.round(discount * 100)}% descuento</div>
            <div className="text-right"><div className="text-xs text-slate-400 line-through">{fmtCLP(gross)}</div><div className="text-base font-bold text-teal-700">{fmtCLP(net)}</div></div>
          </div>
        ) : (<div className="flex justify-end"><div className="text-base font-bold text-teal-700">{fmtCLP(net)}</div></div>)}
      </div>
      {a.notes && <div className="text-xs text-slate-500 mt-2 p-2 bg-slate-50 rounded-lg"><strong>Notas:</strong> {a.notes}</div>}
      {onCancel && (a.status === 'pendiente' || a.status === 'asignada' || a.status === 'confirmada') && (
  <div className="pt-3 mt-2 border-t border-slate-100">
    <button onClick={() => onCancel(a)} className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1">
      <X className="w-3 h-3" /> Cancelar reserva
    </button>
  </div>
)}
    </div>
  );
}

function BeneficiaryLine({ b, services, evolution }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-teal-700" /></div>
        <div className="flex-1 min-w-0"><div className="font-semibold text-sm text-slate-900 truncate">{b.name}</div>{b.relationship && b.relationship !== 'Titular' && <div className="text-xs text-slate-500">{b.relationship}</div>}</div>
      </div>
      <div className="flex flex-wrap gap-1 ml-9">
        {b.services.map((item, i) => {
          const svc = getServiceById(services, item.serviceId);
          if (!svc) return null;
          const Icon = getIconComponent(svc.iconId);
          const freq = getFreqConfig(item.frequency);
          const completed = item.completedDoses || 0;
          const isComplete = item.doses > 1 && completed >= item.doses;
          return (
            <span key={i} className={'inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs ' + (isComplete ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white border-teal-100 text-teal-800')}>
              <Icon className="w-3 h-3" /> {svc.title}
              {item.doses > 1 && <span className={'font-bold ' + (isComplete ? 'text-green-700' : 'text-amber-700')}>{completed}/{item.doses} {freq.short}</span>}
              {isComplete && <Check className="w-3 h-3 text-green-600" />}
            </span>
          );
        })}
      </div>
      {evolution && <div className="mt-2 ml-9 text-xs text-slate-700 p-2 bg-teal-50 rounded border border-teal-100 whitespace-pre-line"><strong className="text-teal-700">Evolución:</strong>{'\n'}{evolution}</div>}
    </div>
  );
}

function RequestForm({ user, services, appointments, saveAppointments, addNotification, onDone }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [beneficiaries, setBeneficiaries] = useState([{ id: uid(), name: user.name, relationship: 'Titular', services: [] }]);
  const [success, setSuccess] = useState(false);

  const addBen = () => setBeneficiaries(beneficiaries.concat([{ id: uid(), name: '', relationship: 'Otro familiar', services: [] }]));
  const removeBen = (id) => setBeneficiaries(beneficiaries.filter(b => b.id !== id));
  const updateBen = (id, updates) => setBeneficiaries(beneficiaries.map(b => b.id === id ? { ...b, ...updates } : b));
  const toggleService = (benId, serviceId) => {
    const ben = beneficiaries.find(b => b.id === benId);
    const exists = ben.services.find(s => s.serviceId === serviceId);
    if (exists) updateBen(benId, { services: ben.services.filter(s => s.serviceId !== serviceId) });
    else updateBen(benId, { services: ben.services.concat([{ serviceId: serviceId, doses: 1, frequency: 'once', completedDoses: 0 }]) });
  };
  const updateServiceItem = (benId, serviceId, updates) => {
    const ben = beneficiaries.find(b => b.id === benId);
    updateBen(benId, { services: ben.services.map(s => s.serviceId === serviceId ? { ...s, ...updates } : s) });
  };

  const gross = beneficiaries.reduce((s, b) => s + b.services.reduce((acc, item) => acc + itemSubtotal(item, services), 0), 0);
  const groupDiscount = getGroupDiscount(beneficiaries.length);
  const net = gross - Math.round(gross * groupDiscount);
  const timeValid = !time || isTimeInOperatingHours(time);
  const canSubmit = date && time && timeValid && address.trim() && beneficiaries.every(b => b.name.trim() && b.services.length > 0);

  const submit = async () => {
    if (!canSubmit) return;
    const cleanedBenefs = beneficiaries.map(b => ({ ...b, name: b.name.trim() }));
    const newApp = {
      id: uid(), patientId: user.id, patientName: user.name, patientPhone: user.phone, patientComuna: user.comuna,patientEmail: user.email || '',
      beneficiaries: cleanedBenefs,
      date: date, time: time, address: address.trim(), notes: notes.trim(),
      status: 'pendiente', evolutions: {}, createdAt: Date.now(), assignedTo: null,
      parentId: null, doseNumber: null, totalDosesInSeries: null
    };
    await saveAppointments(appointments.concat([newApp]));
    // Notificar al admin por WhatsApp
try {
  const adminPhone = import.meta.env.VITE_ADMIN_WHATSAPP;
  const apiKey = import.meta.env.VITE_CALLMEBOT_APIKEY;
  if (adminPhone && apiKey) {
    const totalServices = cleanedBenefs.reduce((sum, b) => sum + b.services.length, 0);
    const message = encodeURIComponent(
      '🔔 *Nueva reserva en Enfermereando*\n\n' +
      '👤 Paciente: ' + user.name + '\n' +
      '📞 Teléfono: ' + user.phone + '\n' +
      '📅 Fecha: ' + new Date(date + 'T00:00').toLocaleDateString('es-CL') + '\n' +
      '🕐 Hora: ' + fmtTime(time) + '\n' +
      '📍 Dirección: ' + address + '\n' +
      '👥 Personas: ' + cleanedBenefs.length + '\n' +
      '💉 Servicios: ' + totalServices + '\n\n' +
      '💰 Total: ' + fmtCLP(net) + '\n\n' +
      'Ingresa al panel para confirmar.'
    );
    fetch('https://api.callmebot.com/whatsapp.php?phone=' + adminPhone + '&text=' + message + '&apikey=' + apiKey, {
      method: 'GET',
      mode: 'no-cors'
    }).catch(e => console.log('CallMeBot:', e));
  }
} catch (e) {
  console.error('Error notificando admin:', e);
}

// Notificar al admin por Email
try {
  const totalServices = cleanedBenefs.reduce((sum, b) => sum + b.services.length, 0);
  fetch('/api/notify-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientName: user.name,
      patientPhone: user.phone,
      date: new Date(date + 'T00:00').toLocaleDateString('es-CL'),
      time: fmtTime(time),
      address: address,
      beneficiaries: cleanedBenefs.length,
      total: fmtCLP(net),
    }),
  }).catch(e => console.log('Email notify:', e));
} catch (e) {
  console.error('Error notificando email:', e);
}

    setSuccess(true);
    setTimeout(() => onDone(), 2000);
  };

  if (success) return (
    <div className="bg-white rounded-2xl p-12 text-center border border-green-200">
      <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">¡Solicitud enviada!</h3>
      <p className="text-slate-600">Un profesional confirmará tu horario en menos de 30 minutos.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5">
      <div><h3 className="font-bold text-lg text-slate-900">Nueva solicitud de atención</h3></div>
      <div className="bg-teal-50 border border-teal-100 rounded-lg px-3 py-2 text-xs text-teal-800 flex items-center gap-2"><Clock className="w-4 h-4 flex-shrink-0" /><span><strong>Horarios:</strong> {HOURS_LABEL_FULL}</span></div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="text-sm font-semibold text-slate-700 block mb-1">Fecha *</label><input type="date" min={todayISO()} value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none" /></div>
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1">Hora *</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className={'w-full px-4 py-3 rounded-xl border focus:outline-none ' + (time && !timeValid ? 'border-red-300' : 'border-slate-200 focus:border-teal-500')} />
          {time && !timeValid && <p className="text-xs text-red-600 mt-1">Fuera del horario</p>}
          {time && timeValid && <p className="text-xs text-slate-500 mt-1">{fmtTime(time)}</p>}
        </div>
      </div>
      <div><label className="text-sm font-semibold text-slate-700 block mb-1">Dirección *</label><input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, número, depto, comuna" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none" />{address && extractComuna(address) && <p className="text-xs text-teal-700 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Comuna detectada: <strong>{extractComuna(address)}</strong></p>}</div>
      <div><label className="text-sm font-semibold text-slate-700 block mb-1">Notas</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:outline-none resize-none" /></div>

      <div className="border-t border-slate-200 pt-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h4 className="font-bold text-slate-900 flex items-center gap-2"><Users className="w-5 h-5 text-teal-600" /> Personas a atender</h4>
          <button onClick={addBen} className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-sm font-semibold flex items-center gap-1 border border-teal-200"><UserPlus className="w-4 h-4" /> Agregar persona</button>
        </div>
        <div className="space-y-3">{beneficiaries.map((b, idx) => <BeneficiaryEditor key={b.id} ben={b} idx={idx} services={services} canRemove={beneficiaries.length > 1} startDate={date} onUpdate={updateBen} onRemove={removeBen} onToggleService={toggleService} onUpdateServiceItem={updateServiceItem} />)}</div>
      </div>

      {gross > 0 && (
        <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-4 border border-teal-200">
          {groupDiscount > 0 && <div className="flex items-center justify-between text-sm mb-1"><span className="text-slate-600">Subtotal</span><span className="text-slate-500 line-through">{fmtCLP(gross)}</span></div>}
          {groupDiscount > 0 && <div className="flex items-center justify-between text-sm mb-1"><span className="text-green-700 font-semibold flex items-center gap-1"><Tag className="w-3 h-3" /> Descuento grupo familiar {Math.round(groupDiscount*100)}%</span><span className="text-green-700 font-semibold">-{fmtCLP(gross - net)}</span></div>}
          <div className="flex justify-between font-bold text-teal-700 text-lg"><span>Total estimado</span><span>{fmtCLP(net)}</span></div>
        </div>
      )}

      <button onClick={submit} disabled={!canSubmit} className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed">Enviar solicitud</button>
    </div>
  );
}

function BeneficiaryEditor({ ben, idx, services, canRemove, startDate, onUpdate, onRemove, onToggleService, onUpdateServiceItem }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-slate-700 text-sm flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">{idx + 1}</div>{idx === 0 ? 'Persona principal' : 'Persona ' + (idx + 1)}</div>
        {canRemove && <button onClick={() => onRemove(ben.id)} className="text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>}
      </div>
      <div className="grid sm:grid-cols-2 gap-2 mb-3">
        <div><label className="text-xs font-semibold text-slate-600 block mb-1">Nombre *</label><input type="text" value={ben.name} onChange={e => onUpdate(ben.id, { name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white" /></div>
        <div><label className="text-xs font-semibold text-slate-600 block mb-1">Parentesco</label><select value={ben.relationship} onChange={e => onUpdate(ben.id, { relationship: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">{RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-2">Servicios *</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {services.map(s => {
            const sel = ben.services.some(it => it.serviceId === s.id);
            const Icon = getIconComponent(s.iconId);
            return (
              <button key={s.id} onClick={() => onToggleService(ben.id, s.id)} className={'px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 ' + (sel ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-700 border-slate-300')}>
                {sel ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}{s.title}
              </button>
            );
          })}
        </div>
        {ben.services.length > 0 && <div className="space-y-2 mt-3">{ben.services.map(item => { const svc = getServiceById(services, item.serviceId); if (!svc) return null; return <DoseConfigCard key={item.serviceId} item={item} service={svc} startDate={startDate} onUpdate={(updates) => onUpdateServiceItem(ben.id, item.serviceId, updates)} />; })}</div>}
      </div>
    </div>
  );
}

function DoseConfigCard({ item, service, startDate, onUpdate }) {
  const Icon = getIconComponent(service.iconId);
  const freq = getFreqConfig(item.frequency);
  const dates = startDate && item.doses > 1 && item.frequency !== 'once' ? generateDoseDates(startDate, item.doses, item.frequency) : [];
  const [datesExpanded, setDatesExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3">
      <div className="flex items-center gap-2 mb-2"><Icon className="w-4 h-4 text-teal-600 flex-shrink-0" /><div className="flex-1 min-w-0"><div className="font-semibold text-sm text-slate-900 truncate">{service.title}</div><div className="text-xs text-slate-500">{fmtCLP(service.price)} por dosis</div></div></div>
      {service.allowDoses && (
        <div className="space-y-2 mt-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-semibold text-slate-600 block mb-1">N° de dosis</label><div className="flex items-center gap-1"><button onClick={() => onUpdate({ doses: Math.max(1, item.doses - 1) })} className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 font-bold">−</button><input type="number" min="1" max="365" value={item.doses} onChange={e => onUpdate({ doses: Math.max(1, Math.min(365, parseInt(e.target.value) || 1)) })} className="flex-1 px-2 py-1 rounded-md border border-slate-200 text-sm text-center" /><button onClick={() => onUpdate({ doses: Math.min(365, item.doses + 1) })} className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 font-bold">+</button></div></div>
            <div><label className="text-xs font-semibold text-slate-600 block mb-1">Frecuencia</label><select value={item.frequency} onChange={e => onUpdate({ frequency: e.target.value })} disabled={item.doses === 1} className="w-full px-2 py-1.5 rounded-md border border-slate-200 text-sm disabled:bg-slate-50">{FREQUENCIES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}</select></div>
          </div>
          {item.doses > 1 && <div className="bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5 text-xs text-amber-800 flex items-center gap-1"><Package className="w-3 h-3" /><strong>Paquete:</strong> {item.doses} × {freq.short.toLowerCase()}</div>}
          {dates.length > 0 && (
            <div className="text-xs">
              <button onClick={() => setDatesExpanded(!datesExpanded)} className="text-teal-600 font-semibold flex items-center gap-1"><Calendar className="w-3 h-3" /> Ver fechas programadas ({dates.length})<ChevronDown className={'w-3 h-3 ' + (datesExpanded ? 'rotate-180' : '')} /></button>
              {datesExpanded && <div className="mt-2 p-2 bg-slate-50 rounded-md max-h-32 overflow-y-auto"><div className="grid grid-cols-2 gap-1">{dates.map((d, i) => <div key={i} className="text-xs text-slate-700"><span className="text-slate-400 font-mono">#{i+1}</span> {new Date(d + 'T00:00').toLocaleDateString('es-CL', {day: '2-digit', month: 'short', year: '2-digit'})}</div>)}</div></div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }) {
  if (role === 'admin') return <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">ADMIN</span>;
  return <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">PRO</span>;
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    teal: 'bg-teal-100 text-teal-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700'
  };
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
      <div className={'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ' + colors[color]}><Icon className="w-5 h-5" /></div>
      <div className="min-w-0"><div className="text-xs text-slate-500">{label}</div><div className="text-xl font-bold text-slate-900">{value}</div></div>
    </div>
  );
}

function AdminPanel({ user, setUser, services, saveServices, appointments, patients, professionals, notifications, saveAppointments, saveProfessionals, addNotification, markNotifRead, onLogout }) {
  const [tab, setTab] = useState('hoy');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState('');
  const [editingApp, setEditingApp] = useState(null);
  const [completingApp, setCompletingApp] = useState(null);

  const isAdmin = user.role === 'admin';
  const today = todayISO();
  const visibleApps = isAdmin ? appointments : appointments.filter(a => a.assignedTo === user.id || (a.status === 'pendiente' && !a.assignedTo));
  const todayApps = visibleApps.filter(a => a.date === today && a.status !== 'cancelada' && (isAdmin || a.assignedTo === user.id)).sort((a, b) => a.time.localeCompare(b.time));
  const pending = visibleApps.filter(a => a.status === 'pendiente').sort((a, b) => b.createdAt - a.createdAt);
  const monthCount = visibleApps.filter(a => a.date.startsWith(today.slice(0, 7)) && a.status === 'completada').length;
  const pendingApprovalCount = professionals.filter(p => !p.active).length;

  const updateStatus = async (id, status) => { await saveAppointments(appointments.map(a => a.id === id ? { ...a, status: status } : a)); };
  const updateApp = async (updates) => { await saveAppointments(appointments.map(a => a.id === updates.id ? { ...a, ...updates } : a)); setEditingApp(null); };

  const confirmAppointment = async (appId) => {
    const app = appointments.find(a => a.id === appId);
    if (!app) return;
    const conflict = appointments.find(a => a.id !== appId && a.date === app.date && a.assignedTo === user.id && a.status !== 'cancelada' && a.status !== 'pendiente' && timesConflict(a.time, app.time));
    if (conflict) {
      const alternative = findAlternativeSlot(app.time, appointments, user.id, app.date);
      if (alternative) {
        await addNotification({ userId: app.patientId, title: 'Horario no disponible', body: 'Tu solicitud para el ' + new Date(app.date + 'T00:00').toLocaleDateString('es-CL') + ' a las ' + fmtTime(app.time) + ' no está disponible. Horario alternativo sugerido: ' + fmtTime(alternative), appointmentId: appId, type: 'conflict' });
        await saveAppointments(appointments.map(a => a.id === appId ? { ...a, status: 'pendiente', suggestedTime: alternative, suggestedBy: user.name } : a));
      }
      return { ok: false, conflict: true };
    }
    await saveAppointments(appointments.map(a => a.id === appId ? { ...a, status: 'asignada', assignedTo: user.id, assignedToName: user.name, suggestedTime: null } : a));
    await addNotification({ userId: app.patientId, title: 'Atención confirmada', body: user.name + ' confirmó tu atención del ' + new Date(app.date + 'T00:00').toLocaleDateString('es-CL') + ' a las ' + fmtTime(app.time), appointmentId: appId, type: 'confirmed' });
    
    // Notificar al paciente por email
try {
  fetch('/api/notify-patient', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'confirmed',
      patientEmail: app.patientEmail || '',
      patientName: app.patientName,
      patientPhone: app.patientPhone,
      date: new Date(app.date + 'T00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }),
      time: app.time,
      address: app.address,
      professionalName: user.name,
    }),
  }).catch(e => console.log('Notify patient:', e));
} catch (e) { console.error(e); }

    return { ok: true };
  };

  const completeWithEvolutions = async (id, evolutions) => {
    const app = appointments.find(a => a.id === id);
    if (!app) { setCompletingApp(null); return; }

    // Sumar 1 a las dosis completadas de cada servicio de cada beneficiario
    const updatedBenefs = app.beneficiaries.map(b => ({
      ...b,
      services: b.services.map(item => ({ ...item, completedDoses: (item.completedDoses || 0) + 1 }))
    }));

    // Calcular total de dosis y dosis completadas (sumando todos los beneficiarios y servicios)
    const totalDoses = updatedBenefs.reduce((sum, b) => sum + b.services.reduce((s, it) => s + (it.doses || 1), 0), 0);
    const completedDoses = updatedBenefs.reduce((sum, b) => sum + b.services.reduce((s, it) => s + (it.completedDoses || 0), 0), 0);

    // Acumular evoluciones por beneficiario (historial completo)
    const previousEvolutions = app.evolutions || {};
    const visitNumber = (app.visitNumber || 0) + 1;
    const visitDate = new Date().toLocaleDateString('es-CL') + ' ' + new Date().toLocaleTimeString('es-CL', {hour: '2-digit', minute: '2-digit'});

    const mergedEvolutions = {};
    Object.keys(evolutions).forEach(benId => {
      const newEntry = '── Visita ' + visitNumber + ' · ' + visitDate + ' · ' + user.name + ' ──\n' + evolutions[benId];
      mergedEvolutions[benId] = previousEvolutions[benId] ? previousEvolutions[benId] + '\n\n' + newEntry : newEntry;
    });

    // Si aún quedan dosis, el estado es "en_tratamiento", si no, "completada"
    const newStatus = completedDoses >= totalDoses ? 'completada' : 'en_tratamiento';

    await saveAppointments(appointments.map(a => a.id === id ? {
      ...a,
      beneficiaries: updatedBenefs,
      evolutions: mergedEvolutions,
      completedBy: user.name,
      status: newStatus,
      visitNumber: visitNumber,
      lastVisitDate: todayISO()
    } : a));

    if (newStatus === 'completada') {
      await addNotification({ userId: app.patientId, title: 'Tratamiento completado ✓', body: 'Tu tratamiento del ' + new Date(app.date + 'T00:00').toLocaleDateString('es-CL') + ' fue completado (' + completedDoses + '/' + totalDoses + ' dosis) por ' + user.name, appointmentId: id, type: 'completed' });
    } else {
      await addNotification({ userId: app.patientId, title: 'Visita registrada', body: 'Visita ' + visitNumber + ' completada por ' + user.name + '. Progreso: ' + completedDoses + '/' + totalDoses + ' dosis. El tratamiento continúa.', appointmentId: id, type: 'in_treatment' });
    }
    setCompletingApp(null);
  };

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search));

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0"><div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center flex-shrink-0"><Stethoscope className="w-5 h-5 text-white" /></div><div className="min-w-0"><div className="font-bold text-slate-900 text-sm">Enfermereando</div><div className="text-xs text-slate-500">Panel profesional</div></div></div>
          <div className="flex items-center gap-2">
            <NotificationBell userId={user.id} notifications={notifications} markNotifRead={markNotifRead} />
            <div className="text-right hidden sm:block"><div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 justify-end">{user.name}<RoleBadge role={user.role} /></div><div className="text-xs text-slate-500">@{user.username}</div></div>
            <button onClick={onLogout} className="p-2 rounded-lg hover:bg-slate-100"><LogOut className="w-5 h-5 text-slate-600" /></button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Visitas hoy" value={todayApps.length} icon={Calendar} color="teal" />
          <StatCard label="Pendientes" value={pending.length} icon={AlertCircle} color="amber" />
          <StatCard label="Pacientes" value={patients.length} icon={Users} color="blue" />
          <StatCard label="Completadas mes" value={monthCount} icon={CheckCircle} color="green" />
        </div>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <TabButton active={tab === 'hoy'} onClick={() => { setTab('hoy'); setSelectedPatient(null); }}>Hoy ({todayApps.length})</TabButton>
          <TabButton active={tab === 'semana'} onClick={() => { setTab('semana'); setSelectedPatient(null); }}>Semana</TabButton>
          <TabButton active={tab === 'ruta'} onClick={() => { setTab('ruta'); setSelectedPatient(null); }} icon={Route}>Ruta del día</TabButton>
          <TabButton active={tab === 'pendientes'} onClick={() => { setTab('pendientes'); setSelectedPatient(null); }}>Pendientes ({pending.length})</TabButton>
          <TabButton active={tab === 'todas'} onClick={() => { setTab('todas'); setSelectedPatient(null); }}>Todas</TabButton>
          <TabButton active={tab === 'pacientes'} onClick={() => { setTab('pacientes'); setSelectedPatient(null); }}>Pacientes</TabButton>
          {isAdmin && <TabButton active={tab === 'servicios'} onClick={() => { setTab('servicios'); setSelectedPatient(null); }}>Servicios</TabButton>}
          {isAdmin && <TabButton active={tab === 'perfiles'} onClick={() => { setTab('perfiles'); setSelectedPatient(null); }} badge={pendingApprovalCount > 0}>{pendingApprovalCount ? 'Profesionales (' + pendingApprovalCount + ')' : 'Profesionales'}</TabButton>}
          <TabButton active={tab === 'miperfil'} onClick={() => { setTab('miperfil'); setSelectedPatient(null); }} icon={User}>Mi perfil</TabButton>
        </div>
        {tab === 'hoy' && <DayView apps={todayApps} services={services} onComplete={(a) => setCompletingApp(a)} onEdit={setEditingApp} professionals={professionals} />}
        {tab === 'semana' && <WeekView appointments={visibleApps} services={services} onEdit={setEditingApp} />}
        {tab === 'ruta' && <RoutePlannerView appointments={visibleApps} services={services} user={user} />}
        {tab === 'pendientes' && <PendingView apps={pending} services={services} user={user} onConfirm={confirmAppointment} onCancel={(id) => updateStatus(id, 'cancelada')} onEdit={setEditingApp} />}
        {tab === 'todas' && <AllAppsView apps={visibleApps} services={services} professionals={professionals} onEdit={setEditingApp} />}
        {tab === 'pacientes' && (selectedPatient ? <PatientDetail patient={selectedPatient} services={services} appointments={appointments.filter(a => a.patientId === selectedPatient.id)} onBack={() => setSelectedPatient(null)} /> : <PatientsList patients={filteredPatients} appointments={appointments} search={search} setSearch={setSearch} onSelect={setSelectedPatient} />)}
        {tab === 'servicios' && isAdmin && <ServicesManager services={services} saveServices={saveServices} appointments={appointments} />}
        {tab === 'perfiles' && isAdmin && <ProfessionalsManager professionals={professionals} saveProfessionals={saveProfessionals} currentUser={user} />}
        {tab === 'miperfil' && <MyProfile user={user} professionals={professionals} saveProfessionals={saveProfessionals} setUser={setUser} />}
      </div>
      {editingApp && <EditAppointmentModal app={editingApp} services={services} onSave={updateApp} onClose={() => setEditingApp(null)} onCancelApp={(id) => { updateStatus(id, 'cancelada'); setEditingApp(null); }} />}
      {completingApp && <EvolutionModal app={completingApp} services={services} onSave={completeWithEvolutions} onClose={() => setCompletingApp(null)} />}
    </div>
  );
}

function TabButton({ active, onClick, children, icon: Icon, badge }) {
  return (
    <button onClick={onClick} className={'px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap relative flex items-center gap-1.5 ' + (active ? 'bg-teal-600 text-white' : 'bg-white text-slate-700 border border-slate-200')}>
      {Icon && <Icon className="w-4 h-4" />}{children}
      {badge && !active && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full" />}
    </button>
  );
}

function DayView({ apps, services, onComplete, onEdit, professionals }) {
  if (apps.length === 0) return <EmptyState icon={Calendar} text="No hay atenciones programadas para hoy" />;
  const statusStyle = (s) => {
    if (s === 'completada') return 'bg-green-100 text-green-700';
    if (s === 'en_tratamiento') return 'bg-purple-100 text-purple-700';
    if (s === 'asignada') return 'bg-indigo-100 text-indigo-700';
    return 'bg-blue-100 text-blue-700';
  };
  const statusLabel = (s) => s === 'en_tratamiento' ? 'en tratamiento' : s;

  return (
    <div className="space-y-3">
      {apps.map(a => {
        const totalDoses = a.beneficiaries.reduce((sum, b) => sum + b.services.reduce((s, it) => s + (it.doses || 1), 0), 0);
        const completedDoses = a.beneficiaries.reduce((sum, b) => sum + b.services.reduce((s, it) => s + (it.completedDoses || 0), 0), 0);
        const visitNumber = (a.visitNumber || 0) + 1;
        const hasMultiple = totalDoses > 1;
        return (
        <div key={a.id} className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-lg font-bold text-teal-700">{fmtTime(a.time)}</span>
                <span className={'text-xs px-2 py-1 rounded-full font-semibold ' + statusStyle(a.status)}>{statusLabel(a.status)}</span>
                {hasMultiple && a.status !== 'completada' && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200">Visita {visitNumber} de {totalDoses}</span>}
              </div>
              <div className="font-semibold text-slate-900">{a.patientName} · {a.patientPhone}</div>
              <div className="text-sm text-slate-600 mt-1 flex items-start gap-1"><MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />{a.address}</div>
              {hasMultiple && <div className="text-xs text-purple-700 mt-1 font-semibold flex items-center gap-1"><Package className="w-3 h-3" /> Progreso: {completedDoses}/{totalDoses} dosis completadas</div>}
            </div>
          </div>
          <div className="space-y-2 mt-2">{a.beneficiaries.map(b => <BeneficiaryLine key={b.id} b={b} services={services} evolution={a.evolutions && a.evolutions[b.id]} />)}</div>
          {a.notes && <div className="text-sm text-slate-600 mt-2 p-2 bg-slate-50 rounded-lg"><strong>Notas:</strong> {a.notes}</div>}
          <div className="flex gap-2 mt-3 flex-wrap">
            {a.status !== 'completada' && <button onClick={() => onComplete(a)} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-semibold flex items-center gap-1"><Check className="w-4 h-4" />{hasMultiple ? 'Registrar visita' : 'Completar con evolución'}</button>}
            <button onClick={() => onEdit(a)} className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-sm font-semibold flex items-center gap-1"><Edit className="w-4 h-4" />Editar</button>
            <a href={'https://wa.me/' + a.patientPhone.replace(/\D/g, '')} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-sm font-semibold flex items-center gap-1"><MessageCircle className="w-4 h-4" />WhatsApp</a>
          </div>
        </div>
        );
      })}
    </div>
  );
}

function WeekView({ appointments, services, onEdit }) {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const days = Array.from({length: 7}, (_, i) => addDays(weekStart, i));
  const navigateWeek = (delta) => setWeekStart(addDays(weekStart, delta * 7));

  return (
    <div>
      <div className="bg-white rounded-2xl p-4 border border-slate-200 mb-4 flex items-center justify-between flex-wrap gap-2">
        <button onClick={() => navigateWeek(-1)} className="p-2 rounded-lg hover:bg-slate-100"><ChevronDown className="w-5 h-5 rotate-90" /></button>
        <div className="text-sm font-bold text-slate-900">Semana del {weekStart.toLocaleDateString('es-CL', {day: 'numeric', month: 'short'})} al {days[6].toLocaleDateString('es-CL', {day: 'numeric', month: 'short', year: 'numeric'})}</div>
        <button onClick={() => navigateWeek(1)} className="p-2 rounded-lg hover:bg-slate-100"><ChevronDown className="w-5 h-5 -rotate-90" /></button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {days.map(d => {
          const dayIso = isoDate(d);
          const dayApps = appointments.filter(a => a.date === dayIso && a.status !== 'cancelada').sort((a, b) => a.time.localeCompare(b.time));
          const isToday = dayIso === todayISO();
          return (
            <div key={dayIso} className={'rounded-xl p-3 border ' + (isToday ? 'bg-teal-50 border-teal-300' : 'bg-white border-slate-200')}>
              <div className={'text-xs font-bold uppercase mb-1 ' + (isToday ? 'text-teal-700' : 'text-slate-500')}>{d.toLocaleDateString('es-CL', {weekday: 'short'})}</div>
              <div className="text-lg font-bold mb-2">{d.getDate()}</div>
              <div className="space-y-1">
                {dayApps.length === 0 ? <div className="text-xs text-slate-400">Sin visitas</div> : dayApps.map(a => (
                  <button key={a.id} onClick={() => onEdit(a)} className="w-full text-left text-xs p-2 rounded bg-white hover:bg-slate-50 border border-slate-200">
                    <div className="font-bold text-teal-700">{fmtTime(a.time)}</div>
                    <div className="truncate text-slate-700">{a.patientName}</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AllAppsView({ apps, services, professionals, onEdit }) {
  const [filter, setFilter] = useState('todas');
  const filtered = filter === 'todas' ? apps : apps.filter(a => a.status === filter);
  const sorted = filtered.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['todas','pendiente','asignada','en_tratamiento','completada','cancelada'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ' + (filter === f ? 'bg-teal-600 text-white' : 'bg-white text-slate-700 border border-slate-200')}>{f === 'en_tratamiento' ? 'en tratamiento' : f}</button>
        ))}
      </div>
      {sorted.length === 0 ? <EmptyState icon={Calendar} text="No hay atenciones" /> : (
        <div className="space-y-3">{sorted.map(a => (
          <div key={a.id} onClick={() => onEdit(a)} className="cursor-pointer">
            <AppointmentCard a={a} services={services} appointments={apps} professionals={professionals} />
          </div>
        ))}</div>
      )}
    </div>
  );
}

function PatientsList({ patients, appointments, search, setSearch, onSelect }) {
  return (
    <div>
      <div className="bg-white rounded-xl p-3 border border-slate-200 mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o teléfono..." className="flex-1 outline-none text-sm" />
      </div>
      {patients.length === 0 ? <EmptyState icon={Users} text="No hay pacientes registrados aún" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {patients.map(p => {
            const count = appointments.filter(a => a.patientId === p.id).length;
            return (
              <button key={p.id} onClick={() => onSelect(p)} className="bg-white rounded-xl p-4 border border-slate-200 hover:border-teal-300 hover:shadow text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-teal-700" /></div>
                  <div className="min-w-0 flex-1"><div className="font-semibold text-slate-900 truncate">{p.name}</div><div className="text-xs text-slate-500 truncate">{p.phone}</div></div>
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-between mt-2"><span>{p.comuna || 'Sin comuna'}</span><span className="font-bold text-teal-700">{count} atenciones</span></div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PatientDetail({ patient, services, appointments, onBack }) {
  const sorted = appointments.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
  return (
    <div>
      <button onClick={onBack} className="text-sm text-teal-600 font-semibold mb-3">← Volver a pacientes</button>
      <div className="bg-white rounded-2xl p-5 border border-slate-200 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0"><User className="w-7 h-7 text-teal-700" /></div>
          <div><div className="font-bold text-lg text-slate-900">{patient.name}</div><div className="text-sm text-slate-500">{patient.phone}</div></div>
        </div>
        <div className="text-sm text-slate-600"><MapPin className="w-4 h-4 inline mr-1" />{patient.comuna || 'Sin comuna'}</div>
      </div>
      <h3 className="font-bold text-slate-900 mb-3">Historial ({sorted.length})</h3>
      {sorted.length === 0 ? <EmptyState icon={Calendar} text="Sin atenciones registradas" /> : <div className="space-y-3">{sorted.map(a => <AppointmentCard key={a.id} a={a} services={services} appointments={appointments} showEvolutions />)}</div>}
    </div>
  );
}

function RoutePlannerView({ appointments, services, user }) {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [startComuna, setStartComuna] = useState('Providencia');
  const dayApps = appointments.filter(a => a.date === selectedDate && (a.status === 'asignada' || a.status === 'confirmada') && (a.assignedTo === user.id || !a.assignedTo));
  const route = optimizeRoute(dayApps, startComuna);
  const totalTravelMinutes = route.reduce((s, v) => s + (v._travel ? v._travel.minutes : 0), 0);
  const totalKm = route.reduce((s, v) => s + (v._travel ? v._travel.km : 0), 0);

  const openGoogleMaps = () => {
    if (route.length === 0) return;
    const addresses = route.map(v => encodeURIComponent(v.address + ', Santiago, Chile'));
    const url = 'https://www.google.com/maps/dir/' + addresses.join('/');
    window.open(url, '_blank');
  };

  return (
    <div>
      <div className="bg-white rounded-2xl p-5 border border-slate-200 mb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Route className="w-5 h-5 text-teal-600" /> Planificador de rutas</h2>
            <p className="text-sm text-slate-500 mt-0.5">Orden óptimo de visitas con tiempos estimados</p>
          </div>
          {route.length > 0 && <button onClick={openGoogleMaps} className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold flex items-center gap-2"><Navigation className="w-4 h-4" /> Abrir en Google Maps</button>}
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">Fecha</label><input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">Punto de partida</label><select value={startComuna} onChange={e => setStartComuna(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">{COMUNAS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        </div>
      </div>

      {route.length === 0 ? <EmptyState icon={Route} text="No hay atenciones confirmadas para esta fecha" /> : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200"><div className="text-xs text-slate-500">Paradas</div><div className="text-2xl font-bold text-slate-900">{route.length}</div></div>
            <div className="bg-white rounded-xl p-4 border border-slate-200"><div className="text-xs text-slate-500">Distancia</div><div className="text-2xl font-bold text-slate-900">{Math.round(totalKm)} <span className="text-sm">km</span></div></div>
            <div className="bg-white rounded-xl p-4 border border-slate-200"><div className="text-xs text-slate-500">Tiempo</div><div className="text-2xl font-bold text-slate-900">{totalTravelMinutes} <span className="text-sm">min</span></div></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 font-bold text-sm text-slate-700 flex items-center gap-2"><Navigation className="w-4 h-4" /> Ruta optimizada</div>
            <div className="divide-y divide-slate-100">
              <div className="px-4 py-3 flex items-center gap-3 bg-blue-50/50">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">🏠</div>
                <div className="flex-1"><div className="font-semibold text-sm text-slate-900">Inicio: {startComuna}</div></div>
              </div>
              {route.map((v, idx) => {
                const traffic = v._travel ? v._travel.trafficLevel : 'medio';
                const trafficColors = { bajo: 'text-green-700', medio: 'text-amber-700', alto: 'text-red-700' };
                return (
                  <div key={v.id}>
                    <div className="px-4 py-2 bg-slate-50/50 text-xs text-slate-500 flex items-center gap-2">
                      <ChevronsRight className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold">{v._travel ? v._travel.minutes : 0} min</span>
                      <span>· {v._travel ? v._travel.km : 0} km</span>
                      <span className={'font-semibold ' + trafficColors[traffic]}>· Tráfico {traffic}</span>
                    </div>
                    <div className="px-4 py-4 flex items-start gap-3 hover:bg-slate-50">
                      <div className="w-8 h-8 rounded-full bg-teal-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 text-sm">{fmtTime(v.time)} · {v.patientName}</div>
                        <div className="text-xs text-slate-600 flex items-start gap-1"><MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" /> {v.address}</div>
                        <div className="text-xs text-teal-700 mt-1">Comuna: <strong>{v._comuna}</strong></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PendingView({ apps, services, user, onConfirm, onCancel, onEdit }) {
  const [confirmingId, setConfirmingId] = useState(null);

  const handleConfirm = async (id) => { setConfirmingId(id); await onConfirm(id); setConfirmingId(null); };

  if (apps.length === 0) return <EmptyState icon={CheckCircle} text="No hay solicitudes pendientes" />;
  return (
    <div className="space-y-3">
      {apps.map(a => {
        const isConfirming = confirmingId === a.id;
        return (
          <div key={a.id} className="bg-gradient-to-br from-amber-50/30 to-white rounded-2xl p-5 border border-amber-200">
            <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap"><span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold">PENDIENTE</span></div>
                <div className="font-semibold text-slate-900">{a.patientName} · {a.patientPhone}</div>
                <div className="text-sm text-slate-600 mt-1 flex flex-col sm:flex-row sm:gap-3 gap-1"><span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(a.date + 'T00:00').toLocaleDateString('es-CL')} · {fmtTime(a.time)}</span><span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{a.address}</span></div>
                {a.suggestedTime && <div className="text-xs text-amber-800 bg-amber-100 border border-amber-300 rounded px-2 py-1 mt-1 inline-flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Alternativa sugerida: {fmtTime(a.suggestedTime)}</div>}
                <div className="text-xs text-slate-500 mt-1"><span className="font-semibold text-teal-700">{fmtCLP(appNetPrice(a, services))}</span></div>
              </div>
            </div>
            <div className="space-y-2 mt-2">{a.beneficiaries.map(b => <BeneficiaryLine key={b.id} b={b} services={services} />)}</div>
            {a.notes && <div className="text-sm text-slate-600 mt-2 p-2 bg-white rounded-lg border border-slate-100"><strong>Notas:</strong> {a.notes}</div>}
            <div className="flex gap-2 mt-3 flex-wrap">
              <button onClick={() => handleConfirm(a.id)} disabled={isConfirming} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-semibold flex items-center gap-1 disabled:opacity-50"><Check className="w-4 h-4" />{isConfirming ? 'Confirmando...' : 'Confirmar y asignarme'}</button>
              <button onClick={() => onEdit(a)} className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-sm font-semibold flex items-center gap-1"><Edit className="w-4 h-4" />Modificar</button>
              <button onClick={() => onCancel(a.id)} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-semibold flex items-center gap-1"><X className="w-4 h-4" />Rechazar</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ServicesManager({ services, saveServices, appointments }) {
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const serviceUsage = (id) => appointments.filter(a => a.beneficiaries && a.beneficiaries.some(b => b.services && b.services.some(s => s.serviceId === id))).length;

  const saveSvc = async (svc) => { await saveServices(services.map(s => s.id === svc.id ? svc : s)); setEditing(null); };
  const deleteSvc = async (id) => { await saveServices(services.filter(s => s.id !== id)); setEditing(null); };
  const createSvc = async (svc) => { if (services.some(s => s.id === svc.id)) return { ok: false, error: 'ID duplicado' }; await saveServices(services.concat([svc])); setCreating(false); return { ok: true }; };
  const toggleActive = async (id) => { await saveServices(services.map(s => s.id === id ? { ...s, active: !s.active } : s)); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-slate-900">Gestión de Servicios</h2>
        <button onClick={() => setCreating(true)} className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold flex items-center gap-2"><Plus className="w-4 h-4" /> Nuevo servicio</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {services.map(s => {
          const Icon = getIconComponent(s.iconId);
          const usage = serviceUsage(s.id);
          return (
            <div key={s.id} className={'bg-white rounded-2xl p-5 border-2 ' + (!s.active ? 'border-slate-200 bg-slate-50/50 opacity-75' : 'border-slate-200')}>
              <div className="flex items-start gap-3 mb-3">
                <div className={'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ' + (s.active ? 'bg-gradient-to-br from-teal-500 to-blue-600' : 'bg-slate-300')}><Icon className="w-5 h-5 text-white" /></div>
                <div className="flex-1 min-w-0"><div className="font-semibold text-slate-900">{s.title}</div></div>
                <button onClick={() => toggleActive(s.id)} className={s.active ? 'text-green-600' : 'text-slate-400'}>{s.active ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}</button>
              </div>
              <p className="text-xs text-slate-600 mb-3 line-clamp-2">{s.desc}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 font-bold">{fmtCLP(s.price)}</span>
                {s.allowDoses && <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold uppercase flex items-center gap-1"><Package className="w-3 h-3" /> Paquetes</span>}
              </div>
              <div className="text-xs text-slate-400 mb-3">{usage > 0 ? usage + ' uso(s)' : 'Sin uso'}</div>
              <button onClick={() => setEditing(s)} className="w-full px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold flex items-center justify-center gap-1"><Edit className="w-4 h-4" /> Editar</button>
            </div>
          );
        })}
      </div>
      {editing && <ServiceModal mode="edit" service={editing} usage={serviceUsage(editing.id)} onSave={saveSvc} onDelete={deleteSvc} onClose={() => setEditing(null)} />}
      {creating && <ServiceModal mode="create" onSave={createSvc} onClose={() => setCreating(false)} />}
    </div>
  );
}

function ServiceModal({ mode, service, usage, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(service ? service.title : '');
  const [desc, setDesc] = useState(service ? service.desc : '');
  const [price, setPrice] = useState(service ? service.price : 0);
  const [iconId, setIconId] = useState(service ? service.iconId : 'syringe');
  const [allowDoses, setAllowDoses] = useState(service ? service.allowDoses : false);
  const [active, setActive] = useState(service ? service.active : true);
  const [confirmDel, setConfirmDel] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    setErr('');
    if (!title.trim() || !desc.trim() || price <= 0) return setErr('Completa todos los campos');
    if (mode === 'create') {
      const newId = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || ('svc-' + uid());
      const svcData = { id: newId, title: title.trim(), desc: desc.trim(), price: Math.round(price), iconId, allowDoses, active };
      const r = await onSave(svcData);
      if (r && !r.ok) setErr(r.error);
    } else {
      await onSave({ ...service, title: title.trim(), desc: desc.trim(), price: Math.round(price), iconId, allowDoses, active });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="font-bold text-slate-900">{mode === 'create' ? 'Nuevo servicio' : 'Editar servicio'}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">Título *</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">Descripción *</label><textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none" /></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">Precio (CLP) *</label><input type="number" min="0" step="1000" value={price} onChange={e => setPrice(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-2">Ícono</label>
            <div className="grid grid-cols-5 gap-1.5">
              {ICON_OPTIONS.map(opt => {
                const Ic = opt.icon;
                return <button key={opt.id} onClick={() => setIconId(opt.id)} title={opt.label} className={'w-full aspect-square rounded-lg border-2 flex items-center justify-center ' + (iconId === opt.id ? 'border-teal-600 bg-teal-50' : 'border-slate-200 bg-white')}><Ic className={'w-5 h-5 ' + (iconId === opt.id ? 'text-teal-700' : 'text-slate-500')} /></button>;
              })}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div><div className="text-sm font-semibold text-slate-900 flex items-center gap-1"><Package className="w-4 h-4 text-amber-600" /> Permitir paquetes</div><div className="text-xs text-slate-500">Múltiples dosis con frecuencia</div></div>
            <button onClick={() => setAllowDoses(!allowDoses)} className={allowDoses ? 'text-green-600' : 'text-slate-400'}>{allowDoses ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div><div className="text-sm font-semibold text-slate-900">Servicio activo</div><div className="text-xs text-slate-500">Visible para reservar</div></div>
            <button onClick={() => setActive(!active)} className={active ? 'text-green-600' : 'text-slate-400'}>{active ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}</button>
          </div>
          {err && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4" />{err}</div>}
        </div>
        <div className="px-5 py-4 border-t border-slate-200 flex gap-2 flex-wrap">
          <button onClick={submit} className="flex-1 py-2 rounded-lg bg-teal-600 text-white font-semibold text-sm">{mode === 'create' ? 'Crear' : 'Guardar'}</button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold text-sm">Cancelar</button>
          {mode === 'edit' && (confirmDel ? <button onClick={() => onDelete(service.id)} className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold text-sm">Confirmar eliminar</button> : <button onClick={() => setConfirmDel(true)} disabled={usage > 0} title={usage > 0 ? 'Servicio en uso, no se puede eliminar' : ''} className="px-4 py-2 rounded-lg bg-red-50 text-red-700 font-semibold text-sm disabled:opacity-50"><Trash2 className="w-4 h-4 inline" /></button>)}
        </div>
      </div>
    </div>
  );
}

function ProfessionalsManager({ professionals, saveProfessionals, currentUser }) {
  const [editing, setEditing] = useState(null);
  const pending = professionals.filter(p => !p.active);
  const active = professionals.filter(p => p.active);

  const approve = async (id) => { await saveProfessionals(professionals.map(p => p.id === id ? { ...p, active: true } : p)); };
  const reject = async (id) => { await saveProfessionals(professionals.filter(p => p.id !== id)); };
  const toggleActive = async (id) => { await saveProfessionals(professionals.map(p => p.id === id ? { ...p, active: !p.active } : p)); };
  const changeRole = async (id, role) => { await saveProfessionals(professionals.map(p => p.id === id ? { ...p, role: role } : p)); };
  const deletePro = async (id) => { await saveProfessionals(professionals.filter(p => p.id !== id)); setEditing(null); };

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-amber-600" /> Solicitudes pendientes ({pending.length})</h2>
          <div className="space-y-2">
            {pending.map(p => (
              <div key={p.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-semibold text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-600">@{p.username} · {p.email || 'sin email'}</div>
                  <div className="text-xs text-slate-500 mt-1">Solicitado el {new Date(p.createdAt).toLocaleDateString('es-CL')}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approve(p.id)} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-semibold flex items-center gap-1"><Check className="w-4 h-4" />Aprobar</button>
                  <button onClick={() => reject(p.id)} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-semibold flex items-center gap-1"><X className="w-4 h-4" />Rechazar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2"><UserCog className="w-5 h-5 text-teal-600" /> Profesionales activos ({active.length})</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {active.map(p => (
            <div key={p.id} className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-white" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">{p.name}<RoleBadge role={p.role} /></div>
                  <div className="text-xs text-slate-500">@{p.username}</div>
                  {p.email && <div className="text-xs text-slate-500">{p.email}</div>}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setEditing(p)} disabled={p.id === currentUser.id} className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-sm font-semibold flex items-center gap-1 disabled:opacity-50"><Edit className="w-4 h-4" />Editar</button>
                <select value={p.role} onChange={e => changeRole(p.id, e.target.value)} disabled={p.id === currentUser.id} className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-50"><option value="professional">Profesional</option><option value="admin">Administrador</option></select>
                <button onClick={() => toggleActive(p.id)} disabled={p.id === currentUser.id} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-semibold disabled:opacity-50">Desactivar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {editing && <EditProfessionalModal pro={editing} onSave={async (updates) => { await saveProfessionals(professionals.map(p => p.id === editing.id ? { ...p, ...updates } : p)); setEditing(null); }} onDelete={deletePro} onClose={() => setEditing(null)} />}
    </div>
  );
}

function EditProfessionalModal({ pro, onSave, onDelete, onClose }) {
  const [name, setName] = useState(pro.name);
  const [email, setEmail] = useState(pro.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmDel, setConfirmDel] = useState(false);

  const submit = async () => {
    const updates = { name: name.trim(), email: email.trim() };
    if (newPassword.length >= 6) updates.password = newPassword;
    await onSave(updates);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between"><h3 className="font-bold text-slate-900">Editar profesional</h3><button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X className="w-5 h-5" /></button></div>
        <div className="p-5 space-y-3">
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">Nombre</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">Nueva contraseña (opcional)</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Dejar vacío para no cambiar" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
        </div>
        <div className="px-5 py-4 border-t border-slate-200 flex gap-2">
          <button onClick={submit} className="flex-1 py-2 rounded-lg bg-teal-600 text-white font-semibold text-sm">Guardar</button>
          {confirmDel ? <button onClick={() => onDelete(pro.id)} className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold text-sm">Confirmar</button> : <button onClick={() => setConfirmDel(true)} className="px-4 py-2 rounded-lg bg-red-50 text-red-700 font-semibold text-sm"><Trash2 className="w-4 h-4" /></button>}
        </div>
      </div>
    </div>
  );
}

function EditAppointmentModal({ app, services, onSave, onClose, onCancelApp }) {
  const [date, setDate] = useState(app.date);
  const [time, setTime] = useState(app.time);
  const [address, setAddress] = useState(app.address);
  const [notes, setNotes] = useState(app.notes || '');
  const [status, setStatus] = useState(app.status);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white"><h3 className="font-bold text-slate-900">Editar atención</h3><button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X className="w-5 h-5" /></button></div>
        <div className="p-5 space-y-3">
          <div className="bg-slate-50 rounded-lg p-3 text-sm"><div className="font-semibold text-slate-900">{app.patientName}</div><div className="text-xs text-slate-500">{app.patientPhone}</div></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-semibold text-slate-600 block mb-1">Fecha</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
            <div><label className="text-xs font-semibold text-slate-600 block mb-1">Hora</label><input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
          </div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">Dirección</label><input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" /></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">Estado</label><select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"><option value="pendiente">Pendiente</option><option value="asignada">Asignada</option><option value="confirmada">Confirmada</option><option value="en_tratamiento">En tratamiento</option><option value="completada">Completada</option><option value="cancelada">Cancelada</option></select></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">Notas</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none" /></div>
          <div className="space-y-2 mt-2">{app.beneficiaries.map(b => <BeneficiaryLine key={b.id} b={b} services={services} />)}</div>
        </div>
        <div className="px-5 py-4 border-t border-slate-200 flex gap-2 flex-wrap">
          <button onClick={() => onSave({ id: app.id, date, time, address, notes, status })} className="flex-1 py-2 rounded-lg bg-teal-600 text-white font-semibold text-sm">Guardar</button>
          <button onClick={() => onCancelApp(app.id)} className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-semibold text-sm">Cancelar atención</button>
        </div>
      </div>
    </div>
  );
}

function EvolutionModal({ app, services, onSave, onClose }) {
  const [evolutions, setEvolutions] = useState({});

  const setBenEvolution = (benId, text) => setEvolutions({ ...evolutions, [benId]: text });
  const loadTemplate = (benId, serviceId) => {
    const tpl = TEMPLATES[serviceId];
    if (tpl) setBenEvolution(benId, tpl);
  };

  const allFilled = app.beneficiaries.every(b => (evolutions[b.id] || '').trim().length > 0);
  const totalDoses = app.beneficiaries.reduce((sum, b) => sum + b.services.reduce((s, it) => s + (it.doses || 1), 0), 0);
  const completedDoses = app.beneficiaries.reduce((sum, b) => sum + b.services.reduce((s, it) => s + (it.completedDoses || 0), 0), 0);
  const visitNumber = (app.visitNumber || 0) + 1;
  const isLastVisit = completedDoses + app.beneficiaries.reduce((sum, b) => sum + b.services.length, 0) >= totalDoses;
  const hasMultipleVisits = totalDoses > 1;
  const remainingAfter = totalDoses - (completedDoses + app.beneficiaries.reduce((sum, b) => sum + b.services.length, 0));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white"><h3 className="font-bold text-slate-900">{hasMultipleVisits ? 'Registrar visita · Evoluciones' : 'Completar atención · Evoluciones'}</h3><button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X className="w-5 h-5" /></button></div>
        <div className="p-5 space-y-4">
          <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 text-sm text-teal-900"><strong>{app.patientName}</strong> · {new Date(app.date + 'T00:00').toLocaleDateString('es-CL')} {fmtTime(app.time)}</div>
          {hasMultipleVisits && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-purple-800 flex items-center gap-1"><Package className="w-4 h-4" /> Visita {visitNumber} de {totalDoses}</span>
                <span className="text-xs font-semibold text-purple-700">{completedDoses}/{totalDoses} dosis completadas</span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden border border-purple-100">
                <div className="h-full bg-gradient-to-r from-purple-500 to-teal-500 transition-all" style={{width: (completedDoses / totalDoses * 100) + '%'}} />
              </div>
              <div className={'mt-2 text-xs flex items-center gap-1 ' + (isLastVisit ? 'text-green-700 font-semibold' : 'text-purple-700')}>
                {isLastVisit ? <><CheckCircle className="w-3.5 h-3.5" /> Esta es la última visita: al guardar, el tratamiento pasará a "completada"</> : <><AlertCircle className="w-3.5 h-3.5" /> Después de esta visita quedarán {remainingAfter} dosis. El estado pasará a "en tratamiento"</>}
              </div>
            </div>
          )}
          {app.beneficiaries.map(b => {
            const previousEvolution = app.evolutions && app.evolutions[b.id];
            return (
              <div key={b.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2"><User className="w-4 h-4 text-teal-700" /><div className="font-semibold text-slate-900 text-sm">{b.name}</div></div>
                {previousEvolution && (
                  <details className="mb-3">
                    <summary className="text-xs font-semibold text-slate-600 cursor-pointer hover:text-teal-700 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Ver historial de visitas previas</summary>
                    <div className="mt-2 p-2.5 bg-white rounded border border-slate-200 text-xs text-slate-700 whitespace-pre-line max-h-48 overflow-y-auto font-mono">{previousEvolution}</div>
                  </details>
                )}
                <div className="flex flex-wrap gap-1 mb-2">{b.services.map((it, i) => { const svc = getServiceById(services, it.serviceId); if (!svc) return null; return <button key={i} onClick={() => loadTemplate(b.id, svc.id)} className="text-xs px-2 py-0.5 rounded bg-white border border-teal-200 text-teal-700 hover:bg-teal-50">📋 {svc.title}</button>; })}</div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Evolución de esta visita</label>
                <textarea value={evolutions[b.id] || ''} onChange={e => setBenEvolution(b.id, e.target.value)} rows={6} placeholder="Registra la evolución de esta visita..." className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none font-mono" />
              </div>
            );
          })}
        </div>
        <div className="px-5 py-4 border-t border-slate-200 flex gap-2 sticky bottom-0 bg-white">
          <button onClick={() => onSave(app.id, evolutions)} disabled={!allFilled} className="flex-1 py-2 rounded-lg bg-green-600 text-white font-semibold text-sm disabled:opacity-50">{isLastVisit ? 'Completar tratamiento ✓' : 'Registrar visita y continuar tratamiento'}</button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold text-sm">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function MyProfile({ user, professionals, saveProfessionals, setUser }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [infoErr, setInfoErr] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [showPwdSection, setShowPwdSection] = useState(false);

  const saveInfo = async () => {
    setInfoMsg(''); setInfoErr('');
    if (!name.trim()) return setInfoErr('El nombre no puede estar vacío');
    const updated = professionals.map(p => p.id === user.id ? { ...p, name: name.trim(), email: email.trim() } : p);
    await saveProfessionals(updated);
    setUser({ ...user, name: name.trim(), email: email.trim() });
    setInfoMsg('Datos actualizados correctamente');
    setTimeout(() => setInfoMsg(''), 3000);
  };

  const changePassword = async () => {
    setPwdMsg(''); setPwdErr('');
    const fullPro = professionals.find(p => p.id === user.id);
    if (!fullPro) return setPwdErr('No se pudo verificar tu cuenta');
    if (!currentPassword) return setPwdErr('Ingresa tu contraseña actual');
    if (fullPro.password !== currentPassword) return setPwdErr('Contraseña actual incorrecta');
    if (newPassword.length < 6) return setPwdErr('La nueva contraseña debe tener al menos 6 caracteres');
    if (newPassword !== confirmPassword) return setPwdErr('Las contraseñas no coinciden');
    if (newPassword === currentPassword) return setPwdErr('La nueva contraseña debe ser distinta a la actual');
    const updated = professionals.map(p => p.id === user.id ? { ...p, password: newPassword } : p);
    await saveProfessionals(updated);
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    setPwdMsg('Contraseña actualizada correctamente');
    setTimeout(() => { setPwdMsg(''); setShowPwdSection(false); }, 3000);
  };

  const infoChanged = name.trim() !== user.name || email.trim() !== (user.email || '');

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><User className="w-5 h-5 text-teal-600" /> Mi perfil</h2>
      <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-4">
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center flex-shrink-0"><User className="w-8 h-8 text-white" /></div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg text-slate-900 flex items-center gap-2 flex-wrap">{user.name}<RoleBadge role={user.role} /></div>
            <div className="text-sm text-slate-500">@{user.username}</div>
          </div>
        </div>
        <h3 className="font-semibold text-slate-900 mb-3 text-sm">Información personal</h3>
        <div className="space-y-3">
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">Nombre completo</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 focus:outline-none" /></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.cl" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 focus:outline-none" /></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">Usuario</label><input type="text" value={user.username} disabled className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-slate-50 text-slate-500" /><p className="text-xs text-slate-400 mt-1">El nombre de usuario no se puede modificar</p></div>
          {infoMsg && <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-2"><CheckCircle className="w-4 h-4" />{infoMsg}</div>}
          {infoErr && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4" />{infoErr}</div>}
          <button onClick={saveInfo} disabled={!infoChanged} className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed">Guardar cambios</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-teal-600" /> Seguridad</h3>
          {!showPwdSection && <button onClick={() => setShowPwdSection(true)} className="text-sm text-teal-600 font-semibold hover:text-teal-700">Cambiar contraseña</button>}
        </div>
        {!showPwdSection ? (
          <p className="text-sm text-slate-500">Tu contraseña está protegida. Te recomendamos cambiarla periódicamente.</p>
        ) : (
          <div className="space-y-3">
            <div><label className="text-xs font-semibold text-slate-600 block mb-1">Contraseña actual *</label><input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 focus:outline-none" /></div>
            <div><label className="text-xs font-semibold text-slate-600 block mb-1">Nueva contraseña *</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="mínimo 6 caracteres" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 focus:outline-none" /></div>
            <div><label className="text-xs font-semibold text-slate-600 block mb-1">Confirmar nueva contraseña *</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="repite la nueva contraseña" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 focus:outline-none" onKeyDown={e => e.key === 'Enter' && changePassword()} /></div>
            {pwdMsg && <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-2"><CheckCircle className="w-4 h-4" />{pwdMsg}</div>}
            {pwdErr && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4" />{pwdErr}</div>}
            <div className="flex gap-2 flex-wrap">
              <button onClick={changePassword} className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold text-sm">Actualizar contraseña</button>
              <button onClick={() => { setShowPwdSection(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPwdErr(''); setPwdMsg(''); }} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold text-sm">Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return <div className="bg-white rounded-2xl p-12 text-center border border-slate-200"><Icon className="w-12 h-12 mx-auto text-slate-300 mb-3" /><p className="text-slate-500">{text}</p></div>;
}

function WhatsAppButton() {
  return <a href={'https://wa.me/' + WHATSAPP} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-2xl flex items-center justify-center transition hover:scale-110" title="WhatsApp"><MessageCircle className="w-7 h-7" /></a>;
}