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

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({error: 'Token not provided or in incorrect format'});
    }

    let token = authHeader.split(' ')[1];

    // verify token
    try {

      const decoded = jwt.verify(token, jwtSecrect, {ignoreExpiration: false});
      const date = Math.floor(Date.now() / 1000);
      let exp = Math.floor((decoded.exp - date) / 60);

      if (exp < 20) {

        const user = await User.findOne({
          id: decoded.userId,
        }).populate('permissions', {select: ['section', 'role', 'permission']});

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

      }

      return res.json({
        token: token,
        expiresIn: `${exp}m`,
      });

    } catch (error) {
      return res.status(401).json({error: 'Invalid credentials'});
    }
  },

};

