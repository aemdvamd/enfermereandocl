import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_KEY
    );

    const { data } = await supabase
      .from('app_storage')
      .select('value')
      .eq('key', 'enf:appointments')
      .single();

    const appointments = data?.value || [];
    const today = new Date().toISOString().split('T')[0];

    const todayApps = appointments
      .filter(a => a.date === today && (a.status === 'asignada' || a.status === 'confirmada' || a.status === 'en_tratamiento'))
      .sort((a, b) => a.time.localeCompare(b.time));

    const pending = appointments.filter(a => a.status === 'pendiente').length;

    const visitsHtml = todayApps.length === 0
      ? '<p style="color: #94a3b8; text-align: center; padding: 20px;">No tienes visitas programadas para hoy.</p>'
      : todayApps.map((app, i) => `
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #0d9488;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <strong style="color: #0d9488; font-size: 18px;">${app.time}</strong>
            <span style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 12px;">#${i + 1}</span>
          </div>
          <div style="font-weight: bold; color: #0f172a;">${app.patientName}</div>
          <div style="color: #64748b; font-size: 14px;">📞 ${app.patientPhone}</div>
          <div style="color: #64748b; font-size: 14px;">📍 ${app.address}</div>
        </div>
      `).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0d9488, #2563eb); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">☀️ Buenos días</h1>
          <p style="color: #d1fae5; margin: 4px 0 0;">Resumen de hoy · ${new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div style="background: white; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <div style="display: flex; gap: 12px; margin-bottom: 24px;">
            <div style="flex: 1; background: #f0fdf4; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #0d9488;">${todayApps.length}</div>
              <div style="font-size: 12px; color: #64748b;">VISITAS HOY</div>
            </div>
            <div style="flex: 1; background: #fffbeb; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #d97706;">${pending}</div>
              <div style="font-size: 12px; color: #64748b;">PENDIENTES</div>
            </div>
          </div>
          <h2 style="color: #0f172a; margin-bottom: 12px;">Visitas programadas</h2>
          ${visitsHtml}
          <a href="https://enfermereandocl.vercel.app" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #0d9488; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Ingresar al panel</a>
        </div>
        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 16px;">Enfermereando · Salud profesional en casa</p>
      </div>
    `;

    if (process.env.ADMIN_EMAIL) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Enfermereando <onboarding@resend.dev>',
          to: process.env.ADMIN_EMAIL,
          subject: `☀️ Resumen del día - ${todayApps.length} visita${todayApps.length !== 1 ? 's' : ''} programada${todayApps.length !== 1 ? 's' : ''}`,
          html: html,
        }),
      });
    }

    return res.status(200).json({ ok: true, todayApps: todayApps.length, pending });
  } catch (error) {
    console.error('Daily summary error:', error);
    return res.status(500).json({ error: error.message });
  }
}