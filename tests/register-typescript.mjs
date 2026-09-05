// Use Node's TypeScript stripping with the same source alias as tsconfig.json.
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
registerHooks({
  resolve(specifier, context, nextResolve) {
    const local = specifier.startsWith('@/')
      ? resolve('src', specifier.slice(2))
      : specifier.startsWith('.') && context.parentURL
        ? fileURLToPath(new URL(specifier, context.parentURL))
        : null;
    if (local) {
      for (const candidate of [local + '.ts', local + '/index.ts']) {
        if (existsSync(candidate)) return nextResolve(pathToFileURL(candidate).href, context);
      }
    }
    return nextResolve(specifier, context);
  },
});
