module.exports = {


  friendlyName: 'Update profile',


  description: 'Update the profile for the logged-in user.',


  fn: function () {


    const lang = {
      lang: this.req.getLocale(),
      endLang:'',
      userId: this.req.session.userId,
      me: this.req.me,
      session: this.req.session,
      req: this.req.lang,
      res: this.res
    };

    this.req.setLocale('en');
    this.req.session.lang = 'en';

    lang.endLang = this.req.getLocale();

    return lang;

  }


};
