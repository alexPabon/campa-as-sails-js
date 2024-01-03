function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * change language in user profile
 * @type {{fn: ((function(): Promise<*|undefined>)|*)}}
 */
module.exports = {


  fn: async function () {

    let lang = this.req.query.lang;
    let userId = this.res.locals.session.userId;
    const url = this.req.headers.referer;

    try {

      User.changeLanguageUser(lang, userId).catch(err => {
        console.log(err);
      });

      await sleep(500);
      return this.res.redirect(url);

    } catch (error) {
      console.error(error);
      return this.res.redirect('/welcome');
    }

  }
};
