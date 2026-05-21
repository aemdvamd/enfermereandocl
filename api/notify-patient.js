export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
    try {
      const { type, patientEmail, patientName, patientPhone, date, time, address, professionalName } = req.body;
      if (!patientEmail && !patientPhone) return res.status(200).json({ ok: true, skipped: true });
  
      const subjects = {
        confirmed: '✅ Tu atención fue confirmada',
        completed: '✓ Atención completada',
        reminder: '🔔 Recordatorio: tu atención es mañana',
      };
  
      const messages = {
        confirmed: {
          title: '✅ ¡Tu atención fue confirmada!',
          intro: `${professionalName || 'Tu profesional'} confirmó tu atención.`,
          color: '#0d9488',
          bgColor: '#f0fdf4',
        },
        completed: {
          title: '✓ Atención completada',
          intro: 'Tu atención fue realizada exitosamente.',
          color: '#16a34a',
          bgColor: '#f0fdf4',
        },
        reminder: {
          title: '🔔 Recordatorio',
          intro: 'Te recordamos tu atención próxima.',
          color: '#0d9488',
          bgColor: '#f0fdf4',
        },
      };
  
      const m = messages[type] || messages.confirmed;
  
      // Email al paciente
      if (patientEmail) {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, ${m.color}, #2563eb); padding: 24px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0;">${m.title}</h1>
              <p style="color: #d1fae5; margin: 4px 0 0;">Enfermereando</p>
            </div>
            <div style="background: white; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
              <p>Hola <strong>${patientName.split(' ')[0]}</strong>,</p>
              <p>${m.intro}</p>
              <div style="background: ${m.bgColor}; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 4px 0;">📅 ${date}</p>
                <p style="margin: 4px 0;">🕐 ${time} hrs</p>
                <p style="margin: 4px 0;">📍 ${address}</p>
              </div>
              <p style="color: #64748b; font-size: 14px;">Si tienes dudas, contáctanos al WhatsApp <a href="https://wa.me/56920489639">+56 9 2048 9639</a>.</p>
              <a href="https://enfermereandocl.vercel.app" style="display: inline-block; margin-top: 12px; padding: 10px 20px; background: ${m.color}; color: white; text-decoration: none; border-radius: 8px;">Ver mi reserva</a>
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
            to: patientEmail,
            subject: subjects[type] || subjects.confirmed,
            html: html,
          }),
        });
      }
  
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }