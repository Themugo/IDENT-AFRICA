import { createApp } from '../server';

let app: Awaited<ReturnType<typeof createApp>> | null = null;

export default async function handler(req: Request, res: Response) {
  if (!app) {
    app = await createApp();
  }
  // @ts-expect-error - Express app passed to Vercel handler
  return app(req, res);
}
