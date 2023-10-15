// paginationUtil.js
/**
 * params:{
 *   total:*,
 *   totalResults:*,
 *   baseUrl:*,
 *   perPage:*,
 *   currentPage:*,
 *   search:*
 *   orderBy:*
 * }
 *
 */
module.exports = {
  generatePaginationLinks: function(params) {
    const from = (((params.currentPage -1) * params.perPage) + 1);
    let to = (params.currentPage * params.perPage);
    const totalPages = (params.totalResults != '')? Math.ceil((params.totalResults/params.perPage)): Math.ceil((params.total/params.perPage));
    let label = 1;
    params['currentPage'] = parseInt(params.currentPage);

    to = (params.totalResults != '' && to > params.totalResults) ? (to - (to - params.totalResults)) : to;
    to = (to > params.total) ? (to - (to - params.total)) : to;

    const paginate = {
      prev:null,
      currentPage: params.currentPage,
      path: params.baseUrl,
      perPage: params.perPage,
      sort: params.orderBy,
      search:params.search,
      from:from,
      to:to,
      totalPages:totalPages,
      totalResults:params.totalResults,
      total: params.total,
      links:[],
      next:null,
    }


    if (params.currentPage > 1) {
      const prevPage = (params.currentPage - 1);
      paginate['prev'] = `${params.baseUrl}?page=${prevPage}&perPage=${params.perPage}&search=${params.search}&sort=${params.orderBy}`;
    }

    for (var i=1; i <=totalPages ; i++) {

      if(i==3 && params.currentPage-5>=3 && totalPages>13){
        paginate.links.push(
          {
            rel:'...',
            url:null,
            active:false
          });
        label = (params.currentPage+5>=totalPages)? totalPages-10:params.currentPage-4;
      }
      else if(i==11 && params.currentPage+6<totalPages){
        paginate.links.push(
          {
            rel:'...',
            url:null,
            active:false
          });
        label = totalPages-2;
        i=label;
      }
      else{
        paginate.links.push(
          {
            rel:label,
            url:(params.currentPage==label)?null:`${params.baseUrl}?page=${label}&perPage=${params.perPage}&search=${params.search}&sort=${params.orderBy}`,
            active:(params.currentPage==label)?true:false
          });
      }

      label++;
    }

    if (params.currentPage < totalPages) {
      const nextPage = (params.currentPage + 1);
      paginate['next'] = `${params.baseUrl}?page=${nextPage}&perPage=${params.perPage}&search=${params.search}&sort=${params.orderBy}`;
    }

    return paginate;
  },
  getFilters: function(req) {
    let search = req.query.search??'';
    let orderBy = req.query.sort??'id DESC';
    let perPage = (req.query.perPage && parseInt(req.query.perPage) > 0)?parseInt(req.query.perPage):25;
    let page = (req.query.page && parseInt(req.query.page) > 0)?parseInt(req.query.page):1;
    let goToPage = (page -1) * perPage;

    return {
      search: search,
      orderBy: orderBy,
      perPage: perPage,
      page: page,
      goToPage: goToPage,
    }
  }
};
