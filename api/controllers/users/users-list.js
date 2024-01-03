const {generatePaginationLinks, getFilters} = require('../../utils/paginationUtil');
const {getUserCanDo} = require('../../utils/userCanDoUtils');
const User = sails.models.user;
module.exports = {

  friendlyName: 'View user list page',

  description: 'Display the "users-list" page.',

  exits: {

    success: {
      viewTemplatePath: 'pages/user/view-user-list',
      description: 'List of users and roles, except users with super administrator role.'
    },

  },

  fn: async function () {

    const section = sails.config.userPermission.sections[0];
    const subSectionName = section.subSections[0].name;
    this.res.locals.me.sectName = section.name;
    this.res.locals.me.subSectName = subSectionName;
    const filter = getFilters(this.req);
    let userList = [];
    let totalFilter = '';
    const sortPermit = [
      'createdAt ASC', 'createdAt DESC',
      'fullName ASC', 'fullName DESC',
      'emailAddress ASC', 'emailAddress DESC',
      'permission ASC', 'permission DESC',
    ];

    if (!sortPermit.includes(filter.orderBy)) {
      filter.orderBy = 'createdAt DESC';
    }

    if (filter.orderBy === 'permission DESC' || filter.orderBy === 'permission ASC') {

      // filter
      if (filter.search === '') {
        userList = await User.find({
          where: {
            isSuperAdmin: 0,
            id: {'!=': this.req.session.userId}
          }
        }).populate('permissions', {limit: 1});
      } else {
        filter.search = filter.search.trim();

        userList = await User.find({
          where: {
            or: [
              {fullName: {contains: filter.search}},
              {emailAddress: {contains: filter.search}}
            ],
            isSuperAdmin: 0,
            id: {'!=': this.req.session.userId}
          }
        }).populate('permissions', {limit: 1});

        totalFilter = await User.count({
          where: {
            or: [
              {fullName: {contains: filter.search}},
              {emailAddress: {contains: filter.search}}
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

        if (permissionsA && permissionsB && filter.orderBy === 'permission DESC') {
          return (permissionsA.role < permissionsB.role) ? 1 : -1;
        } else if (permissionsA && permissionsB && filter.orderBy === 'permission ASC') {
          return (permissionsA.role > permissionsB.role) ? 1 : -1;
        } else if (permissionsA) {
          return -1;
        } else if (permissionsB) {
          return 1;
        } else {
          return 0;
        }
      });

      // paginate
      let endIndex = (filter.goToPage + filter.perPage);
      const paginatedUserList = userList.slice(filter.goToPage, endIndex);

      userList = paginatedUserList;


    } else {


      // *************************  orderby != permission ***********************
      // ***********************************************************************
      if (filter.search === '') {
        userList = await User.find({
          where: {
            isSuperAdmin: 0,
            id: {'!=': this.req.session.userId}
          }
        }).populate('permissions', {limit: 1}).sort(filter.orderBy).limit(filter.perPage).skip(filter.goToPage);
      } else {

        filter.search = filter.search.trim();

        userList = await User.find({
          where: {
            or: [
              {fullName: {contains: filter.search}},
              {emailAddress: {contains: filter.search}}
            ],
            isSuperAdmin: 0,
            id: {'!=': this.req.session.userId}
          }
        }).populate('permissions', {limit: 1}).sort(filter.orderBy).limit(filter.perPage).skip(filter.goToPage);

        totalFilter = await User.count({
          where: {
            or: [
              {fullName: {contains: filter.search}},
              {emailAddress: {contains: filter.search}}
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
        id: {'!=': this.req.session.userId}
      }
    });

    let params = {
      total: total,
      totalResults: totalFilter,
      baseUrl: section.subSections[0].url,
      perPage: filter.perPage,
      currentPage: filter.page,
      search: filter.search,
      orderBy: filter.orderBy
    };

    let pagination = generatePaginationLinks(params);
    let userCanDo = getUserCanDo(this.req.me, subSectionName);

    return {
      allUsers: userList,
      moment: require('moment'),
      pagination: pagination,
      can: userCanDo
    };

  }
};
