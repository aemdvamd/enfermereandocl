import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Verificar que es una llamada autorizada de Vercel Cron
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_KEY
    );

    // Obtener todas las citas
    const { data, error } = await supabase
      .from('app_storage')
      .select('value')
      .eq('key', 'enf:appointments')
      .single();

    if (error || !data) return res.status(200).json({ ok: true, sent: 0 });

    const appointments = data.value || [];

    // Filtrar las citas para mañana
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const tomorrowApps = appointments.filter(a =>
      a.date === tomorrowStr &&
      (a.status === 'asignada' || a.status === 'confirmada' || a.status === 'en_tratamiento')
    );

    let sentCount = 0;

    // Enviar WhatsApp a cada paciente
    for (const app of tomorrowApps) {
      const patientPhone = (app.patientPhone || '').replace(/\D/g, '');
      if (!patientPhone) continue;

      const phoneWithCountry = patientPhone.startsWith('56') ? patientPhone : '56' + patientPhone;

      const message = encodeURIComponent(
        '🔔 *Recordatorio Enfermereando*\n\n' +
        'Hola ' + app.patientName.split(' ')[0] + ', te recordamos tu atención de mañana:\n\n' +
        '📅 ' + new Date(app.date + 'T00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }) + '\n' +
        '🕐 ' + app.time + ' hrs\n' +
        '📍 ' + app.address + '\n\n' +
        'Si necesitas reagendar, comunícate con nosotros al WhatsApp +56 9 2048 9639.\n\n' +
        '¡Te esperamos!'
      );

      // Notificación al paciente (usando CallMeBot del admin como puente — limitado)
      // En producción real, usarías Twilio o WhatsApp Business API
      // Por simplicidad, enviamos al admin un resumen

      // Notificar al admin con el listado de recordatorios
      if (process.env.ADMIN_WHATSAPP && process.env.CALLMEBOT_APIKEY) {
        const adminMsg = encodeURIComponent(
          '📋 *Visita mañana*\n\n' +
          '👤 ' + app.patientName + '\n' +
          '📞 ' + app.patientPhone + '\n' +
          '🕐 ' + app.time + '\n' +
          '📍 ' + app.address
        );
        await fetch(`https://api.callmebot.com/whatsapp.php?phone=${process.env.ADMIN_WHATSAPP}&text=${adminMsg}&apikey=${process.env.CALLMEBOT_APIKEY}`);
        sentCount++;
        await new Promise(r => setTimeout(r, 2000)); // 2s entre mensajes
      }

      // Email al paciente con el recordatorio
      if (app.patientEmail) {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0d9488, #2563eb); padding: 24px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0;">🔔 Recordatorio de tu atención</h1>
              <p style="color: #d1fae5; margin: 4px 0 0;">Enfermereando</p>
            </div>
            <div style="background: white; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
              <p>Hola <strong>${app.patientName.split(' ')[0]}</strong>,</p>
              <p>Te recordamos tu atención de mañana:</p>
              <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 4px 0;">📅 <strong>${new Date(app.date + 'T00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</strong></p>
                <p style="margin: 4px 0;">🕐 ${app.time} hrs</p>
                <p style="margin: 4px 0;">📍 ${app.address}</p>
              </div>
              <p>Si necesitas reagendar, contáctanos al WhatsApp <a href="https://wa.me/56920489639">+56 9 2048 9639</a>.</p>
            </div>
          </div>
        `;
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Enfermereando <onboarding@resend.dev>',
            to: app.patientEmail,
            subject: `Recordatorio: tu atención mañana a las ${app.time}`,
            html: html,
          }),
        });
      }
    }

    return res.status(200).json({ ok: true, sent: sentCount, total: tomorrowApps.length });
  } catch (error) {
    console.error('Cron error:', error);
    return res.status(500).json({ error: error.message });
  }
}