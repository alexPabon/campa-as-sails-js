module.exports = {

  inputs: {

    permissionId: {
      required: true,
      type: 'number',
    },

    permissionValue: {
      required: true,
      type: 'number',
    },

    section: {
      required: true,
      type: 'string',
      description: 'section name',
    },

  },


  exits: {

    success: {
      statusCode: 200,
    },
  },


  fn: async function ({permissionId, permissionValue, section}) {


    let updatePermission = await Permission.updateOne({
      id: permissionId,
      section: section
    })
      .set({permission: permissionValue});

    if(!updatePermission)
      return this.res.notFound;

    return true;

  }

};
