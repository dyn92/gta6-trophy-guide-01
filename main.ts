// Leonida Platinum Atlas — a gta6-trophy-guide-01 entry (Node 22, standard library only).
//
// The guide itself is this directory's app/ folder: plain static files a browser opens at
// app/index.html (ES modules, one stylesheet, no build step), offline by construction — it
// loads nothing over the network, and its trophy list, guides, roadmap and missable flags
// live in app/data/trophies.json and app/js/. This program is the hand-in: it copies app/
// and screenshots/ from beside this file into the output directory and writes
// dossier.json there with the vendored make.fun library, byte for byte what the scorer
// builds again. vendor/makefun-frontend.ts stays exactly as the kit shipped it.
//
// Try the guide locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const ENTRY_NAME = 'Leonida Platinum Atlas';
const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The dossier's caps are the scorer's own (reference/gate.json): the text cap shapes the
// bytes; the rest refuse here what the scorer would refuse there — more than 4
// screenshots or one over 256 KiB, more than 993 files and directories in app/ or 48 MiB
// of app files — and /output as a whole stays under the platform's 1,000-entry cap.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(out, 'dossier.json'), dossier);

console.log(`${ENTRY_NAME}: app/ and screenshots/ copied to ${out}, dossier.json written (${dossier.length} bytes).`);
