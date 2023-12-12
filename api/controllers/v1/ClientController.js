const {generatePaginationLinks, getFilters} = require("../../utils/paginationUtil");
const {getUserCanDo} = require("../../utils/userCanDoUtils");
const url = require("url");

module.exports = {

friendlyName: 'View user list page',

description: 'Display the "users-list" page.',

  exits: {

    success: {
      description: 'The requesting socket is now subscribed to socket broadcasts about the logged-in user\'s session.',
    },

  },

  cli_hola: function (req, res) {
    return res.send("clientes hola!");
  },
  /**
   * List of clients
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  list: async function (req, res) {

    let basePath = sails.config.userPermission.api.clients.url;
    let filter = getFilters(req);
    let clientList = [];
    let totalFilter = '';
    const sortPermit = ['name ASC', 'name DESC'];

    if(!sortPermit.includes(filter.orderBy))
      filter.orderBy = 'name ASC';

    if(filter.search == ''){

      clientList = await MagkamClient.find().sort(filter.orderBy).limit(filter.perPage).skip(filter.goToPage);

    }else{

      filter.search = filter.search.trim();

      clientList = await MagkamClient.find({
        where:{
          name:{contains: filter.search}
        }
      }).sort(filter.orderBy).limit(filter.perPage).skip(filter.goToPage);

      totalFilter = await MagkamClient.count({
        where:{
          name:{contains: filter.search}
        }
      });
    }

    // end list or filter

    let total = await MagkamClient.count();

    let params = {
      total:total,
      totalResults:totalFilter,
      baseUrl:basePath,
      perPage:filter.perPage,
      currentPage:filter.page,
      search:filter.search,
      orderBy:filter.orderBy
    };

    let pagination = generatePaginationLinks(params);

    return res.json({
      clientList: clientList,
      pagination: pagination,
      sortPermit: sortPermit,
      baseUrl: req.baseUrl,
    });
  }

};

