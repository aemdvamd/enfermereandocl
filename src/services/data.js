// ============================================================
// src/services/data.js
// ============================================================
// Capa única de acceso a datos. Todo el código de la app interactúa
// con Supabase a través de este módulo.
//
// Convención: los objetos retornados están en camelCase (lo que usa React),
// internamente se mapean a/desde snake_case (lo que usa Postgres).
//
// Ciclo 3.2 — reemplaza al sistema key-value de app_storage.
// ============================================================

import { supabase } from '../supabase';

// ============================================================
// MAPPERS: snake_case (DB) <-> camelCase (JS)
// ============================================================

const fromDbAppointment = (row, beneficiaries = []) => row && {
  id: row.id,
  userId: row.user_id,
  assignedTo: row.assigned_to,
  patientName: row.patient_name,
  date: row.date,
  time: row.time,
  comuna: row.comuna,
  phone: row.phone,
  notes: row.notes,
  status: row.status,
  seriesId: row.series_id,
  doseNumber: row.dose_number,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  assignedAt: row.assigned_at,
  completedAt: row.completed_at,
  cancelledAt: row.cancelled_at,
  beneficiaries: beneficiaries.map(fromDbBeneficiary),
};

const fromDbBeneficiary = (row) => row && {
  id: row.id,
  appointmentId: row.appointment_id,
  name: row.name,
  direccion: row.direccion,
  position: row.position,
  services: (row.appointment_services || []).map(fromDbAppointmentService),
};

const fromDbAppointmentService = (row) => row && {
  id: row.id,
  beneficiaryId: row.beneficiary_id,
  serviceId: row.service_id,
  doses: row.doses,
  completedDoses: row.completed_doses,
  frequency: row.frequency,
};

const fromDbService = (row) => row && {
  id: row.id,
  name: row.name,
  description: row.description,
  price: row.price,
  iconId: row.icon_id,
  allowDoses: row.allow_doses,
  active: row.active,
};

const fromDbEvent = (row) => row && {
  id: row.id,
  appointmentId: row.appointment_id,
  actorId: row.actor_id,
  eventType: row.event_type,
  payload: row.payload,
  createdAt: row.created_at,
};

// ============================================================
// SERVICES (catálogo)
// ============================================================

export const services = {
  async list({ activeOnly = false } = {}) {
    let query = supabase.from('services').select('*').order('name');
    if (activeOnly) query = query.eq('active', true);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(fromDbService);
  },

  async create({ id, name, description, price, iconId, allowDoses = true }) {
    const { data, error } = await supabase
      .from('services')
      .insert({
        id,
        name,
        description: description || null,
        price,
        icon_id: iconId || null,
        allow_doses: allowDoses,
        active: true,
      })
      .select()
      .single();
    if (error) throw error;
    return fromDbService(data);
  },

  async update(id, changes) {
    const dbChanges = {};
    if (changes.name !== undefined) dbChanges.name = changes.name;
    if (changes.description !== undefined) dbChanges.description = changes.description;
    if (changes.price !== undefined) dbChanges.price = changes.price;
    if (changes.iconId !== undefined) dbChanges.icon_id = changes.iconId;
    if (changes.allowDoses !== undefined) dbChanges.allow_doses = changes.allowDoses;
    if (changes.active !== undefined) dbChanges.active = changes.active;

    const { data, error } = await supabase
      .from('services')
      .update(dbChanges)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return fromDbService(data);
  },

  async toggleActive(id) {
    const { data: current } = await supabase
      .from('services')
      .select('active')
      .eq('id', id)
      .single();
    if (!current) throw new Error('Servicio no encontrado');
    return this.update(id, { active: !current.active });
  },

  async remove(id) {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw error;
  },
};

// ============================================================
// APPOINTMENTS (citas + beneficiarios + servicios)
// ============================================================

const APPOINTMENT_WITH_DETAILS = `
  *,
  beneficiaries (
    *,
    appointment_services (*)
  )
`;

export const appointments = {
  // RLS filtra automáticamente lo que cada usuario puede ver
  async list() {
    const { data, error } = await supabase
      .from('appointments')
      .select(APPOINTMENT_WITH_DETAILS)
      .order('date', { ascending: false })
      .order('time', { ascending: false });
    if (error) throw error;
    return (data || []).map(row => fromDbAppointment(row, row.beneficiaries));
  },

  async get(id) {
    const { data, error } = await supabase
      .from('appointments')
      .select(APPOINTMENT_WITH_DETAILS)
      .eq('id', id)
      .single();
    if (error) throw error;
    return fromDbAppointment(data, data.beneficiaries);
  },

  // Crear cita completa (cita + beneficiarios + servicios) de forma ATÓMICA.
  // Ciclo 3.2 refactor: usa la RPC `create_appointment` de Postgres, que corre
  // todo dentro de UNA transacción. Si algo falla, Postgres revierte todo solo.
  // payload: { userId, patientName, date, time, comuna, phone, notes,
  //            beneficiaries: [{ name, direccion, services: [{ serviceId, doses, frequency }] }] }
  async create(payload) {
    const { data: newId, error } = await supabase.rpc('create_appointment', {
      payload: {
        userId: payload.userId,
        patientName: payload.patientName,
        date: payload.date,
        time: payload.time,
        comuna: payload.comuna,
        phone: payload.phone,
        notes: payload.notes || '',
        beneficiaries: (payload.beneficiaries || []).map(b => ({
          name: b.name,
          direccion: b.direccion || '',
          services: (b.services || []).map(s => ({
            serviceId: s.serviceId,
            doses: parseInt(s.doses, 10) || 1,
            frequency: s.frequency || 'once',
          })),
        })),
      },
    });
    if (error) throw error;
    return this.get(newId);
  },

  // Cambio de estado con registro automático en audit log
  async updateStatus(id, newStatus, actorId, extraPayload = {}) {
    const dbChanges = { status: newStatus };
    const nowIso = new Date().toISOString();

    if (newStatus === 'asignada') {
      dbChanges.assigned_at = nowIso;
      if (actorId) dbChanges.assigned_to = actorId;
    } else if (newStatus === 'completada') {
      dbChanges.completed_at = nowIso;
    } else if (newStatus === 'cancelada') {
      dbChanges.cancelled_at = nowIso;
    }

    const { data, error } = await supabase
      .from('appointments')
      .update(dbChanges)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    await events.log(id, `status:${newStatus}`, extraPayload);

    return fromDbAppointment(data);
  },

  // Editar campos generales de una cita (notes, phone, comuna, etc.)
  async update(id, changes) {
    const dbChanges = {};
    if (changes.notes !== undefined) dbChanges.notes = changes.notes;
    if (changes.phone !== undefined) dbChanges.phone = changes.phone;
    if (changes.comuna !== undefined) dbChanges.comuna = changes.comuna;
    if (changes.date !== undefined) dbChanges.date = changes.date;
    if (changes.time !== undefined) dbChanges.time = changes.time;
    if (changes.assignedTo !== undefined) dbChanges.assigned_to = changes.assignedTo;

    const { data, error } = await supabase
      .from('appointments')
      .update(dbChanges)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return fromDbAppointment(data);
  },

  // Actualizar dosis completadas de un servicio específico
  async updateDoses(appointmentServiceId, completedDoses) {
    const { data, error } = await supabase
      .from('appointment_services')
      .update({ completed_doses: completedDoses })
      .eq('id', appointmentServiceId)
      .select()
      .single();
    if (error) throw error;

    // Registrar evento si tenemos la cita
    if (data?.beneficiary_id) {
      const { data: ben } = await supabase
        .from('beneficiaries')
        .select('appointment_id')
        .eq('id', data.beneficiary_id)
        .single();
      if (ben?.appointment_id) {
        await events.log(ben.appointment_id, 'doses:updated', {
          serviceRowId: appointmentServiceId,
          completedDoses,
        });
      }
    }
    return fromDbAppointmentService(data);
  },

  async remove(id) {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) throw error;
  },
};

// ============================================================
// EVENTS (audit log + métricas Lean)
// ============================================================

export const events = {
  async log(appointmentId, eventType, payload = null) {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('appointment_events')
      .insert({
        appointment_id: appointmentId,
        actor_id: user?.id || null,
        event_type: eventType,
        payload,
      });
    if (error) console.error('[events.log]', error);
    // No throw: el log es informativo, no debe romper la operación principal
  },

  async listForAppointment(appointmentId) {
    const { data, error } = await supabase
      .from('appointment_events')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(fromDbEvent);
  },
};

// ============================================================
// EXPORT DEFAULT
// ============================================================

export default { services, appointments, events };