import { requireAuth, requireRoles } from '../../../lib/auth';

let prisma = global.prisma;
function getPrisma() {
  if (!prisma) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
    if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
  }
  return prisma;
}

async function baseHandler(req, res) {
  const idParam = req.query.id;
  if (!idParam) return res.status(400).json({ error: 'id requerido' });
  const id = Number(idParam);
  prisma = getPrisma();

  if (req.method === 'DELETE') {
    try {
      // Solo autor o admin/technician pueden borrar
      const comment = await prisma.comment.findUnique({ where: { id } });
      if (!comment) return res.status(404).json({ error: 'Comentario no encontrado' });
      if (comment.authorId !== req.user.id && !['admin','technician'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      await prisma.comment.delete({ where: { id } });
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('Error eliminando comentario:', e);
      return res.status(500).json({ error: 'Error interno al eliminar comentario' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Método ${req.method} no permitido`);
  }
}

export default requireAuth(baseHandler);
