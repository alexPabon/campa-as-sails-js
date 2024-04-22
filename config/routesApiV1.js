const allApiPath = require('./userPermission').userPermission.api;
const clients = allApiPath.clients.url;

const apiPath = {
  /**
   * Auth
   */
  'POST /api/auth/login' : {controller: 'v1/auth/ApiAuthController', action: 'login', csrf: false},
  'POST /api/auth/refresh-token' : {controller: 'v1/auth/ApiAuthController', action: 'refreshToken', csrf:false},

  /**
   * Clients
   */
  [`GET ${clients}`] : {controller: 'v1/ClientController', action: 'list'},
  [`GET ${clients}/:id`] : {controller: 'v1/ClientController', action: 'show'},
  [`POST ${clients}`] : {controller: 'v1/ClientController', action: 'create', csrf: false, formRules: 'clientCreate'},
  [`PUT ${clients}/:id`] : {controller: 'v1/ClientController', action: 'update', csrf: false},
  [`DELETE ${clients}/:id`] : {controller: 'v1/ClientController', action: 'destroy', csrf: false},
};

// apiPath[`GET ${clients}`] = {controller: 'v1/ClientController', action: 'list'};

module.exports.routesApiV1 = apiPath;
