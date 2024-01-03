const ipRangeCheck = require('ip-range-check');
const moment = require('moment-timezone');

const ip = require('ip');
const fs = require('fs');

module.exports = async function (req, res, proceed) {

  const allowedIPsString = process.env.ALLOWED_IPS || '::1';
  const allowedIPsArray = allowedIPsString.split(',').map(ip => ip.trim());
  const allowedIPs = [
    '127.0.0.1',
  ].concat(allowedIPsArray);

  let clientIP = req.ip;

  if (clientIP === '::1') {
    return proceed();
  }

  if (ip.isV6Format(clientIP)) {
    clientIP = clientIP.split('::ffff:')[1];
  }

  // console.log('Dirección IP de la solicitud:', clientIP);

  const isAllowedIP = allowedIPs.some(ip => {
    if (ip.includes('/')) {
      return ipRangeCheck(clientIP, ip);
    } else {
      return clientIP === ip;
    }
  });

  if (isAllowedIP) {
    return proceed();
  } else {

    const filePath = './storage/logs/access-denied-to-ip.log';
    const timestamp = moment().tz('Europe/Madrid');
    const errorMsg = `Access denied from this IP address: ${clientIP}`;
    const logMessage = `${timestamp.format('YYYY-MM-DDTHH:mm:ss')}: ${errorMsg}\n`;

    fs.appendFile(filePath, logMessage, (err) => {
      if (err) {
        console.error('Error al escribir en el archivo de registro:', err);
      }
    });

    return res.status(403).json({error: errorMsg});
  }

};
