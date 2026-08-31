function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Não autenticado.' });
  next();
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ error: 'Não autenticado.' });
    if (!roles.includes(req.session.user.role)) return res.status(403).json({ error: 'Sem permissão.' });
    next();
  };
}

module.exports = { requireAuth, requireRoles };
