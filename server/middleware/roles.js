const ROLES_JERARQUIA = { admin: 3, editor: 2, visor: 1 };

const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.session || !req.session.usuario) return res.status(401).json({ error: 'No autenticado' });
    if (!rolesPermitidos.includes(req.session.usuario.rol)) return res.status(403).json({ error: 'No tiene permisos para esta acción' });
    next();
  };
};

const requireMinRole = (rolMinimo) => {
  const nivelMinimo = ROLES_JERARQUIA[rolMinimo];
  return (req, res, next) => {
    if (!req.session || !req.session.usuario) return res.status(401).json({ error: 'No autenticado' });
    if (ROLES_JERARQUIA[req.session.usuario.rol] < nivelMinimo) return res.status(403).json({ error: 'No tiene permisos para esta acción' });
    next();
  };
};

module.exports = { requireRole, requireMinRole };
