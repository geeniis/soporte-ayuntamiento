import { requireAuth } from '../../lib/auth';

let prisma = global.prisma;
function getPrisma() {
  if (!prisma) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
    if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
  }
  return prisma;
}

async function handler(req, res) {
  prisma = getPrisma();
  if (req.method === 'POST') {
    try {
      const { ticketId, contenido } = req.body || {};
      if (!ticketId || !contenido) return res.status(400).json({ error: 'ticketId y contenido requeridos' });
      const comment = await prisma.comment.create({
        data: { contenido, ticketId: Number(ticketId), authorId: req.user.id }
      });
      return res.status(201).json({ ok: true, comment });
    } catch (e) {
      console.error('Error creando comentario:', e);
      return res.status(500).json({ error: 'Error interno al crear comentario' });
    }
  } else if (req.method === 'GET') {
    const { ticketId } = req.query;
    const where = ticketId ? { ticketId: Number(ticketId) } : {};
    const comments = await prisma.comment.findMany({ where, orderBy: { creadoEn: 'desc' } });
    return res.status(200).json(comments);
  } else {
    res.setHeader('Allow', ['GET','POST']);
    return res.status(405).end(`Método ${req.method} no permitido`);
  }
}

export default requireAuth(handler);
