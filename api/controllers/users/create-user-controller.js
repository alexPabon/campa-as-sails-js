module.exports = {

  inputs: {

    fullName:  {
      required: true,
      type: 'string',
      example: 'Frida Kahlo de Rivera',
      description: 'The user\'s full name.',
    },

    emailAddress: {
      required: true,
      type: 'string',
      isEmail: true,
      description: 'The email address for the new account, e.g. m@example.com.',
      extendedDescription: 'Must be a valid email address.',
    },

    password: {
      required: true,
      type: 'string',
      maxLength: 200,
      example: 'passwordlol',
      description: 'The unencrypted password to use for the new account.'
    },

    role: {
      required: true,
      type: 'string',
      description: 'The role and privilege of the new user.',

    },

  },


  exits: {

    success: {
      statusCode: 200,
    },
  },


  fn: async function ({fullName, emailAddress, password, role}) {

    let newEmailAddress = emailAddress.toLowerCase();
    let exists = await User.findOne({emailAddress:newEmailAddress});

    if(!exists){

      let newEmailAddress = emailAddress.toLowerCase();
      let newUserRecord = await User.create({
        fullName: fullName.trim(),
        emailAddress: newEmailAddress,
        password: await sails.helpers.passwords.hashPassword(password),
      }).fetch();

      if(newUserRecord){
        let permissions = Permission.customCreateRole(role, newUserRecord.id);
      }

      return {
        ok:true,
        user: newUserRecord,
        role: sails.__(`roles.${role}`)
      }

    }else {
      return {
        ok:false,
      }
    }

  }

};
