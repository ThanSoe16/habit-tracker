import { readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const route = process.argv[2] ?? '/habits/today';
if (!/^\/[a-z0-9/-]+$/.test(route)) throw new Error('Pass a route such as /habits/today.');
const file = `.next/server/app${route}.html`;
if (!existsSync(file)) throw new Error('Run pnpm build before measuring a prerendered route.');
const html = readFileSync(file, 'utf8');
const files = [
  ...new Set(
    [...html.matchAll(/<script[^>]*src="([^"]+)"[^>]*>/g)]
      .filter((match) => !match[0].includes('noModule'))
      .map((match) => `.next${match[1].split('?')[0].replace('/_next', '')}`),
  ),
];
let rawBytes = 0;
let gzipBytes = 0;
for (const file of files) {
  const bytes = readFileSync(file);
  rawBytes += bytes.length;
  gzipBytes += gzipSync(bytes).length;
}
console.log(
  JSON.stringify(
    {
      route,
      chunks: files.length,
      rawBytes,
      gzipBytes,
      note: 'Initial JavaScript gzip estimate; excludes on-demand chunks, fonts, media, and API data.',
    },
    null,
    2,
  ),
);
