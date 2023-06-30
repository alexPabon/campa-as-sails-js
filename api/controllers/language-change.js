/**
 * change language in user profile
 * @type {{fn: ((function(): Promise<*|undefined>)|*)}}
 */
module.exports = {


  fn: async function () {

    let lang = this.req.query.lang
    let userId = this.res.locals.session.userId;

    try {

      let uss = User.changeLanguageUser(lang, userId).catch(err =>{
        console.log(err);
      });

      // return this.res.redirect('back');

      return this.res.redirect('/');

    }catch (error){
      return this.res.redirect('/welcome');
    }

  }
};
