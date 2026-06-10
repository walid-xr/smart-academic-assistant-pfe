const notFound = (req, res, next) => {
  const error = new Error(`Route introuvable : ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: error.message || 'Erreur serveur',
    stack: process.env.NODE_ENV === 'production' ? null : error.stack
  });
};

module.exports = {
  notFound,
  errorHandler
};
