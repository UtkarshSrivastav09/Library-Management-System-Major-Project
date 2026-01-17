const checkRole = (allowedRoles) => {
  // Normalize roles ONCE (no mutation later)
  const roles = Array.isArray(allowedRoles)
    ? allowedRoles.map(r => r.toLowerCase())
    : [allowedRoles.toLowerCase()];

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res
        .status(403)
        .json({ message: "Forbidden. User role not found." });
    }

    const userRole = req.user.role.toLowerCase();

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        message: `Forbidden. Required role(s): ${roles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = { checkRole };
