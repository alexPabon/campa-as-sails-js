module.exports = {

  inputs: {

    fullName:  {
      required: true,
      type: 'string',
      example: 'Frida Kahlo de Rivera',
      description: 'The user\'s full name.',
    },

    userId:  {
      required: true,
      type: 'number',
    },

    emailAddress: {
      required: true,
      type: 'string',
      isEmail: true,
      description: 'The email address for the new account, e.g. m@example.com.',
      extendedDescription: 'Must be a valid email address.',
    },

    password: {
      type: 'string',
      maxLength: 200,
      example: 'passwordlol',
      description: 'The unencrypted password to use for the new account.'
    },

    role: {
      type: 'string',
      description: 'The role and privilege of the new user.',
    },

  },


  exits: {

    success: {
      statusCode: 200,
    },
  },


  fn: async function ({fullName, emailAddress, password, role, userId}) {


    let newEmailAddress = emailAddress.toLowerCase();
    let updateUser;

    if(password !='') {
      updateUser = await User.updateOne({id: userId}).set({
        fullName: fullName.trim(),
        emailAddress: newEmailAddress,
        password: await sails.helpers.passwords.hashPassword(password),
      });
    }else {
      updateUser = await User.updateOne({id: userId}).set({
        fullName: fullName.trim(),
        emailAddress: newEmailAddress,
      });
    }

    if (!updateUser)
      return this.res.notFound();

    if(role) {
      let permissions = Permission.customUpdateRole(role, userId);
    }

    return true;

  }

};
