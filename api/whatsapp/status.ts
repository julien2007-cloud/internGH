// GET /api/whatsapp/status — lets the site know whether real WhatsApp sending is set up.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { env, isConfigured, send } from '../_lib/whatsapp.js'

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  send(res, 200, { configured: isConfigured(), webhook: Boolean(env.verifyToken()) })
}
