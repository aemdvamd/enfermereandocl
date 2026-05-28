import { supabase } from './supabase';
import dataLayer from './services/data';
import { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
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

// ==================== AUTH (Ciclo 2.2 - Supabase Auth) ====================
// Mapea el objeto de Supabase Auth al shape { id, name, email, role } que usa el resto del código.
// Compatibilidad: el resto del App.jsx sigue trabajando con `user.id`, `user.name`, `user.role`, etc.
const mapAuthUser = (supaUser) => {
  if (!supaUser) return null;
  const meta = supaUser.user_metadata || {};
  return {
    id: supaUser.id,
    email: supaUser.email,
    name: meta.name || supaUser.email?.split('@')[0] || 'Usuario',
    role: meta.role || 'patient', // por defecto, paciente
    phone: meta.phone || null,
  };
};

const authSignIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return mapAuthUser(data.user);
};

const authSignUp = async ({ email, password, name, phone }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role: 'patient', phone: phone || null },
      emailRedirectTo: `${window.location.origin}/`,
    },
  });
  if (error) throw error;
  // Si confirmación por email está activa, data.user existe pero data.session es null.
  // El usuario tiene que confirmar antes de poder iniciar sesión.
  return {
    user: mapAuthUser(data.user),
    needsConfirmation: !data.session,
  };
};

const authSignOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

const authResetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/`,
  });
  if (error) throw error;
};

const authGetCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return mapAuthUser(data.user);
};

// ==================== TELEGRAM ====================
const sendTelegramToAdmin = async (app, action = 'new', extraInfo = '') => {
  // Ciclo 2.1: el token de Telegram ya NO vive en el cliente.
  // Llamamos a nuestro endpoint serverless /api/telegram que actúa de intermediario.
  // Si la app se ejecuta en local sin el endpoint, falla silenciosamente (return false).
  try {
    const response = await fetch('/api/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        app: {
          patientName: app.patientName,
          beneficiaries: app.beneficiaries,
          date: app.date,
          time: app.time,
          comuna: app.comuna,
        },
        extraInfo,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error('[telegram] Endpoint respondió error:', response.status, errorBody);
      return false;
    }

    const result = await response.json();
    return result.ok === true;
  } catch (error) {
    console.error('[telegram] Error de red llamando al endpoint:', error);
    return false;
  }
};

function Landing({ setView, services = [] }) {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* NAVBAR - mobile-first */}
      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-4 lg:py-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src="/icons/icon-192.png"
              alt="Logo Enfermereando"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl shrink-0 object-cover"
            />
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tighter text-gray-900 truncate">Enfermereando</span>
          </div>

          {/* Links solo en desktop */}
          <div className="hidden lg:flex items-center gap-9 text-sm font-medium text-gray-700">
            <a href="#servicios" className="hover:text-indigo-600 transition-colors">Servicios</a>
            <a href="#valores" className="hover:text-indigo-600 transition-colors">Valores</a>
          </div>

          {/* CTAs: en móvil solo "Iniciar sesión" compacto; WhatsApp queda como FAB flotante */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="https://wa.me/56912345678"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
              className="hidden sm:flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 sm:px-5 lg:px-7 py-2.5 sm:py-3 rounded-3xl transition-all shadow-md min-h-[44px]"
            >
              <span className="text-lg">💬</span>
              <span className="hidden md:inline">WhatsApp</span>
            </a>

            <button
              onClick={() => setView('login')}
              className="px-4 sm:px-5 lg:px-7 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-3xl transition-all text-sm min-h-[44px]"
            >
              <span className="sm:hidden">Entrar</span>
              <span className="hidden sm:inline">Iniciar Sesión</span>
            </button>
          </div>
        </div>
      </nav>

      {/* HERO - mobile-first */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 lg:pt-16 pb-12 sm:pb-16 lg:pb-20 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-medium px-4 sm:px-6 py-2 rounded-3xl mb-4 sm:mb-6">
            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
            </span>
            Atención disponible hoy en Santiago
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight lg:leading-none tracking-tighter text-gray-900">
            Cuidados de enfermería<br className="hidden sm:block" /> en la comodidad de tu hogar
          </h1>

          <p className="mt-4 sm:mt-6 lg:mt-8 text-base sm:text-lg lg:text-2xl text-gray-600 max-w-xl">
            Profesionales certificadas. Servicio rápido, seguro y con seguimiento en tiempo real.
          </p>

          <div className="mt-6 sm:mt-8 lg:mt-10 flex flex-wrap gap-3 sm:gap-4">
            <button
              onClick={() => setView('login')}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-base sm:text-lg lg:text-xl font-semibold px-6 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 rounded-3xl transition-all active:scale-[0.97] shadow-xl flex items-center justify-center gap-3 min-h-[52px]"
            >
              Solicitar Atención Ahora
              <span className="text-2xl sm:text-3xl leading-none">→</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 order-1 lg:order-2 relative">
          <div className="aspect-video bg-gradient-to-br from-indigo-100 to-blue-100 rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://picsum.photos/id/1005/1200/800"
              alt="Enfermera atendiendo paciente en su hogar"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ==================== SERVICIOS DINÁMICOS ==================== */}
      <section id="servicios" className="bg-gray-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Nuestros Servicios</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-3">Atención profesional de enfermería a domicilio</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {services
              .filter(service => service?.active === true)
              .map(service => {
                const nameLower = (service?.name || '').toLowerCase();
                return (
                  <div
                    key={service.id}
                    className="bg-white rounded-3xl shadow hover:shadow-2xl transition-all p-5 sm:p-6 lg:p-8 flex flex-col"
                  >
                    <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">
                      {nameLower.includes('inyecci') && '💉'}
                      {nameLower.includes('curacion') && '🩸'}
                      {nameLower.includes('muestra') && '🧪'}
                      {nameLower.includes('geri') && '🧓'}
                      {!nameLower.match(/inyecci|curacion|muestra|geri/) && '🩺'}
                    </div>

                    <h3 className="font-bold text-lg sm:text-xl lg:text-2xl text-gray-900 mb-2 sm:mb-3">{service.name}</h3>

                    <p className="text-gray-600 text-sm leading-relaxed flex-1">
                      {service.description || 'Servicio profesional de enfermería a domicilio'}
                    </p>

                    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t flex items-baseline justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-indigo-600">{fmtCLP(service.price)}</span>
                      </div>
                      <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-3xl shrink-0">Disponible</span>
                    </div>
                  </div>
                );
              })}
          </div>

          {services.filter(s => s?.active).length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No hay servicios activos en este momento
            </div>
          )}
        </div>
      </section>

      {/* VALORES */}
      <section id="valores" className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Nuestros Valores</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="text-center p-5 sm:p-6 lg:p-8">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl mb-4 sm:mb-6">❤️</div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold">Empatía</h3>
              <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-4">Tratamos a cada paciente como parte de nuestra familia</p>
            </div>
            <div className="text-center p-5 sm:p-6 lg:p-8">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl mb-4 sm:mb-6">🔒</div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold">Confianza</h3>
              <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-4">Profesionales certificadas con años de experiencia</p>
            </div>
            <div className="text-center p-5 sm:p-6 lg:p-8">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl mb-4 sm:mb-6">⏱️</div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold">Rapidez</h3>
              <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-4">Respuesta en menos de 90 minutos en Santiago</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-700 py-12 sm:py-16 lg:py-20 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">¿Necesitas atención hoy?</h2>
          <p className="text-base sm:text-xl lg:text-2xl mt-3 sm:mt-4 opacity-90">Solicita tu cita en menos de 60 segundos</p>
          <button
            onClick={() => setView('login')}
            className="mt-8 sm:mt-10 lg:mt-12 w-full sm:w-auto bg-white text-indigo-700 hover:bg-amber-100 text-lg sm:text-xl lg:text-2xl font-semibold px-8 sm:px-12 lg:px-16 py-4 sm:py-5 lg:py-7 rounded-3xl transition-all active:scale-95 shadow-2xl min-h-[52px]"
          >
            Solicitar Atención Ahora
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-8 sm:py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <p className="text-xs sm:text-sm opacity-60">Enfermereando © 2026 • Mariela Droguett • Enfermera Universitaria</p>
          <p className="text-xs opacity-40 mt-2 sm:mt-4">Atención profesional a domicilio en Santiago y Región Metropolitana</p>
        </div>
      </footer>

      {/* BOTÓN FLOTANTE WHATSAPP - con safe area iOS */}
      <a
        href="https://wa.me/56912345678"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 bg-green-500 hover:bg-green-600 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl shadow-2xl z-50 transition-transform hover:scale-110 active:scale-95"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
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

// ==================== APPOINTMENT DETAIL MODAL ====================
// Modal reutilizable: muestra detalle completo de una cita y permite editar
// estado, servicios completados y dosis. Usado por: CalendarView, AdminPanel
// (tab Seguimiento) y MonitoringPanel (tab del Profesional).
function AppointmentDetailModal({ app, services = [], currentUser, onClose, onUpdated }) {
  const [working, setWorking] = useState(false);
  const [localStatus, setLocalStatus] = useState(app?.status || 'pendiente');
  const [localNotes, setLocalNotes] = useState(app?.notes || '');
  // editedDoses: { [appointmentServiceId]: number }
  const [editedDoses, setEditedDoses] = useState({});

  if (!app) return null;

  const findService = (svcId) => services.find(s => s.id === svcId);

  const totalDoses = (app.beneficiaries || []).reduce((sum, b) =>
    sum + (b.services || []).reduce((s, srv) => s + (srv.doses || 0), 0), 0);

  const completedTotal = (app.beneficiaries || []).reduce((sum, b) =>
    sum + (b.services || []).reduce((s, srv) => {
      const live = editedDoses[srv.id] !== undefined ? editedDoses[srv.id] : (srv.completedDoses || 0);
      return s + live;
    }, 0), 0);

  const progressPct = totalDoses > 0 ? Math.round((completedTotal / totalDoses) * 100) : 0;

  const handleSetDose = (srvRowId, value, maxDoses) => {
    const v = Math.max(0, Math.min(parseInt(value) || 0, maxDoses));
    setEditedDoses(prev => ({ ...prev, [srvRowId]: v }));
  };

  const handleToggleServiceComplete = (srv) => {
    // Si está al máximo lo bajamos a 0; si no, lo subimos al máximo
    const current = editedDoses[srv.id] !== undefined ? editedDoses[srv.id] : (srv.completedDoses || 0);
    const newVal = current >= srv.doses ? 0 : srv.doses;
    setEditedDoses(prev => ({ ...prev, [srv.id]: newVal }));
  };

  const handleSaveAll = async () => {
    setWorking(true);
    try {
      // 1. Persistir dosis cambiadas
      const dosePromises = Object.entries(editedDoses).map(([srvRowId, completed]) =>
        dataLayer.appointments.updateDoses(srvRowId, completed)
      );
      await Promise.all(dosePromises);

      // 2. Cambio de estado (si aplica)
      if (localStatus !== app.status) {
        await dataLayer.appointments.updateStatus(app.id, localStatus, currentUser?.id);
      }

      // 3. Cambio de notas (si aplica)
      if (localNotes !== (app.notes || '')) {
        await dataLayer.appointments.update(app.id, { notes: localNotes });
      }

      if (onUpdated) await onUpdated();
      onClose();
    } catch (e) {
      console.error('Error guardando cambios:', e);
      alert('❌ No se pudieron guardar todos los cambios. Revisa la consola.');
    } finally {
      setWorking(false);
    }
  };

  const hasChanges = localStatus !== app.status
    || localNotes !== (app.notes || '')
    || Object.keys(editedDoses).length > 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full sm:max-w-2xl max-h-[92vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 border-b flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              {app.patientName || app.beneficiaries?.[0]?.name || 'Cita'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {new Date(app.date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
              {' · '}{app.time}{' · '}{app.comuna}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none w-10 h-10 flex items-center justify-center shrink-0"
          >
            ×
          </button>
        </div>

        {/* CONTENIDO (scroll) */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 space-y-5 sm:space-y-6 overflow-y-auto flex-1">
          {/* Progreso global */}
          <div className="bg-gray-50 rounded-2xl p-4 sm:p-5">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm font-medium text-gray-700">Progreso global</span>
              <span className="text-2xl sm:text-3xl font-bold text-indigo-600">
                {completedTotal}<span className="text-gray-400 text-base">/{totalDoses}</span>
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 bg-indigo-600 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{progressPct}% completado</p>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={localStatus}
              onChange={(e) => setLocalStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-300 text-base focus:outline-none focus:border-indigo-500 min-h-[48px]"
            >
              <option value="pendiente">Pendiente</option>
              <option value="asignada">Asignada</option>
              <option value="en_tratamiento">En tratamiento</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 block text-xs mb-1">Teléfono</span>
              <a href={`tel:${app.phone}`} className="text-indigo-600 font-medium hover:underline">
                {app.phone || 'No disponible'}
              </a>
            </div>
            <div>
              <span className="text-gray-500 block text-xs mb-1">Solicitada</span>
              <span className="text-gray-700">
                {app.createdAt ? new Date(app.createdAt).toLocaleDateString('es-CL') : '—'}
              </span>
            </div>
          </div>

          {/* Beneficiarios y servicios */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Beneficiarios y servicios</h3>
            <div className="space-y-4">
              {(app.beneficiaries || []).map((ben, bIdx) => (
                <div key={ben.id || bIdx} className="border border-gray-200 rounded-2xl p-4">
                  <div className="font-medium text-gray-900 mb-1">{ben.name}</div>
                  {ben.direccion && (
                    <p className="text-xs text-gray-500 mb-3">📍 {ben.direccion}</p>
                  )}

                  <div className="space-y-3 mt-3">
                    {(ben.services || []).map((srv) => {
                      const svcInfo = findService(srv.serviceId);
                      const current = editedDoses[srv.id] !== undefined ? editedDoses[srv.id] : (srv.completedDoses || 0);
                      const isComplete = current >= srv.doses;
                      return (
                        <div
                          key={srv.id}
                          className={`rounded-2xl p-3 sm:p-4 transition-colors ${
                            isComplete ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="min-w-0">
                              <div className="font-medium text-sm text-gray-900">
                                {svcInfo?.name || srv.serviceId}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                Frecuencia: {srv.frequency || 'única'}
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleServiceComplete(srv)}
                              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium min-h-[36px] ${
                                isComplete
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white border border-gray-300 text-gray-700'
                              }`}
                            >
                              {isComplete ? '✓ Completo' : 'Marcar completo'}
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="text-xs text-gray-600 shrink-0">Dosis aplicadas:</label>
                            <input
                              type="number"
                              inputMode="numeric"
                              min="0"
                              max={srv.doses}
                              value={current}
                              onChange={(e) => handleSetDose(srv.id, e.target.value, srv.doses)}
                              className="w-20 px-3 py-2 rounded-xl border border-gray-300 text-base text-center min-h-[44px]"
                            />
                            <span className="text-xs text-gray-500">de {srv.doses}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas / Observaciones clínicas</label>
            <textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-gray-300 text-base focus:outline-none focus:border-indigo-500"
              placeholder="Observaciones..."
            />
          </div>
        </div>

        {/* FOOTER (acciones) */}
        <div
          className="px-5 sm:px-7 py-4 border-t bg-white flex flex-col-reverse sm:flex-row gap-3 shrink-0"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
        >
          <button
            onClick={onClose}
            disabled={working}
            className="flex-1 px-5 py-3 rounded-3xl border border-gray-300 text-gray-700 font-medium min-h-[48px] hover:bg-gray-50"
          >
            Cerrar
          </button>
          <button
            onClick={handleSaveAll}
            disabled={!hasChanges || working}
            className="flex-1 px-5 py-3 rounded-3xl bg-indigo-600 disabled:bg-gray-300 text-white font-semibold min-h-[48px] hover:bg-indigo-700"
          >
            {working ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== CALENDAR VIEW ====================
function CalendarView({ appointments = [], onEdit }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDayKey, setSelectedDayKey] = useState(null); // 'YYYY-MM-DD'

  const safeAppointments = Array.isArray(appointments) ? appointments : [];

  const appointmentsByDate = {};
  safeAppointments.forEach(app => {
    if (app?.date) {
      const key = app.date;
      if (!appointmentsByDate[key]) appointmentsByDate[key] = [];
      appointmentsByDate[key].push(app);
    }
  });

  // Ordenar citas del día por hora
  Object.keys(appointmentsByDate).forEach(key => {
    appointmentsByDate[key].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
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

  // Mapeo de status a color para los chips del calendario
  const statusColor = (status) => {
    if (status === 'pendiente') return 'bg-amber-100 text-amber-700';
    if (status === 'asignada') return 'bg-blue-100 text-blue-700';
    if (status === 'en_tratamiento') return 'bg-purple-100 text-purple-700';
    if (status === 'completada') return 'bg-emerald-100 text-emerald-700';
    if (status === 'cancelada') return 'bg-gray-100 text-gray-400 line-through';
    return 'bg-indigo-100 text-indigo-700';
  };

  const handleDayClick = (dayApps, dateKey) => {
    if (!dayApps || dayApps.length === 0) return;
    if (dayApps.length === 1) {
      // Atajo: si solo hay una cita, abrir directamente
      if (typeof onEdit === 'function') onEdit(dayApps[0]);
    } else {
      // Varias citas: abrir la vista del día con lista
      setSelectedDayKey(dateKey);
    }
  };

  const handleAppointmentClick = (app) => {
    setSelectedDayKey(null);
    if (typeof onEdit === 'function') onEdit(app);
  };

  const selectedDayApps = selectedDayKey ? (appointmentsByDate[selectedDayKey] || []) : [];

  return (
    <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <button
          onClick={goToPrevMonth}
          aria-label="Mes anterior"
          className="w-11 h-11 flex items-center justify-center text-2xl sm:text-3xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-2xl transition-all"
        >
          ←
        </button>
        <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 capitalize">
          {currentMonth.toLocaleString('es-CL', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={goToNextMonth}
          aria-label="Mes siguiente"
          className="w-11 h-11 flex items-center justify-center text-2xl sm:text-3xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-2xl transition-all"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-2xl overflow-hidden mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="bg-white py-2 sm:py-4 text-center text-[10px] sm:text-sm font-medium text-gray-500">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-2xl overflow-hidden">
        {days.map((day, index) => {
          if (!day) return <div key={index} className="bg-white min-h-[80px] sm:min-h-[130px]"></div>;
          const dateKey = day.toISOString().split('T')[0];
          const dayApps = appointmentsByDate[dateKey] || [];
          const todayHighlight = isToday(day);

          return (
            <button
              key={index}
              onClick={() => handleDayClick(dayApps, dateKey)}
              disabled={dayApps.length === 0}
              className={`bg-white p-1 sm:p-3 min-h-[80px] sm:min-h-[130px] text-left transition-colors border-t w-full ${
                dayApps.length > 0 ? 'hover:bg-indigo-50 cursor-pointer' : 'cursor-default'
              } ${todayHighlight ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''}`}
            >
              <div className={`text-right text-xs sm:text-sm font-semibold ${todayHighlight ? 'text-indigo-600' : 'text-gray-700'}`}>
                {day.getDate()}
              </div>

              <div className="mt-1 sm:mt-3 space-y-1">
                {dayApps.slice(0, 2).map((app) => (
                  <div
                    key={app.id}
                    className={`text-[10px] sm:text-xs px-1.5 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-2xl truncate ${statusColor(app.status)}`}
                  >
                    <span className="font-medium">{app.time}</span>
                    <span className="opacity-70 ml-1 hidden sm:inline">
                      {app.patientName || app.beneficiaries?.[0]?.name || '—'}
                    </span>
                  </div>
                ))}
                {dayApps.length > 2 && (
                  <div className="text-center text-[10px] sm:text-xs text-gray-400 font-medium">
                    +{dayApps.length - 2}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal de citas del día (cuando hay >1) */}
      {selectedDayKey && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedDayKey(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white w-full sm:max-w-lg max-h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 sm:px-7 py-4 sm:py-5 border-b flex items-start justify-between gap-3 shrink-0">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 capitalize">
                  {new Date(selectedDayKey).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {selectedDayApps.length} atenciones programadas
                </p>
              </div>
              <button
                onClick={() => setSelectedDayKey(null)}
                aria-label="Cerrar"
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none w-10 h-10 flex items-center justify-center shrink-0"
              >
                ×
              </button>
            </div>

            <div className="px-5 sm:px-7 py-4 overflow-y-auto flex-1 space-y-2"
                 style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
              {selectedDayApps.map(app => (
                <button
                  key={app.id}
                  onClick={() => handleAppointmentClick(app)}
                  className="w-full text-left bg-gray-50 hover:bg-indigo-50 rounded-2xl p-4 transition-colors border border-transparent hover:border-indigo-200"
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="font-semibold text-gray-900">{app.time}</span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    {app.patientName || app.beneficiaries?.[0]?.name || '—'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    📍 {app.comuna}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== REQUEST FORM COMPLETO ====================
function RequestForm({ user, services = [], onSubmit, onCancel }) {
  const [beneficiaries, setBeneficiaries] = useState([{
    id: uid(),
    name: user?.name || '',  // Ciclo 1: pre-rellenar con el usuario logueado
    direccion: '',
    services: [{ serviceId: '', doses: 1, frequency: 'once' }]
  }]);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [comuna, setComuna] = useState('');
  const [phone, setPhone] = useState('');  // Ciclo 1: contacto obligatorio
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const todayStr = new Date().toISOString().split('T')[0];
    if (!date) newErrors.date = 'La fecha es obligatoria';
    else if (date < todayStr) newErrors.date = 'La fecha no puede ser anterior a hoy';
    if (!time) newErrors.time = 'La hora es obligatoria';
    if (!comuna) newErrors.comuna = 'Selecciona una comuna';
    if (!phone || !/^[+]?[\d\s()-]{8,}$/.test(phone.trim())) {
      newErrors.phone = 'Ingresa un teléfono de contacto válido';
    }

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

    // Ciclo 3.2: crear cita vía capa de datos (insert atómico en 3 tablas)
    try {
      const created = await dataLayer.appointments.create({
        userId: user?.id || null,
        patientName: beneficiaries[0].name,
        date,
        time,
        comuna,
        phone: phone.trim(),
        notes: notes || '',
        beneficiaries: beneficiaries.map(b => ({
          name: b.name,
          direccion: b.direccion || 'No especificada',
          services: b.services.map(s => ({
            serviceId: s.serviceId,
            doses: parseInt(s.doses) || 1,
            frequency: s.frequency,
          })),
        })),
      });

      // Notificación a Telegram (no bloqueante, falla silenciosa)
      await sendTelegramToAdmin(created, 'new');

      alert('✅ Solicitud enviada correctamente');
      if (onSubmit) await onSubmit();
      onCancel();
    } catch (err) {
      console.error('[RequestForm] error al crear cita:', err);
      alert(`❌ Error al crear la solicitud: ${err.message || 'error desconocido'}`);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 text-gray-900">Nueva Solicitud de Atención</h2>

      <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
        {beneficiaries.map((ben, bIndex) => (
          <div key={ben.id} className="border border-gray-200 rounded-3xl p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="font-semibold text-base sm:text-lg">Beneficiario {bIndex + 1}</h3>
              {beneficiaries.length > 1 && (
                <button type="button" onClick={() => removeBeneficiary(bIndex)} className="text-red-500 hover:text-red-700 text-sm min-h-[44px] px-2">Eliminar</button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre completo</label>
                <input
                  type="text"
                  autoComplete="name"
                  value={ben.name}
                  onChange={(e) => updateBeneficiary(bIndex, 'name', e.target.value)}
                  className={`w-full px-4 sm:px-5 py-3 sm:py-4 text-base rounded-3xl border min-h-[48px] ${errors[`beneficiary-${bIndex}-name`] ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nombre del beneficiario"
                />
                {errors[`beneficiary-${bIndex}-name`] && <p className="text-red-500 text-sm mt-1">{errors[`beneficiary-${bIndex}-name`]}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Dirección</label>
                <input
                  type="text"
                  autoComplete="street-address"
                  value={ben.direccion}
                  onChange={(e) => updateBeneficiary(bIndex, 'direccion', e.target.value)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 text-base rounded-3xl border border-gray-300 min-h-[48px]"
                  placeholder="Dirección completa"
                />
              </div>
            </div>

            {/* Servicios — fila apilada en móvil */}
            <div className="mt-6 sm:mt-8">
              <p className="text-sm font-medium text-gray-600 mb-3">Servicios solicitados</p>
              {ben.services.map((srv, sIndex) => (
                <div key={sIndex} className="bg-gray-50 rounded-3xl p-3 sm:p-0 sm:bg-transparent mb-3 sm:mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1 sm:hidden">Servicio</label>
                      <select
                        value={srv.serviceId}
                        onChange={(e) => updateService(bIndex, sIndex, 'serviceId', e.target.value)}
                        className={`w-full px-4 sm:px-5 py-3 sm:py-4 text-base rounded-3xl border min-h-[48px] ${errors[`beneficiary-${bIndex}-service`] ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Seleccionar servicio</option>
                        {services.filter(s => s.active).map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} - {fmtCLP(s.price)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-3 sm:gap-4 items-end">
                      <div className="flex-1 sm:flex-none">
                        <label className="block text-xs font-medium text-gray-500 mb-1 sm:hidden">Dosis</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          value={srv.doses}
                          onChange={(e) => updateService(bIndex, sIndex, 'doses', e.target.value)}
                          className="w-full sm:w-24 px-4 sm:px-5 py-3 sm:py-4 text-base rounded-3xl border border-gray-300 text-center min-h-[48px]"
                        />
                      </div>

                      <div className="flex-1 sm:flex-none">
                        <label className="block text-xs font-medium text-gray-500 mb-1 sm:hidden">Frecuencia</label>
                        <select
                          value={srv.frequency}
                          onChange={(e) => updateService(bIndex, sIndex, 'frequency', e.target.value)}
                          className="w-full sm:w-40 px-4 sm:px-5 py-3 sm:py-4 text-base rounded-3xl border border-gray-300 min-h-[48px]"
                        >
                          <option value="once">Única</option>
                          <option value="daily">Diaria</option>
                          <option value="weekly">Semanal</option>
                          <option value="monthly">Mensual</option>
                        </select>
                      </div>

                      {ben.services.length > 1 && (
                        <button type="button" onClick={() => removeServiceFromBeneficiary(bIndex, sIndex)} aria-label="Eliminar servicio" className="text-red-500 hover:text-red-700 px-3 min-h-[48px] min-w-[44px] flex items-center justify-center">✕</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" onClick={() => addServiceToBeneficiary(bIndex)} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 mt-2 min-h-[44px]">
                + Agregar otro servicio
              </button>
            </div>
          </div>
        ))}

        <button type="button" onClick={addBeneficiary} className="w-full py-4 border border-dashed border-gray-300 rounded-3xl text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors min-h-[52px] text-sm sm:text-base">
          + Agregar otro beneficiario
        </button>

        {/* Campos comunes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Fecha</label>
            <input type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)} className={`w-full px-4 sm:px-5 py-3 sm:py-4 text-base rounded-3xl border min-h-[48px] ${errors.date ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Hora</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className={`w-full px-4 sm:px-5 py-3 sm:py-4 text-base rounded-3xl border min-h-[48px] ${errors.time ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium mb-2">Comuna</label>
            <select value={comuna} onChange={e => setComuna(e.target.value)} className={`w-full px-4 sm:px-5 py-3 sm:py-4 text-base rounded-3xl border min-h-[48px] ${errors.comuna ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Seleccionar comuna</option>
              {COMUNAS_RM.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.comuna && <p className="text-red-500 text-sm mt-1">{errors.comuna}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Teléfono de contacto</label>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+56 9 1234 5678"
              className={`w-full px-4 sm:px-5 py-3 sm:py-4 text-base rounded-3xl border min-h-[48px] ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Notas / Observaciones</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-4 sm:px-5 py-3 sm:py-4 text-base rounded-3xl border border-gray-300 min-h-[48px]" placeholder="Información adicional..." />
          </div>
        </div>

        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white py-4 sm:py-5 rounded-3xl text-base sm:text-lg lg:text-xl font-semibold transition-all min-h-[52px]">
          Enviar Solicitud
        </button>
      </form>
    </div>
  );
}

// ==================== PATIENT PORTAL ====================
function PatientPortal({ user, appointments = [], reloadData, services, setView, onLogout }) {
  const [tab, setTab] = useState('inicio');

  const safeAppointments = Array.isArray(appointments) ? appointments : [];

  // Con RLS la lista que llega YA está filtrada por usuario (paciente solo ve sus citas).
  // Filtro adicional en JS no es necesario, pero lo mantenemos por simetría visual.
  const myAppointments = safeAppointments;

  const lastRequests = [...myAppointments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const cancelAppointment = async (app) => {
    if (!app || !confirm(`¿Cancelar la atención del ${new Date(app.date).toLocaleDateString('es-CL')}?`)) return;

    try {
      // Ciclo 3.2: cancelar vía dataLayer (registra evento + timestamp automáticamente)
      await dataLayer.appointments.updateStatus(app.id, 'cancelada', user?.id, {
        cancelledBy: 'patient',
      });

      // Notificación a Telegram (opcional, no bloqueante)
      await sendTelegramToAdmin(app, 'cancelled');

      // Refrescar lista
      if (reloadData) await reloadData();
      alert('✅ Cita cancelada correctamente.');
    } catch (err) {
      console.error('[PatientPortal] error cancelando:', err);
      alert(`❌ Error al cancelar: ${err.message || 'error desconocido'}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 lg:pb-6">
      <div className="flex justify-between items-start gap-3 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Mi Panel</h1>
          <p className="text-sm sm:text-base text-gray-600 truncate">Hola, {user?.name || 'Paciente'}</p>
        </div>
        <button
          onClick={() => onLogout ? onLogout() : setView('landing')}
          aria-label="Cerrar sesión"
          className="text-gray-500 hover:text-gray-700 text-sm shrink-0 min-h-[44px] flex items-center"
        >
          <span className="hidden sm:inline">← Cerrar sesión</span>
          <span className="sm:hidden text-2xl">↩</span>
        </button>
      </div>

      {/* Top tabs - solo desktop */}
      <div className="hidden lg:flex border-b border-gray-200 mb-8">
        <button onClick={() => setTab('inicio')} className={`px-8 py-4 font-medium min-h-[48px] ${tab === 'inicio' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Inicio</button>
        <button onClick={() => setTab('solicitar')} className={`px-8 py-4 font-medium min-h-[48px] ${tab === 'solicitar' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Solicitar Atención</button>
        <button onClick={() => setTab('historial')} className={`px-8 py-4 font-medium min-h-[48px] ${tab === 'historial' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Historial</button>
      </div>

      {tab === 'inicio' && (
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold">Últimas solicitudes</h2>
            <button
              onClick={() => setTab('solicitar')}
              className="lg:hidden bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-3xl min-h-[40px]"
            >
              + Nueva
            </button>
          </div>
          {lastRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center text-gray-500 text-sm sm:text-base">Aún no tienes solicitudes de atención.</div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {lastRequests.map(app => <AppointmentCard key={app.id} app={app} onCancel={cancelAppointment} />)}
            </div>
          )}
        </div>
      )}

      {tab === 'solicitar' && (
        <RequestForm
          user={user}
          services={services}
          onSubmit={async () => {
            if (reloadData) await reloadData();
            setTab('inicio');
          }}
          onCancel={() => setTab('inicio')}
        />
      )}

      {tab === 'historial' && (
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6">Historial completo</h2>
          {myAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center text-gray-500 text-sm sm:text-base">No tienes historial de solicitudes.</div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {myAppointments.map(app => <AppointmentCard key={app.id} app={app} onCancel={cancelAppointment} />)}
            </div>
          )}
        </div>
      )}

      {/* Bottom Nav - solo móvil/tablet, oculto en desktop */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex">
          <button
            onClick={() => setTab('inicio')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 min-h-[60px] ${tab === 'inicio' ? 'text-indigo-600' : 'text-gray-500'}`}
            aria-current={tab === 'inicio' ? 'page' : undefined}
          >
            <span className="text-2xl leading-none">🏠</span>
            <span className="text-xs font-medium">Inicio</span>
          </button>
          <button
            onClick={() => setTab('solicitar')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 min-h-[60px] ${tab === 'solicitar' ? 'text-indigo-600' : 'text-gray-500'}`}
            aria-current={tab === 'solicitar' ? 'page' : undefined}
          >
            <span className="text-2xl leading-none">➕</span>
            <span className="text-xs font-medium">Solicitar</span>
          </button>
          <button
            onClick={() => setTab('historial')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 min-h-[60px] ${tab === 'historial' ? 'text-indigo-600' : 'text-gray-500'}`}
            aria-current={tab === 'historial' ? 'page' : undefined}
          >
            <span className="text-2xl leading-none">📋</span>
            <span className="text-xs font-medium">Historial</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

// ==================== PROFESSIONAL DASHBOARD ====================
function ProfessionalDashboard({
  user,
  appointments = [],
  reloadData,
  services = [],
  setView,
  onLogout
}) {
  const [tab, setTab] = useState('hoy');
  const [detailAppointment, setDetailAppointment] = useState(null); // modal de detalle

  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const safeServices = Array.isArray(services) ? services : [];

  const allAppointments = [...safeAppointments].sort((a, b) => new Date(b.date) - new Date(a.date));

  const todayApps = allAppointments.filter(app => 
    new Date(app.date).toDateString() === new Date().toDateString()
  );

  // Ciclo 1: separar "mis tareas" de "disponibles".
  // Antes: filtro con OR exponía tareas asignadas a otras enfermeras.
  const myTasks = allAppointments.filter(app => 
    app.assignedTo === user?.id && app.status !== 'completada' && app.status !== 'cancelada'
  );

  const availableTasks = allAppointments.filter(app => 
    app.status === 'pendiente' && !app.assignedTo
  );

  // Acciones — Ciclo 3.2: vía dataLayer (registra timestamps + audit log automáticamente)
  const takeTask = async (app) => {
    if (!app || app.status !== 'pendiente') return;
    try {
      await dataLayer.appointments.updateStatus(app.id, 'asignada', user.id, {
        takenBy: user.name,
      });
      await sendTelegramToAdmin(app, 'task_taken', `Tomada por: ${user?.name}`);
      if (reloadData) await reloadData();
      alert(`✅ Tarea tomada y notificado por Telegram`);
    } catch (e) {
      console.error('Error tomando tarea:', e);
      alert('❌ No se pudo tomar la tarea. Inténtalo de nuevo.');
    }
  };

  const updateStatus = async (appId, newStatus) => {
    try {
      const updated = await dataLayer.appointments.updateStatus(appId, newStatus, user?.id);
      await sendTelegramToAdmin(updated, 'status_change');
      if (reloadData) await reloadData();
    } catch (e) {
      console.error('Error actualizando estado:', e);
      alert('❌ No se pudo actualizar el estado.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24 lg:pb-6">
      <div className="flex justify-between items-start gap-3 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Panel Profesional</h1>
          <p className="text-sm sm:text-base text-gray-600 truncate">Hola, {user?.name || 'Profesional'}</p>
        </div>
        <button
          onClick={() => onLogout ? onLogout() : setView('landing')}
          aria-label="Cerrar sesión"
          className="text-gray-500 hover:text-gray-700 text-sm font-medium shrink-0 min-h-[44px] flex items-center"
        >
          <span className="hidden sm:inline">← Cerrar sesión</span>
          <span className="sm:hidden text-2xl">↩</span>
        </button>
      </div>

      {/* Top tabs — solo desktop (≥lg) */}
      <div className="hidden lg:flex border-b border-gray-200 mb-8 overflow-x-auto">
        <button onClick={() => setTab('hoy')} className={`px-8 py-4 font-medium min-h-[48px] whitespace-nowrap ${tab === 'hoy' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Hoy ({todayApps.length})</button>
        <button onClick={() => setTab('mis')} className={`px-8 py-4 font-medium min-h-[48px] whitespace-nowrap ${tab === 'mis' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Mis Atenciones ({myTasks.length})</button>
        <button onClick={() => setTab('disponibles')} className={`px-8 py-4 font-medium min-h-[48px] whitespace-nowrap ${tab === 'disponibles' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Disponibles ({availableTasks.length})</button>
        <button onClick={() => setTab('calendario')} className={`px-8 py-4 font-medium min-h-[48px] whitespace-nowrap ${tab === 'calendario' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Calendario</button>
        <button onClick={() => setTab('monitoreo')} className={`px-8 py-4 font-medium min-h-[48px] whitespace-nowrap ${tab === 'monitoreo' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Monitoreo</button>
      </div>

      {/* Pill tabs móvil — scroll horizontal en la parte superior */}
      <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          <button onClick={() => setTab('hoy')} className={`px-4 py-2 rounded-3xl text-sm font-medium whitespace-nowrap min-h-[40px] ${tab === 'hoy' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Hoy · {todayApps.length}</button>
          <button onClick={() => setTab('mis')} className={`px-4 py-2 rounded-3xl text-sm font-medium whitespace-nowrap min-h-[40px] ${tab === 'mis' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Mis · {myTasks.length}</button>
          <button onClick={() => setTab('disponibles')} className={`px-4 py-2 rounded-3xl text-sm font-medium whitespace-nowrap min-h-[40px] ${tab === 'disponibles' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Libres · {availableTasks.length}</button>
          <button onClick={() => setTab('calendario')} className={`px-4 py-2 rounded-3xl text-sm font-medium whitespace-nowrap min-h-[40px] ${tab === 'calendario' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Calendario</button>
          <button onClick={() => setTab('monitoreo')} className={`px-4 py-2 rounded-3xl text-sm font-medium whitespace-nowrap min-h-[40px] ${tab === 'monitoreo' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Monitoreo</button>
        </div>
      </div>

      {/* CONTENIDO */}
      {tab === 'hoy' && (
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6">Atenciones de Hoy ({todayApps.length})</h2>
          {todayApps.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center text-gray-500 text-sm sm:text-base">No hay atenciones para hoy.</div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {todayApps.map(app => <AppointmentCard key={app.id} app={app} />)}
            </div>
          )}
        </div>
      )}

      {tab === 'mis' && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Mis Atenciones Activas ({myTasks.length})</h2>
          {myTasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-500">
              No tienes tareas asignadas. Revisa la pestaña "Disponibles" para tomar nuevas.
            </div>
          ) : (
            <div className="grid gap-4">
              {myTasks.map(app => (
                <div key={app.id} className="bg-white rounded-3xl p-6 shadow hover:shadow-xl transition-all">
                  <AppointmentCard app={app} />
                  <div className="flex gap-3 mt-6">
                    {app.status === 'asignada' && (
                      <>
                        <button onClick={() => updateStatus(app.id, 'en_tratamiento')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-3xl font-medium">Iniciar tratamiento</button>
                        <button onClick={() => updateStatus(app.id, 'completada')} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-3xl font-medium">Marcar como completada</button>
                      </>
                    )}
                    {app.status === 'en_tratamiento' && (
                      <button onClick={() => updateStatus(app.id, 'completada')} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-3xl font-medium">Marcar como completada</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'disponibles' && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Disponibles para tomar ({availableTasks.length})</h2>
          {availableTasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-500">No hay tareas disponibles en este momento.</div>
          ) : (
            <div className="grid gap-4">
              {availableTasks.map(app => (
                <div key={app.id} className="bg-white rounded-3xl p-6 shadow hover:shadow-xl transition-all">
                  <AppointmentCard app={app} />
                  <button onClick={() => takeTask(app)} className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-3xl font-medium">
                    Tomar esta tarea
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'calendario' && <CalendarView appointments={allAppointments} onEdit={(app) => setDetailAppointment(app)} />}

      {tab === 'monitoreo' && (
        <MonitoringPanel 
          appointments={safeAppointments}
          services={safeServices}
          currentUser={user}
          reloadData={reloadData}
          onEdit={(app) => setDetailAppointment(app)}
        />
      )}

      {/* Modal de detalle reutilizable */}
      {detailAppointment && (
        <AppointmentDetailModal
          app={detailAppointment}
          services={safeServices}
          currentUser={user}
          onClose={() => setDetailAppointment(null)}
          onUpdated={async () => {
            if (reloadData) await reloadData();
          }}
        />
      )}
    </div>
  );
}

// ==================== ADMIN PANEL - COMPLETO Y MODERNO ====================
function AdminPanel({
  user,
  appointments = [],
  reloadData,
  services = [],
  setView,
  onLogout
}) {
  const [tab, setTab] = useState('dashboard');
  const [detailAppointment, setDetailAppointment] = useState(null);

  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const safeServices = Array.isArray(services) ? services : [];

  // ==================== DASHBOARD STATES ====================
  const totalApps = safeAppointments.length;
  const pending = safeAppointments.filter(a => a.status === 'pendiente').length;
  const today = safeAppointments.filter(a => {
    const appDate = new Date(a.date);
    const now = new Date();
    return appDate.getFullYear() === now.getFullYear() &&
           appDate.getMonth() === now.getMonth() &&
           appDate.getDate() === now.getDate();
  }).length;
  const inTreatment = safeAppointments.filter(a => a.status === 'en_tratamiento').length;
  const completed = safeAppointments.filter(a => a.status === 'completada').length;

  // ==================== MÉTRICAS LEAN (Ciclo 3.3) ====================
  const leanMetrics = useMemo(() => {
    const cancelled = safeAppointments.filter(a => a.status === 'cancelada').length;

    // Helper: diferencia en horas entre dos timestamps ISO
    const hoursBetween = (start, end) => {
      if (!start || !end) return null;
      const ms = new Date(end).getTime() - new Date(start).getTime();
      if (isNaN(ms) || ms < 0) return null;
      return ms / (1000 * 60 * 60);
    };

    const avgOf = (arr) => {
      const valid = arr.filter(v => v !== null && !isNaN(v));
      if (valid.length === 0) return null;
      return valid.reduce((s, v) => s + v, 0) / valid.length;
    };

    // Lead time: createdAt → completedAt (solo citas completadas)
    const leadTimes = safeAppointments
      .filter(a => a.status === 'completada')
      .map(a => hoursBetween(a.createdAt, a.completedAt));

    // Response time: createdAt → assignedAt (citas que fueron asignadas)
    const responseTimes = safeAppointments
      .filter(a => a.assignedAt)
      .map(a => hoursBetween(a.createdAt, a.assignedAt));

    // Cycle time: assignedAt → completedAt (citas completadas que fueron asignadas)
    const cycleTimes = safeAppointments
      .filter(a => a.status === 'completada' && a.assignedAt)
      .map(a => hoursBetween(a.assignedAt, a.completedAt));

    const finished = completed + cancelled;
    const completionRate = finished > 0 ? Math.round((completed / finished) * 100) : null;
    const cancellationRate = finished > 0 ? Math.round((cancelled / finished) * 100) : null;

    // Tendencia: atenciones creadas por día en los últimos 14 días
    const trend = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
      const creadas = safeAppointments.filter(a => {
        if (!a.createdAt) return false;
        return new Date(a.createdAt).toISOString().split('T')[0] === dayStr;
      }).length;
      const completadas = safeAppointments.filter(a => {
        if (!a.completedAt) return false;
        return new Date(a.completedAt).toISOString().split('T')[0] === dayStr;
      }).length;
      trend.push({ dia: label, creadas, completadas });
    }

    // Distribución por estado (para gráfico de cumplimiento)
    const statusDistribution = [
      { name: 'Completadas', value: completed, color: '#059669' },
      { name: 'En tratamiento', value: inTreatment, color: '#9333ea' },
      { name: 'Asignadas', value: safeAppointments.filter(a => a.status === 'asignada').length, color: '#2563eb' },
      { name: 'Pendientes', value: pending, color: '#d97706' },
      { name: 'Canceladas', value: cancelled, color: '#9ca3af' },
    ].filter(s => s.value > 0);

    // Top servicios solicitados
    const serviceCounts = {};
    safeAppointments.forEach(a => {
      (a.beneficiaries || []).forEach(b => {
        (b.services || []).forEach(s => {
          serviceCounts[s.serviceId] = (serviceCounts[s.serviceId] || 0) + 1;
        });
      });
    });
    const topServices = Object.entries(serviceCounts)
      .map(([id, count]) => ({
        name: (safeServices.find(s => s.id === id)?.name || id).slice(0, 20),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const fmtHours = (h) => {
      if (h === null) return '—';
      if (h < 1) return `${Math.round(h * 60)} min`;
      if (h < 24) return `${h.toFixed(1)} h`;
      return `${(h / 24).toFixed(1)} días`;
    };

    return {
      cancelled,
      avgLeadTime: avgOf(leadTimes),
      avgResponseTime: avgOf(responseTimes),
      avgCycleTime: avgOf(cycleTimes),
      completionRate,
      cancellationRate,
      trend,
      statusDistribution,
      topServices,
      fmtHours,
    };
  }, [safeAppointments, safeServices, completed, inTreatment, pending]);

  // ==================== SERVICIOS STATES ====================
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDescription, setNewServiceDescription] = useState('');
  const [priceError, setPriceError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [tempName, setTempName] = useState('');
  const [tempPrice, setTempPrice] = useState('');
  const [tempDescription, setTempDescription] = useState('');

  // ==================== SEGUIMIENTO STATES ====================
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // ==================== FUNCIONES SERVICIOS ====================
  const addNewService = async () => {
    if (!newServiceName.trim()) return alert('❌ Ingresa el nombre del servicio');
    const priceNum = parseInt(newServicePrice);
    if (!priceNum || priceNum <= 0) {
      setPriceError('El precio debe ser mayor a 0');
      return;
    }
    const newService = {
      id: uid(),
      name: newServiceName.trim(),
      price: priceNum,
      description: newServiceDescription.trim() || 'Sin descripción',
    };
    try {
      await dataLayer.services.create(newService);
      if (reloadData) await reloadData();
      setNewServiceName('');
      setNewServicePrice('');
      setNewServiceDescription('');
      setPriceError('');
      setShowNewServiceForm(false);
      alert('✅ Servicio agregado correctamente');
    } catch (err) {
      console.error('Error creando servicio:', err);
      setPriceError(err.message || 'No se pudo crear el servicio');
    }
  };

  const toggleService = async (id) => {
    try {
      await dataLayer.services.toggleActive(id);
      if (reloadData) await reloadData();
    } catch (err) {
      console.error('Error toggle servicio:', err);
      alert('❌ No se pudo cambiar el estado del servicio.');
    }
  };

  const startEditing = (service) => {
    setEditingId(service.id);
    setTempName(service.name);
    setTempPrice(service.price.toString());
    setTempDescription(service.description || '');
  };

  const saveEditing = async (id) => {
    const priceNum = parseInt(tempPrice);
    if (!priceNum || priceNum <= 0) {
      setPriceError('El precio debe ser mayor a 0');
      return;
    }
    try {
      await dataLayer.services.update(id, {
        name: tempName,
        price: priceNum,
        description: tempDescription,
      });
      if (reloadData) await reloadData();
      setEditingId(null);
      setPriceError('');
    } catch (err) {
      console.error('Error guardando edición:', err);
      setPriceError(err.message || 'No se pudo guardar el cambio');
    }
  };

  const deleteService = async (id) => {
    if (!confirm('¿Eliminar este servicio permanentemente?')) return;
    try {
      await dataLayer.services.remove(id);
      if (reloadData) await reloadData();
    } catch (err) {
      console.error('Error eliminando servicio:', err);
      alert('❌ No se pudo eliminar el servicio. Puede tener citas asociadas.');
    }
  };

  // ==================== FUNCIONES SEGUIMIENTO ====================
  const filteredAppointments = safeAppointments.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = !searchTerm || 
      (app.patientName || (app.beneficiaries?.[0]?.name || '')).toLowerCase().includes(searchTerm.toLowerCase());
    let matchesDate = true;
    if (dateFrom) matchesDate = matchesDate && new Date(app.date) >= new Date(dateFrom);
    if (dateTo) matchesDate = matchesDate && new Date(app.date) <= new Date(dateTo);
    return matchesStatus && matchesSearch && matchesDate;
  });

  const updateTempDoses = (appId, beneficiaryIndex, serviceIndex, newValue) => {
    const key = `${appId}-${beneficiaryIndex}-${serviceIndex}`;
    setEditedDoses(prev => ({
      ...prev,
      [key]: Math.max(0, parseInt(newValue) || 0)
    }));
  };

  const saveDoseChanges = async (app) => {
    try {
      const promises = [];
      (app.beneficiaries || []).forEach((ben, bIndex) => {
        (ben.services || []).forEach((srv, sIndex) => {
          const key = `${app.id}-${bIndex}-${sIndex}`;
          if (editedDoses[key] !== undefined && srv.id) {
            const newCompleted = Math.min(editedDoses[key], srv.doses);
            promises.push(dataLayer.appointments.updateDoses(srv.id, newCompleted));
          }
        });
      });
      await Promise.all(promises);
      if (reloadData) await reloadData();
      setEditedDoses({});
      alert('✅ Dosis actualizadas y guardadas');
    } catch (err) {
      console.error('Error guardando dosis:', err);
      alert('❌ No se pudieron guardar las dosis.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="flex justify-between items-start gap-3 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 truncate">Panel de Administración</h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1 truncate">Gestión completa • Enfermereando</p>
        </div>
        <button
          onClick={() => onLogout ? onLogout() : setView('landing')}
          aria-label="Cerrar sesión"
          className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white border border-gray-300 hover:bg-gray-100 rounded-3xl text-xs sm:text-sm font-medium transition-all shrink-0 min-h-[44px]"
        >
          <span className="hidden sm:inline">← Cerrar sesión</span>
          <span className="sm:hidden">← Salir</span>
        </button>
      </div>

      {/* TABS - scroll horizontal en móvil, fit en desktop */}
      <div className="flex mb-6 sm:mb-8 overflow-x-auto bg-white rounded-3xl p-1 shadow-sm scrollbar-hide gap-1">
        <button
          onClick={() => setTab('dashboard')}
          className={`shrink-0 sm:flex-1 md:flex-none px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-3xl transition-all min-h-[44px] whitespace-nowrap ${tab === 'dashboard' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          📊 <span className="hidden xs:inline sm:inline">Dashboard</span>
        </button>
        <button
          onClick={() => setTab('solicitudes')}
          className={`shrink-0 sm:flex-1 md:flex-none px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-3xl transition-all min-h-[44px] whitespace-nowrap ${tab === 'solicitudes' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          📋 Solicitudes
        </button>
        <button
          onClick={() => setTab('seguimiento')}
          className={`shrink-0 sm:flex-1 md:flex-none px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-3xl transition-all min-h-[44px] whitespace-nowrap ${tab === 'seguimiento' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          📈 <span className="hidden sm:inline">Seguimiento</span><span className="sm:hidden">Dosis</span>
        </button>
        <button
          onClick={() => setTab('calendario')}
          className={`shrink-0 sm:flex-1 md:flex-none px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-3xl transition-all min-h-[44px] whitespace-nowrap ${tab === 'calendario' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          📅 Calendario
        </button>
        <button
          onClick={() => setTab('servicios')}
          className={`shrink-0 sm:flex-1 md:flex-none px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-3xl transition-all min-h-[44px] whitespace-nowrap ${tab === 'servicios' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          🛠️ Servicios
        </button>
      </div>

      {/* ==================== DASHBOARD ==================== */}
      {tab === 'dashboard' && (
        <div className="space-y-4 sm:space-y-6">
          {/* KPIs operacionales (estado actual) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl">📋</div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500 truncate">Total Solicitudes</p>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-1">{totalApps}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl">⏳</div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">Pendientes</p>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-600 mt-1">{pending}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl">📅</div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500">Hoy</p>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-emerald-600 mt-1">{today}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl">🔄</div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500 truncate">En Tratamiento</p>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-600 mt-1">{inTreatment}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas Lean de proceso (tiempos y tasas) */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-3 px-1">Métricas de proceso (Lean)</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">⏱️ Lead time promedio</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{leanMetrics.fmtHours(leanMetrics.avgLeadTime)}</p>
                <p className="text-[10px] text-gray-400 mt-1">solicitud → completada</p>
              </div>
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">🚀 Tiempo de respuesta</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{leanMetrics.fmtHours(leanMetrics.avgResponseTime)}</p>
                <p className="text-[10px] text-gray-400 mt-1">solicitud → asignada</p>
              </div>
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">⚙️ Cycle time</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{leanMetrics.fmtHours(leanMetrics.avgCycleTime)}</p>
                <p className="text-[10px] text-gray-400 mt-1">asignada → completada</p>
              </div>
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">✅ Tasa de cumplimiento</p>
                <p className={`text-xl sm:text-2xl font-bold ${
                  leanMetrics.completionRate === null ? 'text-gray-400' :
                  leanMetrics.completionRate >= 80 ? 'text-emerald-600' :
                  leanMetrics.completionRate >= 50 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {leanMetrics.completionRate === null ? '—' : `${leanMetrics.completionRate}%`}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">{leanMetrics.cancelled} canceladas</p>
              </div>
            </div>
          </div>

          {/* Gráfico de tendencia */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl">
            <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-4">Tendencia (últimos 14 días)</h3>
            {leanMetrics.trend.every(d => d.creadas === 0 && d.completadas === 0) ? (
              <div className="text-center py-12 text-gray-400 text-sm">Sin datos suficientes aún. Las atenciones aparecerán aquí.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={leanMetrics.trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="dia" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="creadas" name="Creadas" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="completadas" name="Completadas" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Fila: distribución por estado + top servicios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Distribución por estado (cumplimiento) */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl">
              <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-4">Distribución por estado</h3>
              {leanMetrics.statusDistribution.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">Sin datos aún.</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={leanMetrics.statusDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, value }) => `${value}`}
                    >
                      {leanMetrics.statusDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top servicios */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl">
              <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-4">Servicios más solicitados</h3>
              {leanMetrics.topServices.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">Sin datos aún.</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={leanMetrics.topServices} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                    <Bar dataKey="count" name="Solicitudes" fill="#4f46e5" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== SOLICITUDES ==================== */}
      {tab === 'solicitudes' && (
        <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 flex-wrap">
            📋 Todas las Solicitudes
            <span className="text-xs sm:text-sm font-normal text-gray-500">({safeAppointments.length})</span>
          </h2>
          <div className="space-y-3 sm:space-y-4 max-h-[680px] overflow-auto pr-1 sm:pr-2 -mr-1 sm:-mr-2">
            {safeAppointments.length === 0 ? (
              <div className="text-center py-12 sm:py-20 text-gray-400 text-sm sm:text-base">No hay solicitudes registradas aún</div>
            ) : (
              safeAppointments.map(app => (
                <AppointmentCard key={app.id} app={app} />
              ))
            )}
          </div>
        </div>
      )}

      {/* ==================== SEGUIMIENTO DE DOSIS ==================== */}
      {tab === 'seguimiento' && (
        <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6">📈 Seguimiento de Atenciones</h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
            Click sobre una atención para registrar cambios de estado, servicios completados y dosis.
          </p>

          {/* FILTROS */}
          <div className="flex flex-wrap gap-3 mb-6 sm:mb-8 bg-gray-50 p-3 sm:p-4 rounded-3xl">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-3xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 min-h-[44px]">
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="asignada">Asignada</option>
              <option value="en_tratamiento">En tratamiento</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border border-gray-300 rounded-3xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 min-h-[44px]" />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border border-gray-300 rounded-3xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 min-h-[44px]" />
            <input type="text" placeholder="Buscar por paciente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 min-w-[200px] border border-gray-300 rounded-3xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 min-h-[44px]" />
          </div>

          <div className="space-y-3 max-h-[680px] overflow-auto pr-1">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12 sm:py-20 text-gray-400 text-sm">
                No se encontraron solicitudes con los filtros aplicados
              </div>
            ) : (
              filteredAppointments.map(app => {
                const totalDoses = (app.beneficiaries || []).reduce((acc, ben) => acc + (ben.services || []).reduce((s, srv) => s + (srv.doses || 0), 0), 0);
                const completedDoses = (app.beneficiaries || []).reduce((acc, ben) => acc + (ben.services || []).reduce((s, srv) => s + (srv.completedDoses || 0), 0), 0);
                const progress = totalDoses > 0 ? Math.round((completedDoses / totalDoses) * 100) : 0;

                return (
                  <button
                    key={app.id}
                    onClick={() => setDetailAppointment(app)}
                    className="w-full text-left border border-gray-200 hover:border-indigo-300 hover:shadow-md rounded-2xl p-4 sm:p-5 transition-all bg-white"
                  >
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                          {app.patientName || app.beneficiaries?.[0]?.name || 'Sin nombre'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                          {new Date(app.date).toLocaleDateString('es-CL')} · {app.time} · {app.comuna}
                        </p>
                      </div>
                      <span className={`shrink-0 px-3 py-1 text-[10px] sm:text-xs font-semibold rounded-full ${
                        app.status === 'completada' ? 'bg-emerald-100 text-emerald-700' :
                        app.status === 'en_tratamiento' ? 'bg-purple-100 text-purple-700' :
                        app.status === 'asignada' ? 'bg-blue-100 text-blue-700' :
                        app.status === 'cancelada' ? 'bg-gray-100 text-gray-500' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {(app.status || 'pendiente').toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1.5 text-gray-500">
                        <span>Progreso de dosis</span>
                        <span className="font-medium">{completedDoses} / {totalDoses} ({progress}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-2 bg-indigo-600 transition-all" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ==================== CALENDARIO ==================== */}
      {tab === 'calendario' && (
        <div>
          <div className="mb-4 sm:mb-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">Calendario de Atenciones</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Click sobre un día para ver/editar las atenciones programadas
              </p>
            </div>
          </div>
          <CalendarView
            appointments={safeAppointments}
            onEdit={(app) => setDetailAppointment(app)}
          />
        </div>
      )}

      {/* ==================== SERVICIOS (Rediseñado) ==================== */}
      {tab === 'servicios' && (
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">🛠️ Gestión de Servicios</h2>
            <button 
              onClick={() => setShowNewServiceForm(prev => !prev)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-3xl font-medium flex items-center gap-2 text-sm"
            >
              {showNewServiceForm ? '× Cerrar' : '+ Agregar Nuevo Servicio'}
            </button>
          </div>

          {/* Formulario Nuevo Servicio */}
          {showNewServiceForm && (
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 mb-10">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-5">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Nombre del servicio</label>
                  <input type="text" placeholder="Ej: Curación avanzada" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} className="w-full border border-gray-300 rounded-3xl px-6 py-4 text-lg" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Precio CLP</label>
                  <input type="number" placeholder="15000" value={newServicePrice} onChange={e => { setNewServicePrice(e.target.value); setPriceError(''); }} className="w-full border border-gray-300 rounded-3xl px-6 py-4 text-lg" />
                  {priceError && <p className="text-red-500 text-sm mt-2">{priceError}</p>}
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Descripción (opcional)</label>
                  <textarea placeholder="Detalle del servicio..." value={newServiceDescription} onChange={e => setNewServiceDescription(e.target.value)} className="w-full border border-gray-300 rounded-3xl px-6 py-4 h-24 resize-y" />
                </div>
                <div className="col-span-1 flex items-end">
                  <button onClick={addNewService} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-semibold">Agregar</button>
                </div>
              </div>
            </div>
          )}

          {/* Tarjetas de Servicios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeServices.map(service => (
              <div key={service.id} className="border border-gray-200 rounded-3xl p-7 hover:shadow-2xl transition-all group">
                <div className="flex justify-between">
                  {editingId === service.id ? (
                    <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} className="font-bold text-2xl flex-1 border-b-2 border-indigo-400 focus:outline-none bg-transparent" autoFocus />
                  ) : (
                    <h3 onClick={() => startEditing(service)} className="font-bold text-2xl cursor-pointer group-hover:text-indigo-600">{service.name}</h3>
                  )}

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={service.active} onChange={() => toggleService(service.id)} className="sr-only peer" />
                    <div className="w-12 h-7 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 peer-focus:ring-4 peer-focus:ring-indigo-300 transition-all"></div>
                    <div className="w-5 h-5 bg-white rounded-full absolute top-1 left-1 peer-checked:left-6 transition-all"></div>
                  </label>
                </div>

                {editingId === service.id ? (
                  <textarea value={tempDescription} onChange={e => setTempDescription(e.target.value)} rows={3} className="mt-4 w-full border border-gray-300 rounded-2xl p-4 text-sm" />
                ) : (
                  <p className="text-gray-600 text-sm mt-4 line-clamp-4">{service.description || 'Sin descripción'}</p>
                )}

                <div className="mt-8 flex items-center justify-between">
                  {editingId === service.id ? (
                    <div className="flex items-center">
                      <span className="text-4xl font-light text-gray-400">$</span>
                      <input type="number" value={tempPrice} onChange={e => setTempPrice(e.target.value)} className="text-5xl font-bold w-32 border-b-2 border-indigo-400 focus:outline-none text-right" />
                    </div>
                  ) : (
                    <button onClick={() => startEditing(service)} className="text-5xl font-bold text-gray-900 hover:text-indigo-600">$ {service.price}</button>
                  )}
                </div>

                {editingId === service.id && (
                  <div className="flex gap-3 mt-8">
                    <button onClick={() => saveEditing(service.id)} className="flex-1 py-4 bg-emerald-600 text-white rounded-3xl font-semibold">Guardar</button>
                    <button onClick={() => setEditingId(null)} className="flex-1 py-4 border border-gray-300 rounded-3xl">Cancelar</button>
                  </div>
                )}

                <button onClick={() => deleteService(service.id)} className="mt-10 text-red-500 hover:text-red-700 text-sm font-medium w-full py-4 border border-red-200 rounded-3xl hover:bg-red-50">🗑 Eliminar servicio</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 text-center text-xs text-gray-400">Admin Panel v2.0 • Enfermereando © 2026</div>

      {/* Modal de detalle/seguimiento — permite al admin registrar avance:
          estado, servicios completados y dosis suministradas. */}
      {detailAppointment && (
        <AppointmentDetailModal
          app={detailAppointment}
          services={safeServices}
          currentUser={user}
          onClose={() => setDetailAppointment(null)}
          onUpdated={async () => {
            if (reloadData) await reloadData();
          }}
        />
      )}
    </div>
  );
}

// ==================== LOGIN VIEW (Ciclo 2.2 - Supabase Auth) ====================
function LoginView({ setView, setUser }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const resetMessages = () => { setError(''); setInfo(''); };

  // Traduce errores típicos de Supabase Auth a mensajes en español comprensibles.
  const friendlyError = (err) => {
    const msg = (err?.message || '').toLowerCase();
    if (msg.includes('invalid login')) return 'Email o contraseña incorrectos.';
    if (msg.includes('email not confirmed')) return 'Aún no has confirmado tu email. Revisa tu bandeja de entrada (y la carpeta de spam).';
    if (msg.includes('user already registered')) return 'Ya existe una cuenta con ese email. Intenta iniciar sesión.';
    if (msg.includes('password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
    if (msg.includes('unable to validate email')) return 'El email no tiene un formato válido.';
    if (msg.includes('rate limit')) return 'Demasiados intentos. Espera unos minutos.';
    return err?.message || 'Ocurrió un error. Intenta nuevamente.';
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const user = await authSignIn(email, password);
      setUser(user);
      // Redirige según rol
      if (user.role === 'admin') setView('admin');
      else if (user.role === 'professional') setView('professional');
      else setView('patient');
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    resetMessages();
    if (!name.trim()) { setError('Ingresa tu nombre completo.'); return; }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    setLoading(true);
    try {
      const { needsConfirmation } = await authSignUp({ email, password, name: name.trim(), phone: phone.trim() });
      if (needsConfirmation) {
        setInfo('✅ Cuenta creada. Te enviamos un email para confirmar tu cuenta. Revisa tu bandeja de entrada y haz clic en el enlace.');
        setTab('login');
      } else {
        setInfo('✅ Cuenta creada. Ya puedes iniciar sesión.');
        setTab('login');
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e) => {
    if (e) e.preventDefault();
    resetMessages();
    if (!email) { setError('Ingresa tu email.'); return; }
    setLoading(true);
    try {
      await authResetPassword(email);
      setInfo('✅ Te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.');
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Enfermereando</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Inicia sesión o regístrate</p>
        </div>

        <div className="flex border-b mb-6">
          <button
            onClick={() => { setTab('login'); resetMessages(); }}
            className={`flex-1 py-3 text-sm sm:text-base font-medium min-h-[44px] ${tab === 'login' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setTab('register'); resetMessages(); }}
            className={`flex-1 py-3 text-sm sm:text-base font-medium min-h-[44px] ${tab === 'register' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
          >
            Registrarse
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            {info}
          </div>
        )}

        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 mb-4 text-base focus:outline-none focus:border-indigo-500 min-h-[48px]"
              required
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 mb-3 text-base focus:outline-none focus:border-indigo-500 min-h-[48px]"
              required
            />
            <button
              type="button"
              onClick={() => { setTab('recovery'); resetMessages(); }}
              className="text-sm text-indigo-600 hover:text-indigo-800 mb-6 inline-block"
            >
              ¿Olvidaste tu contraseña?
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-3xl transition-all min-h-[52px] text-base"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 mb-4 text-base focus:outline-none focus:border-indigo-500 min-h-[48px]"
              required
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 mb-4 text-base focus:outline-none focus:border-indigo-500 min-h-[48px]"
              required
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (opcional)</label>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+56 9 1234 5678"
              className="w-full border border-gray-300 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 mb-4 text-base focus:outline-none focus:border-indigo-500 min-h-[48px]"
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 mb-2 text-base focus:outline-none focus:border-indigo-500 min-h-[48px]"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mb-6">Mínimo 8 caracteres.</p>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-3xl transition-all min-h-[52px] text-base"
            >
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>
        )}

        {tab === 'recovery' && (
          <form onSubmit={handleRecovery}>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Restablecer contraseña</h3>
            <p className="text-sm text-gray-600 mb-4">
              Ingresa tu email y te enviaremos un enlace para crear una nueva contraseña.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email registrado</label>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 mb-6 text-base focus:outline-none focus:border-indigo-500 min-h-[48px]"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-3xl transition-all min-h-[52px] text-base mb-3"
            >
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
            <button
              type="button"
              onClick={() => { setTab('login'); resetMessages(); }}
              className="w-full text-sm text-gray-600 hover:text-gray-900 min-h-[44px]"
            >
              ← Volver al inicio de sesión
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => setView('landing')}
            className="text-sm text-gray-500 hover:text-gray-700 min-h-[44px]"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}


// ==================== MONITORING PANEL (versión final) ====================
function MonitoringPanel({ 
  appointments, 
  services, 
  currentUser, 
  reloadData,
  onEdit 
}) {
  const [filterStatus, setFilterStatus] = useState('all');
  // Nota Ciclo 1: estado `pendingChanges` y handler `saveAllChanges` removidos.
  // La edición granular de dosis vive en AdminPanel > "Seguimiento de Dosis",
  // donde cada (beneficiario, servicio) tiene su propio input. Aquí solo se
  // cambian Estado y Notas para evitar sobrescritura accidental de datos.

  const isAdmin = currentUser?.role === 'admin';

  const safeAppointments = Array.isArray(appointments) ? appointments : [];

  const myAppointments = isAdmin 
    ? safeAppointments 
    : safeAppointments.filter(a => a.assignedTo === currentUser?.id);

  const filteredApps = filterStatus === 'all' 
    ? myAppointments 
    : myAppointments.filter(a => a.status === filterStatus);

  const updateField = async (appId, field, value) => {
    try {
      if (field === 'status') {
        await dataLayer.appointments.updateStatus(appId, value, currentUser?.id);
      } else {
        await dataLayer.appointments.update(appId, { [field]: value });
      }
      if (reloadData) await reloadData();
    } catch (err) {
      console.error(`Error actualizando ${field}:`, err);
      alert(`❌ No se pudo actualizar ${field}.`);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Monitoreo de Atenciones</h2>
        <div className="text-sm text-gray-500">
          {filteredApps.length} atenciones
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <label className="block text-xs font-medium text-gray-500 mb-2">Dosis (lectura)</label>
                    <div className="px-4 py-3 rounded-3xl border border-gray-200 bg-gray-50 text-gray-600 text-sm">
                      {completedDoses} / {totalDoses} completadas — edita desde "Seguimiento de Dosis"
                    </div>
                  </div>

                  <div className="md:col-span-2">
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

// ==================== APP PRINCIPAL (Ciclo 2.2 - Supabase Auth) ====================
export default function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ciclo 2.2: ya NO cargamos professionals ni patients desde app_storage.
  // Esa información vive en auth.users de Supabase. El estado local se
  // alimenta de eventos de Auth y de las citas (que llevan userId y assignedTo).

  // Carga inicial: sesión + datos de aplicación
  // Función reutilizable que recarga citas y servicios desde la BD.
  // Se llama al inicio, y después de cada mutación (crear cita, cambiar estado, etc.)
  const reloadData = async () => {
    try {
      const [svcs, apps] = await Promise.all([
        dataLayer.services.list(),
        dataLayer.appointments.list(),
      ]);
      setServices(svcs);
      setAppointments(apps);
    } catch (e) {
      console.error("Error recargando datos:", e);
    }
  };

  useEffect(() => {
    let mounted = true;
    let subscription;

    (async () => {
      try {
        // 1. Recupera sesión persistente si existe
        const currentUser = await authGetCurrentUser();
        if (mounted && currentUser) {
          setUser(currentUser);
          if (currentUser.role === 'admin') setView('admin');
          else if (currentUser.role === 'professional') setView('professional');
          else setView('patient');
        }

        // 2. Carga catálogo de servicios y citas desde tablas reales (Ciclo 3.2)
        // RLS filtra automáticamente: paciente ve solo lo suyo, profesional/admin ve todo.
        if (mounted) {
          await reloadData();
        }

        // 3. Suscribirse a cambios de auth
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;
          if (event === 'SIGNED_OUT' || !session) {
            setUser(null);
            setView('landing');
            setAppointments([]); // limpia datos del usuario anterior
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            setUser(mapAuthUser(session.user));
            // Recarga datos con los permisos del nuevo usuario (RLS los filtra)
            await reloadData();
          }
        });
        subscription = data.subscription;
      } catch (e) {
        console.error("Error cargando datos:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Ciclo 3.2: ya no usamos sset('enf:appointments', array completo).
  // Las mutaciones se hacen vía dataLayer.appointments.{create,update,updateStatus}
  // y refrescamos el estado local con reloadData() después de cada cambio.

  // Logout centralizado: limpia sesión Auth y vuelve al landing
  const handleLogout = async () => {
    try {
      await authSignOut();
    } catch (e) {
      console.error('Error cerrando sesión:', e);
    } finally {
      setUser(null);
      setView('landing');
    }
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
        />
      )}

      {/* PANEL PACIENTE */}
      {user && user.role === 'patient' && view === 'patient' && (
        <PatientPortal
          user={user}
          appointments={appointments}
          reloadData={reloadData}
          services={services}
          setView={setView}
          onLogout={handleLogout}
        />
      )}

      {/* PANEL PROFESIONAL */}
      {user && (user.role === 'professional' || user.role === 'admin') && view === 'professional' && (
        <ProfessionalDashboard
          user={user}
          appointments={appointments}
          reloadData={reloadData}
          services={services}
          setView={setView}
          onLogout={handleLogout}
        />
      )}

      {/* PANEL ADMIN */}
      {user && user.role === 'admin' && view === 'admin' && (
        <AdminPanel
          user={user}
          appointments={appointments}
          reloadData={reloadData}
          services={services}
          setView={setView}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

// ==================== FIN DEL ARCHIVO ====================