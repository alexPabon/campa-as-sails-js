module.exports = {


  friendlyName: 'View forgot password',


  description: 'Display "Forgot password" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/entrance/forgot-password',
    },

    redirect: {
      description: 'The requesting user is already logged in.',
      extendedDescription: 'Logged-in users should change their password in "Account settings."',
      responseType: 'redirect',
    }

  },


  fn: async function () {

    if (this.req.me) {
      throw {redirect: '/'};
    }

    const languages = sails.config.i18n.locales;
    let lang = this.req.query.lang;

    if(lang !== 'undifined' && languages.includes(lang)){
      this.req.setLocale(lang);
    }

    return {};

  }


};
