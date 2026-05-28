// scripts/stamp-sw-version.js
// Reemplaza __BUILD_HASH__ en public/service-worker.js con un identificador único
// de este build (timestamp). Se ejecuta automáticamente antes de `vite build`.
//
// Esto garantiza que CADA deploy tenga un CACHE_VERSION distinto, lo que dispara
// la actualización automática del Service Worker en todos los clientes.

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const swPath = join(__dirname, '..', 'public', 'service-worker.js');

try {
  let content = readFileSync(swPath, 'utf-8');

  // Identificador único: fecha-hora del build (YYYYMMDDHHmmss)
  const stamp = new Date()
    .toISOString()
    .replace(/[-:T.]/g, '')
    .slice(0, 14);

  // Reemplaza el placeholder O una versión previamente estampada
  content = content.replace(
    /enfermereando-(?:__BUILD_HASH__|\d{14})/g,
    `enfermereando-${stamp}`
  );

  writeFileSync(swPath, content, 'utf-8');
  console.log(`✅ Service Worker versionado: enfermereando-${stamp}`);
} catch (err) {
  console.error('❌ Error estampando versión del SW:', err);
  process.exit(1);
}