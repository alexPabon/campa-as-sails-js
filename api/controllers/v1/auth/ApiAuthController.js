/**
 * ApiAuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const jwt = require('jsonwebtoken');

module.exports = {


  /**
   * `ApiAuthController.login()`
   */
  login: async function (req, res) {

    const {username, password} = req.allParams();
    const {secret, expiresIn} = sails.config.jwtConfig;
    const jwtSecrect = secret();
    const jwtExpiresIn = expiresIn();

    if (!username || !password) {
      return res.status(422).json({error: 'Username or password not provided'});
    }

    const user = await User.findOne({
      emailAddress: username.toLowerCase(),
    }).populate('permissions', {select: ['section', 'role', 'permission']});

    try {

      if (!user) {
        throw 'badCombo';
      }

      await sails.helpers.passwords.checkPassword(password, user.password).intercept('incorrect', 'badCombo');

      const payload = {
        userId: user.id,
        fullName: user.fullName,
        emailAddress: user.emailAddress,
        isSuperAdmin: user.isSuperAdmin,
        permission: user.permissions,
      }
      const token = jwt.sign(payload, jwtSecrect, {expiresIn: jwtExpiresIn});

      return res.json({
        token: token,
        expiresIn: jwtExpiresIn,
      });

    } catch (error) {
      return res.status(401).json({error: 'Invalid credentials'});
    }
  },

  /**
   * `ApiAuthController.refreshToken()`
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  refreshToken: async function (req, res) {

    const {secret, expiresIn, jwtRegistrationEvents} = sails.config.jwtConfig;
    const jwtSecrect = secret();
    const jwtExpiresIn = expiresIn();

    const authHeader = req.headers.authorization;
    const {username} = req.allParams();

    if (!username) {
      return res.status(422).json({error: 'username not provided'});
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({error: 'Token not provided or in incorrect format'});
    }

    let token = authHeader.split(' ')[1];

    const user = await User.findOne({
      emailAddress: username.toLowerCase(),
    }).populate('permissions', {select: ['section', 'role', 'permission']});

    // verify token
    try {

      if (!user) {
        throw {
          name: "JsonWebTokenError",
          message: "invalid signature"
        };
      }

      const decoded = jwt.verify(token, jwtSecrect, {ignoreExpiration: false});
      const date = Math.floor(Date.now() / 1000);
      let exp = Math.floor((decoded.exp - date) / 60);

      if (user.emailAddress != decoded.emailAddress) {
        exp = jwtExpiresIn;
        token = jwt.sign({userId: 0}, 'invalid', {expiresIn: jwtExpiresIn});
        jwtRegistrationEvents(`Token refresh, credential violation by user ${user.emailAddress} with user ${decoded.emailAddress} token from ip address ${req.ip}`);
      } else if (exp < 5) {
        throw {name: 'TokenExpiredError'}
      }

      return res.json({
        token: token,
        expiresIn: `${exp}m`,
      });

    } catch (error) {

      if (error.name === 'TokenExpiredError') {

        // generate new token
        try {

          if (!user) {
            throw 'badCombo';
          }

          const payload = {
            userId: user.id,
            fullName: user.fullName,
            emailAddress: user.emailAddress,
            isSuperAdmin: user.isSuperAdmin,
            permission: user.permissions,
          }
          token = jwt.sign(payload, jwtSecrect, {expiresIn: jwtExpiresIn});

          return res.json({
            token: token,
            expiresIn: jwtExpiresIn
          });
        } catch (error) {
          return res.status(401).json({error: 'Invalid credentials'});
        }

      }

      return res.status(401).json({error});
    }
  },

};

