import { createRequire } from 'node:module';
import { mkdir, cp, writeFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { checkNativePreview, nativePreviewPath } from './native-preview.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const nextRequire = createRequire(require.resolve('next/package.json'));
const { loadEnvConfig } = nextRequire('@next/env');
const mode = process.argv[2];
if (mode !== 'dev' && mode !== 'build') throw new Error('Expected dev or build.');
loadEnvConfig(root, mode === 'dev');
await mkdir(resolve(root, 'native/public'), { recursive: true });
for (const name of ['habit-tracker-icon.png', 'favicon.ico']) {
  await cp(resolve(root, 'public', name), resolve(root, 'native/public', name));
}
const markerPath = resolve(root, 'native/public', nativePreviewPath.slice(1));
if (mode === 'dev') {
  const projectId = createHash('sha256').update(root).digest('hex');
  await writeFile(markerPath, JSON.stringify({ kind: 'habit-tracker-native-preview', projectId }));
  const host = process.env.TAURI_DEV_HOST ?? '127.0.0.1';
  const status = await checkNativePreview({ host, port: 1420, projectId });
  if (status === 'reusable') {
    console.log('Reusing the native preview already running on port 1420.');
    process.exit(0);
  }
  if (status === 'occupied') {
    console.error(
      'Port 1420 is occupied by another server. Stop that server before starting the native app.',
    );
    process.exit(1);
  }
} else {
  await rm(markerPath, { force: true });
}
const args = [require.resolve('next/dist/bin/next'), mode, 'native', '--webpack'];
if (mode === 'dev')
  args.push('--hostname', process.env.TAURI_DEV_HOST ?? '0.0.0.0', '--port', '1420');
const child = spawn(process.execPath, args, {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, NEXT_PUBLIC_NATIVE_APP: 'true' },
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
