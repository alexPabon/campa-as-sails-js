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
    let orderBy = this.req.query.sort??'createdAt ASC';
    let perPage = (this.req.query.perPage && parseInt(this.req.query.perPage) > 0)?parseInt(this.req.query.perPage):25;
    let page = (this.req.query.page && parseInt(this.req.query.page) > 0)?parseInt(this.req.query.page):1;
    let goToPage = parseInt(((page -1) * perPage));
    let userList = [];
    let totalFilter = '';
    const sortPermit = [
      'createdAt ASC', 'createdAt DESC',
      'fullName ASC', 'fullName DESC',
      'emailAddress ASC', 'emailAddress DESC',
      'permission ASC', 'permission DESC',
    ]

    if(!sortPermit.includes(orderBy))
      orderBy = 'createdAt ASC';

    if(orderBy === 'permission DESC' || orderBy === 'permission ASC'){

      // filter
      if(search == '') {
        userList = await User.find({
          where: {
            isSuperAdmin: 0,
            id: {'!=': this.req.session.userId}
          }
        }).populate('permissions', {limit: 1});
      }else{
        search = search.trim();

        userList = await User.find({
          where: {
            or: [
              {fullName: {contains: search}},
              {emailAddress: {contains: search}}
            ],
            isSuperAdmin: 0,
            id: {'!=': this.req.session.userId}
          }
        }).populate('permissions', {limit: 1});

        totalFilter = await User.count({
          where: {
            or: [
              {fullName: {contains: search}},
              {emailAddress: {contains: search}}
            ],
            isSuperAdmin: 0,
            id: {'!=': this.req.session.userId}
          }
        });
      }


      // sort by permissions
      userList.sort((userA, userB) => {
        const permissionsA = userA.permissions.length > 0 ? userA.permissions[0] : null;
        const permissionsB = userB.permissions.length > 0 ? userB.permissions[0] : null;

        if (permissionsA && permissionsB && orderBy === 'permission DESC') {
          return permissionsB.id - permissionsA.id;
        }else if (permissionsA && permissionsB && orderBy === 'permission ASC') {
          return permissionsA.id - permissionsB.id;
        }else if (permissionsA) {
          return -1;
        } else if (permissionsB) {
          return 1;
        } else {
          return 0;
        }
      });

      // paginate
      let endIndex = (goToPage + perPage);
      console.log('***********************************')
      console.log(goToPage);
      console.log(endIndex);
      console.log('********* end ********************')
      const paginatedUserList = userList.slice(goToPage, endIndex);

      userList = paginatedUserList;


    }else {


      // *************************  orderby != permission ***********************
      // ***********************************************************************
      if (search == '') {
        userList = await User.find({
          where: {
            isSuperAdmin: 0,
            id: {'!=': this.req.session.userId}
          }
        }).populate('permissions', {limit: 1}).sort(orderBy).limit(perPage).skip(goToPage);
      } else {

        search = search.trim();

        userList = await User.find({
          where: {
            or: [
              {fullName: {contains: search}},
              {emailAddress: {contains: search}}
            ],
            isSuperAdmin: 0,
            id: {'!=': this.req.session.userId}
          }
        }).populate('permissions', {limit: 1}).sort(orderBy).limit(perPage).skip(goToPage);

        totalFilter = await User.count({
          where: {
            or: [
              {fullName: {contains: search}},
              {emailAddress: {contains: search}}
            ],
            isSuperAdmin: 0,
            id: {'!=': this.req.session.userId}
          }
        });
      }
    }

    // *******************************************************

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
