import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { checkNativePreview, nativePreviewPath } from '../scripts/native-preview.mjs';

async function listen(t, handler) {
  const server = createServer(handler);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  t.after(() => {
    server.closeAllConnections();
    return new Promise((resolve) => server.close(resolve));
  });
  return server;
}

test("the launcher reuses only this project's native preview", async (t) => {
  let projectId = 'this-project';
  const server = await listen(t, (request, response) => {
    assert.equal(request.url, nativePreviewPath);
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ kind: 'habit-tracker-native-preview', projectId }));
  });
  const options = { host: '127.0.0.1', port: server.address().port, projectId };
  assert.equal(await checkNativePreview(options), 'reusable');
  projectId = 'another-project';
  assert.equal(await checkNativePreview(options), 'occupied');
});

test('another app on the port is reported without being stopped', async (t) => {
  const server = await listen(t, (_request, response) => {
    response.statusCode = 404;
    response.end('Another app');
  });
  assert.equal(
    await checkNativePreview({
      host: '127.0.0.1',
      port: server.address().port,
      projectId: 'this-project',
    }),
    'occupied',
  );
  assert.equal(server.listening, true);
});

test('an unused port allows a new preview to start', async (t) => {
  const server = await listen(t, (_request, response) => response.end());
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  assert.equal(
    await checkNativePreview({ host: '127.0.0.1', port, projectId: 'this-project' }),
    'available',
  );
});

test('an unresponsive listener does not hang the launcher', async (t) => {
  const server = await listen(t, () => {});
  assert.equal(
    await checkNativePreview({
      host: '127.0.0.1',
      port: server.address().port,
      projectId: 'this-project',
      timeoutMs: 30,
    }),
    'occupied',
  );
});
