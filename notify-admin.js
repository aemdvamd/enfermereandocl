export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {
      const { patientName, patientPhone, date, time, address, beneficiaries, total } = req.body;
  
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0d9488, #2563eb); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">🔔 Nueva reserva</h1>
            <p style="color: #d1fae5; margin: 4px 0 0;">Enfermereando</p>
          </div>
          <div style="background: white; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #0f172a; margin: 0 0 16px;">Datos de la reserva</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #64748b;">👤 Paciente</td><td style="padding: 8px 0; font-weight: bold;">${patientName}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">📞 Teléfono</td><td style="padding: 8px 0;">${patientPhone}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">📅 Fecha</td><td style="padding: 8px 0;">${date}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">🕐 Hora</td><td style="padding: 8px 0;">${time}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">📍 Dirección</td><td style="padding: 8px 0;">${address}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">👥 Personas</td><td style="padding: 8px 0;">${beneficiaries}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">💰 Total estimado</td><td style="padding: 8px 0; font-weight: bold; color: #0d9488;">${total}</td></tr>
            </table>
            <a href="https://enfermereandocl.vercel.app" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #0d9488; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Ingresar al panel</a>
          </div>
        </div>
      `;
  
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Enfermereando <onboarding@resend.dev>',
          to: process.env.ADMIN_EMAIL,
          subject: `🔔 Nueva reserva: ${patientName} - ${date} ${time}`,
          html: html,
        }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error sending email');
      return res.status(200).json({ ok: true, id: data.id });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }