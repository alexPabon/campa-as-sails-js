module.exports = {

  inputs: {

    emailAddress: {
      required: true,
      type: 'string',
      isEmail: true,
      description: 'The email address for the new account, e.g. m@example.com.',
      extendedDescription: 'Must be a valid email address.',
    },

    userId: {
      type: 'number',
    },
  },


  exits: {

    success: {
      statusCode: 200,
    },

    redirect: {
      responseType: 'redirect',
      description: 'Requesting user is logged in, so redirect to the internal welcome page.'
    },

  },


  fn: async function ({emailAddress, userId}) {

    let exists;
    let lowEmailAddress = emailAddress.toLowerCase();

    if (userId) {
      exists = await User.findOne({
        where: {
          emailAddress: lowEmailAddress,
          id: {'!=': userId}
        }
      });
    } else {
      exists = await User.findOne({emailAddress: lowEmailAddress});
    }

    return {
      isValid: !exists,
    };

  }

};
