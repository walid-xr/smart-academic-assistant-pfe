const jwt = require('jsonwebtoken');

const signToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'super_secret_jwt_key',
    {
      expiresIn: '2d'
    }
  );
};

module.exports = {
  signToken
};

