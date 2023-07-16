const {generatePaginationLinks} = require("../../utils/paginationUtil");
const {getUserCanDo, getUserSections} = require("../../utils/userCanDoUtils");
const url = require("url");
module.exports = {


  friendlyName: 'View user list page',


  description: 'Display the "users-list" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/user/edit-user-view',
      description: 'Display the welcome page for authenticated users.'
    },

    redirect: {
      responseType: 'redirect',
      description: 'Requesting user is not exists'
    },

  },


  fn: async function () {

    let section = sails.config.userPermission.sections[0];
    this.res.locals.me.sectName = section.name;
    this.res.locals.me.subSectName = section.subSections[0].name;
    let userId = this.req.params.userId;

    let user = await User.findOne({ id: userId}).populate('permissions');

    if (!user) {
      throw {redirect:'/users/list'};
    }

    user['sections'] = getUserSections(this.req.me, user.permissions);

    return {
      userfields:user,
    };

  }

};
