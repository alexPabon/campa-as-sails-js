const {generatePaginationLinks} = require("../../utils/paginationUtil");
const url = require("url");
module.exports = {


  friendlyName: 'View user list page',


  description: 'Display the "users-list" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/user/view-user-list',
      description: 'Display the welcome page for authenticated users.'
    },

  },


  fn: async function () {

    let section = sails.config.userPermission.sections[0];
    this.res.locals.me.sectName = section.name;
    this.res.locals.me.subSectName = section.subSections[0].name;
    let search = this.req.query.search??'';
    let orderBy = this.req.query.sort??'createdAt DESC';
    let perPage = this.req.query.perPage??25;
    let page = this.req.query.page??1;
    let goToPage = ((page -1) * perPage);
    let userList = [];
    let totalFilter = '';


    if(search == '')
    {
      userList = await User.find({
        where: {
          isSuperAdmin: 0,
          id: { '!=': this.req.session.userId }
        }
      }).populate('permissions', {limit: 1}).sort(orderBy).limit(perPage).skip(goToPage);
    }
    else
    {

      search = search.trim();

      userList = await User.find({
        where: {
          or: [
            { fullName: { contains: search } },
            { emailAddress: { contains: search } }
          ],
          isSuperAdmin: 0,
          id: { '!=': this.req.session.userId }
        }
      }).populate('permissions', {limit: 1}).sort(orderBy).limit(perPage).skip(goToPage);

      totalFilter = await User.count({
        where: {
          or: [
            { fullName: { contains: search } },
            { emailAddress: { contains: search } }
          ],
          isSuperAdmin: 0,
          id: { '!=': this.req.session.userId }
        }
      });
    }

    let total = await User.count({
      where: {
        isSuperAdmin: 0,
        id: { '!=': this.req.session.userId }
      }
    });


    let params = {
      total:total,
      totalResults:totalFilter,
      baseUrl:section.subSections[0].url,
      perPage:perPage,
      currentPage:page,
      search:search,
      orderBy:orderBy
    };

    let pagination = generatePaginationLinks(params);

    console.log(pagination);


    return {
      allUsers:userList,
      moment: require('moment'),
      pagination: pagination
    };

  }


};
