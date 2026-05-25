// api/telegram.js
// Endpoint serverless que actúa como intermediario seguro entre el cliente y la API de Telegram.
// El cliente envía datos de la cita; aquí componemos el mensaje y agregamos el token (que vive solo en el servidor).

export default async function handler(req, res) {
    // 1. Solo aceptar POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    // 2. CORS — permitir llamadas desde tu dominio Vercel y desarrollo local
    const ALLOWED_ORIGINS = [
      'https://enfermereandocl.vercel.app',
      'http://localhost:5173',
      'http://localhost:4173',
    ];
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    // 3. Preflight OPTIONS (requerido para CORS con Content-Type: application/json)
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  
    // 4. Leer secretos desde variables de entorno del servidor
    //    Estas variables NO tienen el prefijo VITE_ — son privadas, nunca llegan al cliente.
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  
    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('[telegram] Variables de entorno no configuradas');
      return res.status(500).json({ error: 'Server misconfigured' });
    }
  
    // 5. Validar payload del cliente
    const { action, app, extraInfo } = req.body || {};
  
    if (!action || !app) {
      return res.status(400).json({ error: 'Missing required fields: action, app' });
    }
  
    const VALID_ACTIONS = ['new', 'cancelled', 'status_change', 'task_taken', 'dose_update'];
    if (!VALID_ACTIONS.includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }
  
    // 6. Componer el mensaje (lógica idéntica a la que antes vivía en el cliente)
    const PROFESSIONAL_NAME = 'Mariela Droguett';
  
    let text = `🔔 *Enfermereando - ${PROFESSIONAL_NAME}*\n\n`;
    if (action === 'new') text += `📌 *NUEVA SOLICITUD DE ATENCIÓN*\n`;
    else if (action === 'cancelled') text += `❌ *ATENCIÓN CANCELADA*\n`;
    else if (action === 'status_change') text += `🔄 *CAMBIO DE ESTADO*\n`;
    else if (action === 'task_taken') text += `✅ *TAREA TOMADA*\n`;
    else if (action === 'dose_update') text += `📊 *DOSIS ACTUALIZADAS*\n`;
  
    const patientName = app.patientName || app.beneficiaries?.[0]?.name || 'Sin nombre';
    const dateStr = app.date ? new Date(app.date).toLocaleDateString('es-CL') : 'Sin fecha';
    const timeStr = app.time || 'Sin hora';
    const comuna = app.comuna || 'No especificada';
  
    text += `Paciente: ${patientName}\n`;
    text += `Fecha: ${dateStr}\n`;
    text += `Hora: ${timeStr}\n`;
    text += `Comuna: ${comuna}\n`;
    if (extraInfo) text += `${extraInfo}\n`;
  
    // 7. Llamar a la API de Telegram (el token nunca sale del servidor)
    try {
      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text,
            parse_mode: 'Markdown',
          }),
        }
      );
  
      const result = await telegramResponse.json();
  
      if (!result.ok) {
        console.error('[telegram] API error:', result);
        return res.status(502).json({ error: 'Telegram API error', detail: result.description });
      }
  
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('[telegram] Network error:', error);
      return res.status(500).json({ error: 'Network error' });
    }
  }