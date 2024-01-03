module.exports = {


  friendlyName: 'View homepage or redirect',


  description: 'Display or redirect to the appropriate homepage, depending on login status.',


  exits: {

    success: {
      statusCode: 200,
      description: 'Requesting user is a guest, so show the public landing page.',
      viewTemplatePath: 'pages/homepage'
    },

    redirect: {
      responseType: 'redirect',
      description: 'Requesting user is logged in, so redirect to the internal welcome page.'
    },

  },


  fn: async function () {

    if (this.req.me) {
      throw {redirect:'/welcome'};
    }

    const languages = sails.config.i18n.locales;
    let lang = this.req.query.lang;

    if(lang !== 'undifined' && languages.includes(lang)){
      this.req.setLocale(lang);
    }

    return {};

  }


};
