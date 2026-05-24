import { supabase } from './supabase';
import { useState, useEffect } from 'react';
import {
  Pill, Activity, Syringe, Home as HomeIcon, Cross, Heart, BookOpen,
  Phone, MapPin, CheckCircle, Star, Shield, Calendar, User, UserPlus,
  LogOut, Plus, MessageCircle, Menu, X, FileText, Users, Trash2,
  Edit, Stethoscope, Award, Search, ArrowRight, Check, AlertCircle,
  ChevronDown, Tag, UserCog, Clock, Package, Bell, Route
} from 'lucide-react';

// ==================== CONSTANTES GLOBALES ====================
const PROFESSIONAL_NAME = 'Mariela Droguett';

const COMUNAS_RM = [
  "Alhué","Buin","Calera de Tango","Cerrillos","Cerro Navia","Colina","Conchalí",
  "Curacaví","El Bosque","El Monte","Estación Central","Huechuraba","Independencia",
  "Isla de Maipo","La Cisterna","La Florida","La Granja","La Pintana","La Reina",
  "Lampa","Las Condes","Lo Barnechea","Lo Espejo","Lo Prado","Macul","Maipú",
  "María Pinto","Melipilla","Ñuñoa","Padre Hurtado","Paine","Pedro Aguirre Cerda",
  "Peñaflor","Peñalolén","Pirque","Providencia","Pudahuel","Puente Alto","Quilicura",
  "Quinta Normal","Recoleta","Renca","San Bernardo","San Joaquín","San José de Maipo",
  "San Miguel","San Pedro","San Ramón","Santiago","Talagante","Tiltil","Vitacura"
].sort();

const DEFAULT_SERVICES = [
  { id: 'inj-anti', iconId: 'syringe', name: 'Inyección anticonceptiva', description: 'Aplicación de anticonceptivos hormonales con técnica estéril.', price: 15000, allowDoses: true, active: true },
  { id: 'inj-im', iconId: 'syringe', name: 'Inyección intramuscular', description: 'Administración de medicamentos por vía intramuscular.', price: 18000, allowDoses: true, active: true },
  { id: 'inj-ev', iconId: 'syringe', name: 'Inyección endovenosa', description: 'Administración de medicamentos por vía endovenosa.', price: 25000, allowDoses: true, active: true },
  { id: 'cur-simple', iconId: 'cross', name: 'Curación simple', description: 'Curación de heridas leves.', price: 18000, allowDoses: true, active: true },
  { id: 'cur-adv', iconId: 'activity', name: 'Curación avanzada', description: 'Pie diabético, úlceras y LPP.', price: 40000, allowDoses: true, active: true },
  { id: 'exam', iconId: 'file', name: 'Revisión de exámenes', description: 'Explicación, comentarios y derivaciones según corresponda.', price: 20000, allowDoses: false, active: true },
  { id: 'counsel', iconId: 'heart', name: 'Consejería presencial', description: 'Patologías crónicas, diabetes, hipertensión, salud mental.', price: 30000, allowDoses: false, active: true }
];

// ==================== UTILIDADES ====================
const fmtCLP = (n) => '$' + Math.round(n).toLocaleString('es-CL');

const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

const safeFind = (array, predicate) => Array.isArray(array) ? array.find(predicate) : undefined;
const safeFilter = (array, predicate) => Array.isArray(array) ? array.filter(predicate) : [];

// ==================== TELEGRAM ====================
const sendTelegramToAdmin = async (app, action = 'new', services = [], extraInfo = '') => {
  try {
    let text = `🔔 *Enfermereando - ${PROFESSIONAL_NAME}*\n\n`;
    if (action === 'new') text += `📌 *NUEVA SOLICITUD DE ATENCIÓN*\n`;
    else if (action === 'cancelled') text += `❌ *ATENCIÓN CANCELADA*\n`;
    else if (action === 'status_change') text += `🔄 *CAMBIO DE ESTADO*\n`;
    else if (action === 'task_taken') text += `✅ *TAREA TOMADA*\n`;
    else if (action === 'dose_update') text += `📊 *DOSIS ACTUALIZADAS*\n`;

    text += `Paciente: ${app.patientName || app.beneficiaries?.[0]?.name || 'Sin nombre'}\n`;
    text += `Fecha: ${new Date(app.date).toLocaleDateString('es-CL')}\n`;
    text += `Hora: ${fmtTime(app.time)}\n`;
    text += `Comuna: ${app.comuna || 'No especificada'}\n`;
    if (extraInfo) text += `${extraInfo}\n`;

    const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) return false;

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' })
    });

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('❌ Error Telegram:', error);
    return false;
  }
};

function Landing({ setView, services = [] }) {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* NAVBAR */}
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-inner">🩺</div>
            <span className="text-3xl font-bold tracking-tighter text-gray-900">Enfermereando</span>
          </div>

          <div className="hidden md:flex items-center gap-9 text-sm font-medium text-gray-700">
            <a href="#servicios" className="hover:text-indigo-600 transition-colors">Servicios</a>
            <a href="#valores" className="hover:text-indigo-600 transition-colors">Valores</a>
            <a href="#testimonios" className="hover:text-indigo-600 transition-colors">Testimonios</a>
          </div>

          <a
            href="https://wa.me/56912345678"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-7 py-3 rounded-3xl transition-all shadow-md"
          >
            <span className="text-xl">💬</span>
            <span>WhatsApp</span>
          </a>

          <button
            onClick={() => setView('login')}
            className="px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-3xl transition-all text-sm"
          >
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-16 pb-20 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-sm font-medium px-6 py-2 rounded-3xl mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Atención disponible hoy en Santiago
          </div>

          <h1 className="text-6xl md:text-7xl font-bold leading-none tracking-tighter text-gray-900">
            Cuidados de enfermería<br />en la comodidad de tu hogar
          </h1>

          <p className="mt-8 text-2xl text-gray-600 max-w-xl">
            Profesionales certificadas con más de 15 años de experiencia. Rápido, seguro y con seguimiento en tiempo real.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={() => setView('login')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-semibold px-12 py-6 rounded-3xl transition-all active:scale-[0.97] shadow-xl flex items-center gap-3"
            >
              Solicitar Atención Ahora
              <span className="text-3xl leading-none">→</span>
            </button>
          </div>
        </div>

        <div className="md:col-span-5 relative">
          <div className="aspect-video bg-gradient-to-br from-indigo-100 to-blue-100 rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://picsum.photos/id/1005/1200/800"
              alt="Enfermera atendiendo paciente en su hogar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ==================== SERVICIOS DINÁMICOS ==================== */}
      <section id="servicios" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">Nuestros Servicios</h2>
            <p className="text-gray-600 mt-3">Atención profesional de enfermería a domicilio</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services
              .filter(service => service.active === true)
              .map(service => (
                <div
                  key={service.id}
                  className="bg-white rounded-3xl shadow hover:shadow-2xl transition-all p-8 flex flex-col"
                >
                  <div className="text-5xl mb-6">
                    {service.name.toLowerCase().includes('inyecci') && '💉'}
                    {service.name.toLowerCase().includes('curacion') && '🩸'}
                    {service.name.toLowerCase().includes('muestra') && '🧪'}
                    {service.name.toLowerCase().includes('geri') && '🧓'}
                    {!service.name.toLowerCase().match(/inyecci|curacion|muestra|geri/) && '🩺'}
                  </div>

                  <h3 className="font-bold text-2xl text-gray-900 mb-3">{service.name}</h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed flex-1">
                    {service.description || 'Servicio profesional de enfermería a domicilio'}
                  </p>

                  <div className="mt-8 pt-6 border-t flex items-baseline justify-between">
                    <div>
                      <span className="text-4xl font-semibold text-indigo-600">${service.price}</span>
                      <span className="text-gray-400 text-sm ml-1">CLP</span>
                    </div>
                    <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-4 py-2 rounded-3xl">Disponible</span>
                  </div>
                </div>
              ))}
          </div>

          {services.filter(s => s.active).length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No hay servicios activos en este momento
            </div>
          )}
        </div>
      </section>

      {/* VALORES */}
      <section id="valores" className="py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">Nuestros Valores</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-5xl mb-6">❤️</div>
              <h3 className="text-2xl font-semibold">Empatía</h3>
              <p className="text-gray-600 mt-4">Tratamos a cada paciente como parte de nuestra familia</p>
            </div>
            <div className="text-center p-8">
              <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-5xl mb-6">🔒</div>
              <h3 className="text-2xl font-semibold">Confianza</h3>
              <p className="text-gray-600 mt-4">Profesionales certificadas con años de experiencia</p>
            </div>
            <div className="text-center p-8">
              <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-5xl mb-6">⏱️</div>
              <h3 className="text-2xl font-semibold">Rapidez</h3>
              <p className="text-gray-600 mt-4">Respuesta en menos de 90 minutos en Santiago</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-700 py-20 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-5xl font-bold">¿Necesitas atención hoy?</h2>
          <p className="text-2xl mt-4 opacity-90">Solicita tu cita en menos de 60 segundos</p>
          <button
            onClick={() => setView('login')}
            className="mt-12 bg-white text-indigo-700 hover:bg-amber-100 text-2xl font-semibold px-16 py-7 rounded-3xl transition-all active:scale-95 shadow-2xl"
          >
            Solicitar Atención Ahora
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-10 text-center">
          <p className="text-sm opacity-60">Enfermereando © 2026 • Mariela Droguett • Enfermera Universitaria</p>
          <p className="text-xs opacity-40 mt-4">Atención profesional a domicilio en Santiago y Región Metropolitana</p>
        </div>
      </footer>

      {/* BOTÓN FLOTANTE WHATSAPP */}
      <a
        href="https://wa.me/56912345678"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 bg-green-500 hover:bg-green-600 text-white w-16 h-16 rounded-3xl flex items-center justify-center text-4xl shadow-2xl z-50 transition-transform hover:scale-110"
      >
        💬
      </a>
    </div>
  );
}

// ==================== APPOINTMENT CARD ====================
function AppointmentCard({ app, onCancel }) {
  if (!app) return null;

  const statusColor = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    asignada: 'bg-blue-100 text-blue-700',
    en_tratamiento: 'bg-purple-100 text-purple-700',
    completada: 'bg-green-100 text-green-700',
    cancelada: 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white rounded-3xl shadow p-6 hover:shadow-xl transition-all">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-lg">{app.patientName || app.beneficiaries?.[0]?.name || 'Sin nombre'}</p>
          <p className="text-gray-500">
            {new Date(app.date).toLocaleDateString('es-CL')} • {app.time}
          </p>
          <p className="text-sm text-gray-600">{app.comuna}</p>
        </div>
        <span className={`px-4 py-1 rounded-2xl text-xs font-medium ${statusColor[app.status] || 'bg-gray-100'}`}>
          {app.status?.toUpperCase() || 'PENDIENTE'}
        </span>
      </div>

      {app.beneficiaries && app.beneficiaries.length > 1 && (
        <p className="text-xs text-gray-500 mt-3">
          +{app.beneficiaries.length - 1} beneficiarios
        </p>
      )}

      {onCancel && app.status !== 'cancelada' && (
        <button
          onClick={() => onCancel(app)}
          className="mt-6 text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
        >
          ✕ Cancelar cita
        </button>
      )}
    </div>
  );
}

// ==================== CALENDAR VIEW ====================
function CalendarView({ appointments = [], onEdit }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const safeAppointments = Array.isArray(appointments) ? appointments : [];

  const appointmentsByDate = {};
  safeAppointments.forEach(app => {
    if (app?.date) {
      const key = app.date;
      if (!appointmentsByDate[key]) appointmentsByDate[key] = [];
      appointmentsByDate[key].push(app);
    }
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  const firstDay = startOfMonth.getDay();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= endOfMonth.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  const goToPrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={goToPrevMonth}
          className="w-11 h-11 flex items-center justify-center text-3xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-2xl transition-all"
        >
          ←
        </button>
        <h2 className="text-2xl font-semibold text-gray-900 capitalize">
          {currentMonth.toLocaleString('es-CL', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={goToNextMonth}
          className="w-11 h-11 flex items-center justify-center text-3xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-2xl transition-all"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-2xl overflow-hidden mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="bg-white py-4 text-center text-sm font-medium text-gray-500">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-2xl overflow-hidden">
        {days.map((day, index) => {
          if (!day) return <div key={index} className="bg-white min-h-[130px]"></div>;
          const dateKey = day.toISOString().split('T')[0];
          const dayApps = appointmentsByDate[dateKey] || [];
          const todayHighlight = isToday(day);

          return (
            <div
              key={index}
              onClick={() => dayApps.length > 0 && typeof onEdit === 'function' && onEdit(dayApps[0])}
              className={`bg-white p-3 min-h-[130px] hover:bg-indigo-50 transition-colors border-t cursor-pointer ${
                todayHighlight ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''
              }`}
            >
              <div className={`text-right text-sm font-semibold ${todayHighlight ? 'text-indigo-600' : 'text-gray-700'}`}>
                {day.getDate()}
              </div>

              <div className="mt-3 space-y-1.5">
                {dayApps.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    className="text-xs px-3 py-2 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center gap-2 truncate"
                  >
                    <span className="font-medium">{app.time}</span>
                    <span className="opacity-70 truncate">
                      {app.patientName || app.beneficiaries?.[0]?.name || '—'}
                    </span>
                  </div>
                ))}
                {dayApps.length > 3 && (
                  <div className="text-center text-xs text-gray-400 font-medium">
                    +{dayApps.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== REQUEST FORM COMPLETO ====================
function RequestForm({ services = [], onSubmit, onCancel }) {
  const [beneficiaries, setBeneficiaries] = useState([{
    id: uid(),
    name: '',
    direccion: '',
    services: [{ serviceId: '', doses: 1, frequency: 'once' }]
  }]);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [comuna, setComuna] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!date) newErrors.date = 'La fecha es obligatoria';
    if (!time) newErrors.time = 'La hora es obligatoria';
    if (!comuna) newErrors.comuna = 'Selecciona una comuna';

    beneficiaries.forEach((ben, bIndex) => {
      if (!ben.name?.trim()) newErrors[`beneficiary-${bIndex}-name`] = 'El nombre es obligatorio';
      if (!ben.services || ben.services.every(s => !s.serviceId)) {
        newErrors[`beneficiary-${bIndex}-service`] = 'Debe seleccionar al menos un servicio';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addBeneficiary = () => {
    setBeneficiaries([...beneficiaries, {
      id: uid(),
      name: '',
      direccion: '',
      services: [{ serviceId: '', doses: 1, frequency: 'once' }]
    }]);
  };

  const removeBeneficiary = (index) => {
    if (beneficiaries.length === 1) return;
    setBeneficiaries(beneficiaries.filter((_, i) => i !== index));
  };

  const updateBeneficiary = (index, field, value) => {
    const updated = beneficiaries.map((ben, i) => i === index ? { ...ben, [field]: value } : ben);
    setBeneficiaries(updated);
  };

  const updateService = (bIndex, sIndex, field, value) => {
    const updated = beneficiaries.map((ben, i) => {
      if (i !== bIndex) return ben;
      const newServices = ben.services.map((srv, j) => j === sIndex ? { ...srv, [field]: value } : srv);
      return { ...ben, services: newServices };
    });
    setBeneficiaries(updated);
  };

  const addServiceToBeneficiary = (bIndex) => {
    const updated = beneficiaries.map((ben, i) => {
      if (i !== bIndex) return ben;
      return { ...ben, services: [...ben.services, { serviceId: '', doses: 1, frequency: 'once' }] };
    });
    setBeneficiaries(updated);
  };

  const removeServiceFromBeneficiary = (bIndex, sIndex) => {
    const updated = beneficiaries.map((ben, i) => {
      if (i !== bIndex) return ben;
      return { ...ben, services: ben.services.filter((_, j) => j !== sIndex) };
    });
    setBeneficiaries(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const baseAppointment = {
      id: uid(),
      patientName: beneficiaries[0].name,
      date,
      time,
      comuna,
      notes: notes || '',
      status: 'pendiente',
      assignedTo: null,
      beneficiaries: beneficiaries.map(b => ({
        id: b.id,
        name: b.name,
        direccion: b.direccion || 'No especificada',
        services: b.services.map(s => ({
          serviceId: s.serviceId,
          doses: parseInt(s.doses) || 1,
          frequency: s.frequency,
          completedDoses: 0
        }))
      }))
    };

    await sendTelegramToAdmin(baseAppointment, 'new', services);
    onSubmit([baseAppointment]);
    alert('✅ Solicitud enviada correctamente y notificada por Telegram');
    onCancel();
  };

  return (
    <div className="bg-white rounded-3xl shadow p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">Nueva Solicitud de Atención</h2>

      <form onSubmit={handleSubmit} className="space-y-10">
        {beneficiaries.map((ben, bIndex) => (
          <div key={ben.id} className="border border-gray-200 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">Beneficiario {bIndex + 1}</h3>
              {beneficiaries.length > 1 && (
                <button type="button" onClick={() => removeBeneficiary(bIndex)} className="text-red-500 hover:text-red-700 text-sm">Eliminar</button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre completo</label>
                <input
                  type="text"
                  value={ben.name}
                  onChange={(e) => updateBeneficiary(bIndex, 'name', e.target.value)}
                  className={`w-full px-5 py-4 rounded-3xl border ${errors[`beneficiary-${bIndex}-name`] ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nombre del beneficiario"
                />
                {errors[`beneficiary-${bIndex}-name`] && <p className="text-red-500 text-sm mt-1">{errors[`beneficiary-${bIndex}-name`]}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Dirección</label>
                <input
                  type="text"
                  value={ben.direccion}
                  onChange={(e) => updateBeneficiary(bIndex, 'direccion', e.target.value)}
                  className="w-full px-5 py-4 rounded-3xl border border-gray-300"
                  placeholder="Dirección completa"
                />
              </div>
            </div>

            {/* Servicios */}
            <div className="mt-8">
              <p className="text-sm font-medium text-gray-600 mb-3">Servicios solicitados</p>
              {ben.services.map((srv, sIndex) => (
                <div key={sIndex} className="flex gap-4 items-end mb-4">
                  <select
                    value={srv.serviceId}
                    onChange={(e) => updateService(bIndex, sIndex, 'serviceId', e.target.value)}
                    className={`flex-1 px-5 py-4 rounded-3xl border ${errors[`beneficiary-${bIndex}-service`] ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Seleccionar servicio</option>
                    {services.filter(s => s.active).map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} - ${s.price}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={srv.doses}
                    onChange={(e) => updateService(bIndex, sIndex, 'doses', e.target.value)}
                    className="w-24 px-5 py-4 rounded-3xl border border-gray-300 text-center"
                  />

                  <select
                    value={srv.frequency}
                    onChange={(e) => updateService(bIndex, sIndex, 'frequency', e.target.value)}
                    className="w-40 px-5 py-4 rounded-3xl border border-gray-300"
                  >
                    <option value="once">Única</option>
                    <option value="daily">Diaria</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>

                  {ben.services.length > 1 && (
                    <button type="button" onClick={() => removeServiceFromBeneficiary(bIndex, sIndex)} className="text-red-500 hover:text-red-700 px-4">✕</button>
                  )}
                </div>
              ))}

              <button type="button" onClick={() => addServiceToBeneficiary(bIndex)} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 mt-2">
                + Agregar otro servicio
              </button>
            </div>
          </div>
        ))}

        <button type="button" onClick={addBeneficiary} className="w-full py-4 border border-dashed border-gray-300 rounded-3xl text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
          + Agregar otro beneficiario
        </button>

        {/* Campos comunes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Fecha</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={`w-full px-5 py-4 rounded-3xl border ${errors.date ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Hora</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className={`w-full px-5 py-4 rounded-3xl border ${errors.time ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Comuna</label>
            <select value={comuna} onChange={e => setComuna(e.target.value)} className={`w-full px-5 py-4 rounded-3xl border ${errors.comuna ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Seleccionar comuna</option>
              {COMUNAS_RM.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.comuna && <p className="text-red-500 text-sm mt-1">{errors.comuna}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Notas / Observaciones</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full px-5 py-4 rounded-3xl border border-gray-300" placeholder="Información adicional..." />
        </div>

        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-3xl text-xl font-semibold transition-all">
          Enviar Solicitud
        </button>
      </form>
    </div>
  );
}

// ==================== PATIENT PORTAL ====================
function PatientPortal({ user, appointments = [], saveAppointments, services, setView }) {
  const [tab, setTab] = useState('inicio');

  const safeAppointments = Array.isArray(appointments) ? appointments : [];

  const myAppointments = safeFilter(safeAppointments, app => 
    app?.patientName === user?.name || 
    (app?.beneficiaries && app.beneficiaries.some(b => b?.name === user?.name))
  );

  const lastRequests = [...myAppointments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const cancelAppointment = async (app) => {
    if (!app || !confirm(`¿Cancelar la atención del ${new Date(app.date).toLocaleDateString('es-CL')}?`)) return;

    const isSeries = !!app.seriesId;
    let appointmentsToCancel = [app.id];

    if (isSeries) {
      const seriesApps = safeFilter(safeAppointments, a => a.seriesId === app.seriesId);
      const cancelAll = confirm(`Esta cita pertenece a una SERIE de ${seriesApps.length} dosis.\n\n¿Cancelar SOLO esta cita o TODA LA SERIE?`);
      if (cancelAll) appointmentsToCancel = seriesApps.map(a => a.id);
    }

    const updated = safeAppointments.map(a => 
      appointmentsToCancel.includes(a.id) ? { ...a, status: 'cancelada' } : a
    );

    await saveAppointments(updated);

    const representative = safeFind(safeAppointments, a => a.id === appointmentsToCancel[0]) || {};

    await sendTelegramToAdmin(representative, 'cancelled', services || [],
      appointmentsToCancel.length > 1 ? 'Serie completa cancelada' : ''
    );

    alert(appointmentsToCancel.length > 1 
      ? `✅ Toda la serie (${appointmentsToCancel.length} citas) ha sido cancelada.` 
      : '✅ Cita cancelada correctamente.'
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Panel de Paciente</h1>
          <p className="text-gray-600">Bienvenido, {user?.name || 'Paciente'}</p>
        </div>
        <button onClick={() => setView('landing')} className="text-gray-500 hover:text-gray-700">← Cerrar sesión</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button onClick={() => setTab('inicio')} className={`px-8 py-4 font-medium ${tab === 'inicio' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Inicio</button>
        <button onClick={() => setTab('solicitar')} className={`px-8 py-4 font-medium ${tab === 'solicitar' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Solicitar Atención</button>
        <button onClick={() => setTab('historial')} className={`px-8 py-4 font-medium ${tab === 'historial' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Historial</button>
      </div>

      {tab === 'inicio' && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Últimas solicitudes</h2>
          {lastRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-500">Aún no tienes solicitudes de atención.</div>
          ) : (
            <div className="grid gap-4">
              {lastRequests.map(app => <AppointmentCard key={app.id} app={app} onCancel={cancelAppointment} />)}
            </div>
          )}
        </div>
      )}

      {tab === 'solicitar' && (
        <RequestForm 
          services={services} 
          onSubmit={async (newApps) => {
            await saveAppointments([...safeAppointments, ...newApps]);
            setTab('inicio');
          }} 
          onCancel={() => setTab('inicio')}
        />
      )}

      {tab === 'historial' && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Historial completo</h2>
          {myAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-500">No tienes historial de solicitudes.</div>
          ) : (
            <div className="grid gap-4">
              {myAppointments.map(app => <AppointmentCard key={app.id} app={app} onCancel={cancelAppointment} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== PROFESSIONAL DASHBOARD ====================
function ProfessionalDashboard({ 
  user, 
  appointments = [], 
  saveAppointments, 
  services = [], 
  setView 
}) {
  const [tab, setTab] = useState('hoy');

  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const safeServices = Array.isArray(services) ? services : [];

  const allAppointments = [...safeAppointments].sort((a, b) => new Date(b.date) - new Date(a.date));

  const todayApps = allAppointments.filter(app => 
    new Date(app.date).toDateString() === new Date().toDateString()
  );

  const myTasks = allAppointments.filter(app => 
    app.assignedTo === user?.id || app.status === 'asignada'
  );

  // Acciones
  const takeTask = async (app) => {
    if (!app || app.status !== 'pendiente') return;
    const updated = safeAppointments.map(a => 
      a.id === app.id ? { ...a, status: 'asignada', assignedTo: user.id } : a
    );
    await saveAppointments(updated);
    await sendTelegramToAdmin(app, 'task_taken', safeServices, `Tomada por: ${user?.name}`);
    alert(`✅ Tarea tomada y notificado por Telegram`);
  };

  const updateStatus = async (appId, newStatus) => {
    const updated = safeAppointments.map(a => a.id === appId ? { ...a, status: newStatus } : a);
    await saveAppointments(updated);
    const app = updated.find(a => a.id === appId) || {};
    await sendTelegramToAdmin(app, 'status_change', safeServices);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel Profesional</h1>
          <p className="text-gray-600">Bienvenido, {user?.name || 'Profesional'}</p>
        </div>
        <button 
          onClick={() => setView('landing')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium"
        >
          ← Cerrar sesión
        </button>
      </div>

      {/* TABS */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        <button onClick={() => setTab('hoy')} className={`px-8 py-4 font-medium ${tab === 'hoy' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Hoy</button>
        <button onClick={() => setTab('mis')} className={`px-8 py-4 font-medium ${tab === 'mis' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Mis Atenciones</button>
        <button onClick={() => setTab('calendario')} className={`px-8 py-4 font-medium ${tab === 'calendario' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Calendario</button>
        <button onClick={() => setTab('monitoreo')} className={`px-8 py-4 font-medium ${tab === 'monitoreo' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Monitoreo</button>
      </div>

      {/* CONTENIDO */}
      {tab === 'hoy' && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Atenciones de Hoy ({todayApps.length})</h2>
          {todayApps.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-500">No hay atenciones para hoy.</div>
          ) : (
            <div className="grid gap-4">
              {todayApps.map(app => <AppointmentCard key={app.id} app={app} />)}
            </div>
          )}
        </div>
      )}

      {tab === 'mis' && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Mis Tareas Asignadas ({myTasks.length})</h2>
          {myTasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-500">No tienes tareas asignadas.</div>
          ) : (
            <div className="grid gap-4">
              {myTasks.map(app => (
                <div key={app.id} className="bg-white rounded-3xl p-6 shadow hover:shadow-xl transition-all">
                  <AppointmentCard app={app} />
                  <div className="flex gap-3 mt-6">
                    {app.status === 'pendiente' && (
                      <button onClick={() => takeTask(app)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-3xl font-medium">Tomar esta tarea</button>
                    )}
                    {app.status === 'asignada' && (
                      <>
                        <button onClick={() => updateStatus(app.id, 'en_tratamiento')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-3xl font-medium">Iniciar tratamiento</button>
                        <button onClick={() => updateStatus(app.id, 'completada')} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-3xl font-medium">Marcar como completada</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'calendario' && <CalendarView appointments={allAppointments} onEdit={(app) => alert(`Editar: ${app.patientName}`)} />}

      {tab === 'monitoreo' && (
        <MonitoringPanel 
          appointments={safeAppointments}
          services={safeServices}
          currentUser={user}
          saveAppointments={saveAppointments}
          onEdit={(app) => alert(`Ver detalle: ${app.patientName}`)}
        />
      )}
    </div>
  );
}

// ==================== ADMIN PANEL - COMPLETO Y MODERNO ====================
function AdminPanel({ 
  appointments = [], 
  saveAppointments, 
  services = [], 
  setServices, 
  setView 
}) {
  const [tab, setTab] = useState('servicios');

  const safeServices = Array.isArray(services) ? services : [];

  // Estados para nuevo servicio
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDescription, setNewServiceDescription] = useState('');
  const [priceError, setPriceError] = useState('');

  // ==================== FUNCIONES DE SERVICIOS ====================
  const addNewService = () => {
    if (!newServiceName.trim()) return alert('Debes ingresar un nombre de servicio');
    if (!newServicePrice || parseInt(newServicePrice) <= 0) {
      setPriceError('El precio debe ser mayor a 0');
      return;
    }

    const newService = {
      id: uid(),
      name: newServiceName.trim(),
      price: parseInt(newServicePrice),
      description: newServiceDescription.trim() || 'Sin descripción',
      active: true
    };

    setServices([...safeServices, newService]);
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDescription('');
    setPriceError('');
    alert('✅ Nuevo servicio agregado correctamente');
  };

  const toggleService = (id) => {
    const updated = safeServices.map(s => 
      s.id === id ? { ...s, active: !s.active } : s
    );
    setServices(updated);
  };

  const updateService = (id, field, value) => {
    const updated = safeServices.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    );
    setServices(updated);
  };

  const deleteService = (id) => {
    if (!confirm('¿Eliminar este servicio permanentemente?')) return;
    const updated = safeServices.filter(s => s.id !== id);
    setServices(updated);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600">Gestión completa del sistema</p>
        </div>
        <button 
          onClick={() => setView('landing')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium"
        >
          ← Cerrar sesión
        </button>
      </div>

      {/* TABS */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        <button onClick={() => setTab('servicios')} className={`px-8 py-4 font-medium ${tab === 'servicios' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Servicios</button>
        <button onClick={() => setTab('solicitudes')} className={`px-8 py-4 font-medium ${tab === 'solicitudes' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Solicitudes</button>
        <button onClick={() => setTab('seguimiento')} className={`px-8 py-4 font-medium ${tab === 'seguimiento' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Seguimiento de Dosis</button>
      </div>

      {/* ==================== SECCIÓN SERVICIOS (Rediseñada con descripción) ==================== */}
      {tab === 'servicios' && (
        <div className="bg-white rounded-3xl shadow p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">Gestión de Servicios</h2>
            <button 
              onClick={() => document.getElementById('newServiceForm').classList.toggle('hidden')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-3xl text-sm font-medium flex items-center gap-2"
            >
              + Nuevo Servicio
            </button>
          </div>

          {/* Formulario Nuevo Servicio */}
          <div id="newServiceForm" className="hidden bg-gray-50 border border-gray-200 rounded-3xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5">
                <input 
                  type="text" 
                  placeholder="Nombre del servicio" 
                  value={newServiceName}
                  onChange={e => setNewServiceName(e.target.value)}
                  className="w-full border border-gray-300 rounded-3xl px-5 py-4"
                />
              </div>
              <div className="md:col-span-2">
                <input 
                  type="number" 
                  placeholder="Precio CLP" 
                  value={newServicePrice}
                  onChange={e => {
                    setNewServicePrice(e.target.value);
                    setPriceError('');
                  }}
                  className="w-full border border-gray-300 rounded-3xl px-5 py-4"
                />
                {priceError && <p className="text-red-500 text-xs mt-1">{priceError}</p>}
              </div>
              <div className="md:col-span-4">
                <textarea 
                  placeholder="Descripción del servicio" 
                  value={newServiceDescription}
                  onChange={e => setNewServiceDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-3xl px-5 py-4 h-14 resize-y"
                />
              </div>
              <div className="md:col-span-1">
                <button onClick={addNewService} className="w-full h-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-medium">Agregar</button>
              </div>
            </div>
          </div>

          {/* Lista de servicios con nombre y descripción */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeServices.map(service => (
              <div key={service.id} className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-xl transition-all">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-xl text-gray-900">{service.name}</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={service.active} 
                      onChange={() => toggleService(service.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <p className="text-gray-600 text-sm mt-3 line-clamp-3">{service.description || 'Sin descripción'}</p>

                <div className="mt-6 flex items-center justify-between">
                  <button 
                    onClick={() => {
                      const newPrice = prompt('Nuevo precio para ' + service.name, service.price);
                      if (newPrice !== null && parseInt(newPrice) > 0) {
                        updateService(service.id, 'price', parseInt(newPrice));
                      }
                    }}
                    className="text-3xl font-bold text-gray-900 hover:text-indigo-600"
                  >
                    ${service.price}
                  </button>
                </div>

                <button 
                  onClick={() => deleteService(service.id)}
                  className="mt-8 w-full text-red-500 hover:text-red-700 text-sm font-medium py-3 border border-red-200 rounded-3xl hover:bg-red-50 transition-colors"
                >
                  🗑 Eliminar servicio
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Otras pestañas (Dashboard, Solicitudes, Seguimiento) */}
      {tab === 'solicitudes' && (
        <div className="bg-white rounded-3xl shadow p-8 text-gray-500">
          Lista de solicitudes (pendiente de implementar)
        </div>
      )}
      {tab === 'seguimiento' && (
        <div className="bg-white rounded-3xl shadow p-8 text-gray-500">
          Seguimiento de dosis (pendiente de implementar)
        </div>
      )}

      <div className="mt-12 text-center text-xs text-gray-400">
        Admin Panel • Enfermereando © 2026
      </div>
    </div>
  );
}

// ==================== LOGIN VIEW - COMPLETO CON VALIDACIÓN ====================
function LoginView({ 
  setView, 
  setUser, 
  patients = [], 
  professionals = [], 
  setPatients, 
  setProfessionals 
}) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const foundProfessional = professionals.find(p => 
        (p.email === email || p.username === email) && p.password === password
      );

      if (foundProfessional) {
        setUser(foundProfessional);
        setView(foundProfessional.role === 'admin' ? 'admin' : 'professional');
        return;
      }

      const foundPatient = patients.find(p => 
        (p.email === email || p.username === email) && p.password === password
      );

      if (foundPatient) {
        setUser(foundPatient);
        setView('patient');
        return;
      }

      setError('Credenciales incorrectas. Verifica email/usuario y contraseña.');
    } catch (err) {
      console.error(err);
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !password) {
      setError('Todos los campos son obligatorios');
      setLoading(false);
      return;
    }

    const exists = [...patients, ...professionals].some(u => 
      u.email === email || u.username === email
    );

    if (exists) {
      setError('Ya existe un usuario con ese email o nombre de usuario');
      setLoading(false);
      return;
    }

    const newUser = {
      id: uid(),
      name,
      email,
      username: email,
      password,
      role: 'patient',
      active: true
    };

    const updatedPatients = [...patients, newUser];
    await setPatients(updatedPatients);
    setUser(newUser);
    setView('patient');
    setLoading(false);
  };

  const handleRecovery = (e) => {
    if (e) e.preventDefault();
    alert('✅ Instrucciones de recuperación enviadas a tu correo (simulado)');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Enfermereando</h1>
          <p className="text-gray-600 mt-1">Inicia sesión o regístrate</p>
        </div>

        <div className="flex border-b mb-6">
          <button 
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-3 font-medium ${tab === 'login' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
          >
            Iniciar Sesión
          </button>
          <button 
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-3 font-medium ${tab === 'register' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
          >
            Registrarse
          </button>
          <button 
            onClick={() => { setTab('recovery'); setError(''); }}
            className={`flex-1 py-3 font-medium ${tab === 'recovery' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
          >
            Recuperar
          </button>
        </div>

        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <input 
              type="text" 
              placeholder="Email o usuario" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl px-5 py-4 mb-4 focus:outline-none focus:border-indigo-500"
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl px-5 py-4 mb-6 focus:outline-none focus:border-indigo-500"
            />
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-3xl transition-all"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <input 
              type="text" 
              placeholder="Nombre completo" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl px-5 py-4 mb-4 focus:outline-none focus:border-indigo-500"
            />
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl px-5 py-4 mb-4 focus:outline-none focus:border-indigo-500"
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl px-5 py-4 mb-6 focus:outline-none focus:border-indigo-500"
            />
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-3xl transition-all"
            >
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>
        )}

        {tab === 'recovery' && (
          <form onSubmit={handleRecovery}>
            <input 
              type="email" 
              placeholder="Email registrado" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl px-5 py-4 mb-6 focus:outline-none focus:border-indigo-500"
            />
            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-3xl transition-all"
            >
              Enviar instrucciones de recuperación
            </button>
          </form>
        )}

        {error && (
          <p className="mt-4 text-center text-red-600 text-sm font-medium">{error}</p>
        )}

        <button 
          onClick={() => setView('landing')}
          className="mt-8 text-gray-500 hover:text-gray-700 text-sm w-full"
        >
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
}

// ==================== MONITORING PANEL (versión final) ====================
function MonitoringPanel({ 
  appointments, 
  services, 
  currentUser, 
  saveAppointments,
  onEdit 
}) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [pendingChanges, setPendingChanges] = useState({});

  const isAdmin = currentUser?.role === 'admin';

  const safeAppointments = Array.isArray(appointments) ? appointments : [];

  const myAppointments = isAdmin 
    ? safeAppointments 
    : safeAppointments.filter(a => a.assignedTo === currentUser?.id);

  const filteredApps = filterStatus === 'all' 
    ? myAppointments 
    : myAppointments.filter(a => a.status === filterStatus);

  const updateField = async (appId, field, value) => {
    const updated = safeAppointments.map(app => 
      app.id === appId ? { ...app, [field]: value } : app
    );
    await saveAppointments(updated);
  };

  const updateDoses = (appId, completedDoses) => {
    setPendingChanges(prev => ({
      ...prev,
      [appId]: parseInt(completedDoses) || 0
    }));
  };

  const saveAllChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) return;

    const updatedAppointments = safeAppointments.map(app => {
      if (pendingChanges[app.id] === undefined) return app;
      return {
        ...app,
        beneficiaries: (app.beneficiaries || []).map(ben => ({
          ...ben,
          services: (ben.services || []).map(s => ({
            ...s,
            completedDoses: pendingChanges[app.id]
          }))
        }))
      };
    });

    await saveAppointments(updatedAppointments);
    setPendingChanges({});
    alert('✅ Todos los cambios de dosis han sido guardados');
  };

  return (
    <div className="bg-white rounded-3xl shadow p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Monitoreo de Atenciones</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {filteredApps.length} atenciones
          </div>
          {Object.keys(pendingChanges).length > 0 && (
            <button
              onClick={saveAllChanges}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-3xl text-sm font-medium flex items-center gap-2 transition-all"
            >
              💾 Guardar todos los cambios
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        {['all', 'pendiente', 'asignada', 'en_tratamiento', 'completada'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-5 py-2 rounded-3xl text-sm font-medium transition-all ${
              filterStatus === s 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {s === 'all' ? 'Todas' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filteredApps.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-3xl">
            No hay atenciones para mostrar con los filtros actuales
          </div>
        ) : (
          filteredApps.map(app => {
            const totalDoses = (app.beneficiaries || []).reduce((acc, ben) => {
              return acc + (ben.services || []).reduce((sum, srv) => sum + (srv.doses || 0), 0);
            }, 0);

            const completedDoses = (app.beneficiaries || []).reduce((acc, ben) => {
              return acc + (ben.services || []).reduce((sum, srv) => sum + (srv.completedDoses || 0), 0);
            }, 0);

            const progress = totalDoses > 0 ? Math.round((completedDoses / totalDoses) * 100) : 0;

            return (
              <div key={app.id} className="border border-gray-200 rounded-3xl p-6 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <div className="font-semibold text-lg">{app.patientName || app.beneficiaries?.[0]?.name}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(app.date).toLocaleDateString('es-CL')} • {app.time}
                    </div>
                  </div>
                  <button 
                    onClick={() => onEdit && onEdit(app)}
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                  >
                    Ver detalle →
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Progreso de dosis</span>
                    <span>{completedDoses} / {totalDoses}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-3xl overflow-hidden">
                    <div 
                      className="h-3 bg-indigo-600 transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Estado</label>
                    <select
                      value={app.status || 'pendiente'}
                      onChange={(e) => updateField(app.id, 'status', e.target.value)}
                      className="w-full px-4 py-3 rounded-3xl border border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="asignada">Asignada</option>
                      <option value="en_tratamiento">En tratamiento</option>
                      <option value="completada">Completada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Dosis completadas</label>
                    <input
                      type="number"
                      min="0"
                      value={completedDoses}
                      onChange={(e) => updateDoses(app.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-3xl border border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-500 mb-2">Notas / Observaciones</label>
                    <textarea
                      value={app.notes || ''}
                      onChange={(e) => updateField(app.id, 'notes', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-3xl border border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 resize-y"
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

// ==================== APP PRINCIPAL - VERSIÓN FINAL CONSOLIDADA ====================
export default function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carga inicial de datos
  useEffect(() => {
    (async () => {
      try {
        const svcs = await sget('enf:services', DEFAULT_SERVICES);
        let apps = (await sget('enf:appointments', [])).map(normalizeApp);
        const pats = await sget('enf:patients', []);
        let profs = await sget('enf:professionals', []);
        const notifs = await sget('enf:notifications', []);

        // Admin por defecto
        if (!profs.some(p => p.role === 'admin')) {
          profs = [{
            id: 'admin-default',
            username: 'admin',
            password: 'enfermera2026',
            name: PROFESSIONAL_NAME,
            email: 'marielads.enfermera@gmail.com',
            role: 'admin',
            active: true
          }].concat(profs);
        }

        setServices(svcs);
        setAppointments(apps);
        setPatients(pats);
        setProfessionals(profs);
      } catch (e) {
        console.error("Error cargando datos:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveAppointments = async (newList) => {
    setAppointments(newList);
    await sset('enf:appointments', newList);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando Enfermereando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* LANDING */}
      {view === 'landing' && <Landing setView={setView} services={services} />}

      {/* LOGIN */}
      {view === 'login' && (
        <LoginView
          setView={setView}
          setUser={setUser}
          patients={patients}
          professionals={professionals}
          setPatients={setPatients}
          setProfessionals={setProfessionals}
        />
      )}

      {/* PANEL PACIENTE */}
      {user && user.role === 'patient' && view === 'patient' && (
        <PatientPortal
          user={user}
          appointments={appointments}
          saveAppointments={saveAppointments}
          services={services}
          setView={setView}
        />
      )}

      {/* PANEL PROFESIONAL */}
      {user && (user.role === 'professional' || user.role === 'admin') && view === 'professional' && (
        <ProfessionalDashboard 
          user={user} 
          appointments={appointments} 
          saveAppointments={saveAppointments} 
          services={services} 
          setView={setView} 
        />
      )}

      {/* PANEL ADMIN */}
      {user && user.role === 'admin' && view === 'admin' && (
        <AdminPanel
          appointments={appointments}
          saveAppointments={saveAppointments}
          services={services}
          setServices={setServices}
          setView={setView}
        />
      )}
    </div>
  );
}

// ==================== PERSISTENCIA SUPABASE ====================
const sget = async (key, defaultValue = null) => {
  try {
    const { data, error } = await supabase.from('app_storage').select('value').eq('key', key).single();
    if (error) {
      console.error(`[sget] Error al obtener ${key}:`, error);
      return defaultValue;
    }
    return data ? data.value : defaultValue;
  } catch (err) {
    console.error(`[sget] Excepción al obtener ${key}:`, err);
    return defaultValue;
  }
};

const sset = async (key, value) => {
  try {
    const { error } = await supabase.from('app_storage').upsert({ key, value }, { onConflict: 'key' });
    if (error) {
      console.error(`[sset] Error al guardar ${key}:`, error);
      return false;
    }
    console.log(`[sset] ✅ Guardado correctamente: ${key}`);
    return true;
  } catch (err) {
    console.error(`[sset] Excepción al guardar ${key}:`, err);
    return false;
  }
};

// ==================== NORMALIZACIÓN Y VALIDACIÓN DE CITAS ====================
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

  fixed = normalizeApp(fixed);

  // Validación de integridad referencial
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

  // Servicios válidos
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

// ==================== FIN DEL ARCHIVO ====================

// ==================== FUNCIONES RESTANTES (de la versión original) ====================
const setupRealtimeNotifications = (userId, addNotification) => {
  if (!userId) return;
  // (Opcional: si usas notificaciones realtime con Supabase)
  console.log(`[Realtime] Suscrito a notificaciones para usuario: ${userId}`);
  // Aquí puedes implementar la suscripción realtime si lo necesitas en el futuro
};
