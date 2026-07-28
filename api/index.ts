import type { IncomingMessage, ServerResponse } from 'http';

let app: any = null;

async function getExpressApp() {
  if (!app) {
    const { createApp } = await import('../server');
    app = await createApp();
  }
  return app;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const expressApp = await getExpressApp();
  return expressApp(req, res);
}
