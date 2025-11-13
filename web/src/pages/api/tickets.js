import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Lazily require the generated Prisma client at runtime and use a global singleton in dev
let prisma = global.prisma;
function getPrisma() {
  if (!prisma) {
  // require at runtime so the generated client in node_modules is picked up correctly
  // (we generate @prisma/client into node_modules via `prisma generate`)
  const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
    if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
  }
  return prisma;
}

// Configuración de Multer para subir archivos
const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Esta función permite que Next.js use multer sin next-connect
export const config = {
  api: {
    bodyParser: false, // importante: desactivar el body parser por defecto
  },
};

// Middleware manual para manejar la subida de archivos
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

// Handler principal
export default async function handler(req, res) {
  // ensure prisma client is initialized
  prisma = getPrisma();
  console.log('DEBUG prisma initialized:', typeof prisma, prisma && Object.keys(prisma).slice(0,10));
  if (req.method === 'POST') {
    try {
      await runMiddleware(req, res, upload.single('imagen'));

      const { titulo, descripcion } = req.body;

      const ticket = await prisma.ticket.create({
        data: {
          titulo,
          descripcion,
          imagen: req.file ? `/uploads/${req.file.filename}` : null,
          estado: 'pendiente',
        },
      });

      res.status(200).json({ ok: true, ticket });
    } catch (error) {
      console.error('Error creando ticket:', error);
      res.status(500).json({ error: 'Error interno al crear el ticket' });
    }
  } else if (req.method === 'GET') {
    const tickets = await prisma.ticket.findMany({ orderBy: { creadoEn: 'desc' } });
    res.status(200).json(tickets);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
