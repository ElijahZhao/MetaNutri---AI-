// Boot the `output: 'standalone'` build exactly like the production container.
//
// `next start` refuses to serve a standalone build, and the generated
// `.next/standalone/server.js` only ships the traced server + node_modules —
// the static assets and `public/` are not bundled in. So mirror the runner
// stage of Dockerfile: copy them next to `server.js`, then exec it.
import { cpSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const standalone = path.join(root, '.next', 'standalone');

if (!existsSync(path.join(standalone, 'server.js'))) {
  console.error('[start-standalone] .next/standalone/server.js not found — run `npm run build` first.');
  process.exit(1);
}

for (const [from, to] of [
  ['public', path.join(standalone, 'public')],
  [path.join('.next', 'static'), path.join(standalone, '.next', 'static')],
]) {
  const src = path.join(root, from);
  if (existsSync(src)) cpSync(src, to, { recursive: true });
}

const child = spawn(process.execPath, [path.join(standalone, 'server.js')], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    // Docker/CI inject their own HOSTNAME; server.js binds to it verbatim when
    // set, which would make the port unreachable. Pin it to all interfaces.
    HOSTNAME: '0.0.0.0',
  },
});

child.on('exit', (code) => process.exit(code ?? 0));
