const verifyN8nSecret = (req, res, next) => {
  const configuredSecret = process.env.N8N_SHARED_SECRET;

  if (!configuredSecret) {
    return next();
  }

  const receivedSecret = req.headers['x-n8n-secret'] || req.query.secret;

  if (receivedSecret !== configuredSecret) {
    return res.status(401).json({ message: 'Secret n8n invalide.' });
  }

  next();
};

module.exports = {
  verifyN8nSecret
};
