import bcrypt from 'bcryptjs';

// Lazy Prisma client like other API routes
let prisma = global.prisma;
function getPrisma() {
  if (!prisma) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
    if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
  }
  return prisma;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} not allowed`);
  }

  const prisma = getPrisma();
  const { email, password, nombre } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: { email, password: hashed, nombre },
    });

    // do not return password
    const { password: _p, ...safe } = user;
    return res.status(201).json({ ok: true, user: safe });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
