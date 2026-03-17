
module.exports = function requireAdmin(req, res, next) {
  const role = req.user?.role;
  const isAdmin = role === 'university_admin' || role === 'super_admin';
  if (!isAdmin) return res.status(403).json({ message: 'Forbidden' });
  return next();
};
