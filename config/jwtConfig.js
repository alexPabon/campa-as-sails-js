module.exports.jwtConfig = {

  secret: function () {
    const date = new Date();
    const jwtSecret = process.env.JWT_SECRET || 'secret';

    return `${jwtSecret}_${date.getMonth()}_${date.getDay()}`;
  },
  expiresIn: function () {
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN_MIN || 60;
    return `${jwtExpiresIn}m`
  },

  jwtRegistrationEvents: function (errorMsg) {
    const fs = require('fs');
    const moment = require('moment-timezone');
    const filePath = './storage/logs/jwt-events.log';
    const timestamp = moment().tz('Europe/Madrid');
    const logMessage = `${timestamp.format('YYYY-MM-DDTHH:mm:ss')}: ${errorMsg}\n`;

    fs.appendFile(filePath, logMessage, (err) => {
      if (err) {
        console.error('Error al escribir en el archivo de registro:', err);
      }
    });
  }

}

