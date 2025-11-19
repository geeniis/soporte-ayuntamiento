import { requireAuth } from '../../../lib/auth';

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
  const idParam = req.query.id;
  if (!idParam) return res.status(400).json({ error: 'id requerido' });
  const id = Number(idParam);
  prisma = getPrisma();

  if (req.method === 'PATCH') {
    try {
      const { estado } = req.body || {};
      if (!estado) return res.status(400).json({ error: 'estado requerido' });
      const updated = await prisma.ticket.update({ where: { id }, data: { estado } });
      return res.status(200).json({ ok: true, ticket: updated });
    } catch (e) {
      console.error('Error actualizando ticket:', e);
      return res.status(500).json({ error: 'Error interno al actualizar' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.ticket.delete({ where: { id } });
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('Error eliminando ticket:', e);
      return res.status(500).json({ error: 'Error interno al eliminar' });
    }
  } else {
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    return res.status(405).end(`Método ${req.method} no permitido`);
  }
}

export default requireAuth(handler);
