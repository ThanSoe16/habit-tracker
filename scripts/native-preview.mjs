import { get } from 'node:http';

export const nativePreviewPath = '/__native-preview.json';

export function checkNativePreview({ host, port, projectId, timeoutMs = 3000 }) {
  return new Promise((resolve) => {
    const request = get(
      { hostname: host, port, path: nativePreviewPath, agent: false },
      (response) => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          body += chunk;
          if (body.length > 4096) request.destroy();
        });
        response.on('error', () => resolve('occupied'));
        response.on('end', () => {
          try {
            const marker = JSON.parse(body);
            resolve(
              response.statusCode === 200 &&
                marker.kind === 'habit-tracker-native-preview' &&
                marker.projectId === projectId
                ? 'reusable'
                : 'occupied',
            );
          } catch {
            resolve('occupied');
          }
        });
      },
    );
    const timer = setTimeout(() => request.destroy(), timeoutMs);
    request.on('close', () => clearTimeout(timer));
    request.on('error', (error) => {
      resolve(error.code === 'ECONNREFUSED' ? 'available' : 'occupied');
    });
  });
}
