import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// ============================================================
// REGISTRO INTELIGENTE DEL SERVICE WORKER (auto-actualización)
// ============================================================
// Pega este bloque al FINAL de tu src/main.jsx, después del ReactDOM.render.
//
// Qué hace:
// 1. Registra el SW solo en producción.
// 2. Detecta cuando hay una versión nueva esperando.
// 3. Le ordena activarse de inmediato (skipWaiting).
// 4. Recarga la página UNA vez cuando el SW nuevo toma control.
// 5. Revisa por actualizaciones cada vez que el usuario vuelve a la pestaña.
//
// Resultado: el usuario nunca tiene que limpiar cache. La app se actualiza sola.

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  let refreshing = false;

  // Cuando el SW nuevo toma control, recargar una sola vez
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        // Detectar un SW nuevo instalándose
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            // Hay un SW nuevo instalado Y ya había uno controlando = actualización disponible
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Ordenar al SW nuevo que se active de inmediato
              newWorker.postMessage('SKIP_WAITING');
            }
          });
        });

        // Revisar por actualizaciones al volver a la pestaña
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update();
          }
        });

        // Revisar por actualizaciones cada 60 minutos mientras la pestaña está abierta
        setInterval(() => registration.update(), 60 * 60 * 1000);
      })
      .catch((err) => console.error('SW registration failed:', err));
  });
}