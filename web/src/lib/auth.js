import jwt from 'jsonwebtoken';

export function verifyToken(req) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length !== 2) return null;
  const scheme = parts[0];
  const token = parts[1];
  if (!/^Bearer$/i.test(scheme)) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    return payload;
  } catch (err) {
    return null;
  }
}

export function requireAuth(handler) {
  return async (req, res) => {
    const user = verifyToken(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = user;
    return handler(req, res);
  };
}

export function requireRole(role, handler) {
  return requireAuth((req, res) => {
    if (!req.user || req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
    return handler(req, res);
  });
}

export function requireRoles(roles, handler) {
  return requireAuth((req, res) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    return handler(req, res);
  });
}
