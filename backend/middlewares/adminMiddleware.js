// middlewares/adminMiddleware.js
module.exports = function (req, res, next) {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
};
