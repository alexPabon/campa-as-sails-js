const {generatePaginationLinks} = require('../../utils/paginationUtil');
const MagkamClient = sails.models.magkamclient;

module.exports = {

  friendlyName: 'View user list page',


  description: 'Display the "clients-list" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/clients/view-clients-list',
      description: ''
    },

  },


  fn: async function () {

    let section = sails.config.userPermission.sections[1];
    let basePath = section.url;
    this.res.locals.me.sectName = section.name;
    let search = this.req.query.search || '';
    let orderBy = this.req.query.sort || 'name ASC';
    let perPage = (this.req.query.perPage && parseInt(this.req.query.perPage) > 0)?parseInt(this.req.query.perPage):25;
    let page = (this.req.query.page && parseInt(this.req.query.page) > 0)?parseInt(this.req.query.page):1;
    let goToPage = parseInt(((page -1) * perPage));
    let clientList = [];
    let totalFilter = '';
    const sortPermit = ['name ASC', 'name DESC'];

    if(!sortPermit.includes(orderBy)) {
      orderBy = 'name ASC';
    }

    if(search === ''){

      clientList = await MagkamClient.find().sort(orderBy).limit(perPage).skip(goToPage);

    }else{

      search = search.trim();

      clientList = await MagkamClient.find({
        where:{
          name:{contains: search}
        }
      }).sort(orderBy).limit(perPage).skip(goToPage);

      totalFilter = await MagkamClient.count({
        where:{
          name:{contains: search}
        }
      });
    }

    // end list or filter

    let total = await MagkamClient.count();

    let params = {
      total:total,
      totalResults:totalFilter,
      baseUrl:basePath,
      perPage:perPage,
      currentPage:page,
      search:search,
      orderBy:orderBy
    };

    let pagination = generatePaginationLinks(params);

    return {clients: clientList, pagination:pagination};

  }


};
