export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
    try {
      const { patientName, patientPhone, date, time, address, reason } = req.body;
  
      // Email al admin
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626, #f59e0b); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">⚠️ Reserva cancelada</h1>
            <p style="color: #fee2e2; margin: 4px 0 0;">Enfermereando</p>
          </div>
          <div style="background: white; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #475569;">El paciente <strong>${patientName}</strong> ha cancelado su reserva.</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <tr><td style="padding: 8px 0; color: #64748b;">📞 Teléfono</td><td style="padding: 8px 0;">${patientPhone}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">📅 Fecha</td><td style="padding: 8px 0;">${date}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">🕐 Hora</td><td style="padding: 8px 0;">${time}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">📍 Dirección</td><td style="padding: 8px 0;">${address}</td></tr>
              ${reason ? `<tr><td style="padding: 8px 0; color: #64748b;">💬 Motivo</td><td style="padding: 8px 0;">${reason}</td></tr>` : ''}
            </table>
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
          to: process.env.ADMIN_EMAIL,
          subject: `⚠️ Cancelación: ${patientName} - ${date}`,
          html: html,
        }),
      });
  
      // WhatsApp al admin
      if (process.env.ADMIN_WHATSAPP && process.env.CALLMEBOT_APIKEY) {
        const message = encodeURIComponent(
          '⚠️ *Reserva cancelada*\n\n' +
          '👤 Paciente: ' + patientName + '\n' +
          '📞 ' + patientPhone + '\n' +
          '📅 ' + date + ' ' + time + '\n' +
          '📍 ' + address +
          (reason ? '\n💬 Motivo: ' + reason : '')
        );
        await fetch(`https://api.callmebot.com/whatsapp.php?phone=${process.env.ADMIN_WHATSAPP}&text=${message}&apikey=${process.env.CALLMEBOT_APIKEY}`);
      }
  
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }