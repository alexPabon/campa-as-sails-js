const allApiPath = require('./userPermission').userPermission.api;
const clients = allApiPath.clients.url;

const apiPath = {
  'POST /api/auth/login' : {controller: 'v1/auth/ApiAuthController', action: 'login', csrf: false},
  'POST /api/auth/refresh-token' : {controller: 'v1/auth/ApiAuthController', action: 'refreshToken', csrf:false},
};

apiPath[`GET ${clients}`] = {controller: 'v1/ClientController', action: 'list'};

module.exports.routesApiV1 = apiPath;
