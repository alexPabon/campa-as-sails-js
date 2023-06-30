module.exports = {


  friendlyName: 'View login',


  description: 'Display "Login" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/entrance/login',
    },

    redirect: {
      description: 'The requesting user is already logged in.',
      responseType: 'redirect'
    }

  },


  fn: async function () {

    if (this.req.me) {
      throw {redirect: '/'};
    }

    const languages = sails.config.i18n.locales;
    let lang = this.req.query.lang

    if(lang !== 'undifined' && languages.includes(lang)){
      this.req.setLocale(lang);
    }

    return {};

  }


};
