const jwt = require('jsonwebtoken');

module.exports = async function (req, res, proceed) {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({error: 'Token not provided or in incorrect format'});
  }

  const token = authHeader.split(' ')[1];
  const secret = sails.config.jwtConfig.secret();

  try {

    const decoded = jwt.verify(token, secret);
    req.userId = decoded.userId;
    req.me = decoded;

    return proceed();
  } catch (error) {
    return res.status(401).json({error});
  }

};
