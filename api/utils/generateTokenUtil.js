const jwt = require('jsonwebtoken');
module.exports = {
  generateToken: function (user, res) {
    const {secret, expiresIn} = sails.config.jwtConfig;
    const jwtSecrect = secret();
    const jwtExpiresIn = expiresIn();

    const payload = {
      userId: user.id,
      fullName: user.fullName,
      emailAddress: user.emailAddress,
      lang: user.lang,
      isSuperAdmin: user.isSuperAdmin,
      permission: user.permissions,
    };

    let token = jwt.sign(payload, jwtSecrect, {expiresIn: jwtExpiresIn});

    return res.json({
      token: token,
      expiresIn: jwtExpiresIn,
      lang: user.lang,
    });
  }
};
