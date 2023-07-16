/**
 * Permission.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    userId: {
      type: 'integer',
      required: false,
      unique: false,
    },

    section: {
      type: 'string',
      required: true,
      maxLength: 100
    },

    role: {
      type: 'string',
      isIn: ['supAdm', 'adm', 'editor', 'guest'],
      defaultsTo: 'guest',
    },

    permission: {
      type: 'integer',
      defaultsTo: 100
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    userId: {
      model: 'User',
    }

  },

  /**
   * Asynchronous operation to create user permissions.
   * @param role
   * @param userId
   * @returns {Promise<*>}
   */
  customCreateRole: async function (role, userId) {

    let userPerm = sails.config.userPermission.sections;
    let permissionGenerate = [];
    let getRoleVal = sails.config.userPermission.users[`${role}`];

    userPerm.forEach(section => {

      if(section.rolesPermit.includes(role)) {
        permissionGenerate.push({
          userId: userId,
          section: section.name,
          role: role,
          permission: getRoleVal
        });
      }

      if(section.rolesPermit.includes(role)) {
        section.subSections.forEach(subSection => {
          permissionGenerate.push({
            userId: userId,
            section: subSection.name,
            role: role,
            permission: getRoleVal
          });
        })
      }
    });


    const newRole = await Permission.createEach(permissionGenerate).fetch();

    if (!Permission.customUpdateUserRole(role, userId))
      console.error('No se actualizo en role de isSuperAdmin en el usuario.')

    return newRole;
  },

  /**
   * Asynchronous operation to update user permissions.
   * @param role
   * @param userId
   * @returns {Promise<*[]>}
   */
  customUpdateRole: async function (role, userId) {

    let userPerm = sails.config.userPermission.sections;
    let getRoleVal = sails.config.userPermission.users[`${role}`];
    let updatedRole = [];
    const permissionGenerate = {
      role: role,
      permission: getRoleVal
    };

    // foreach of the sections
    userPerm.forEach((async (section) => {

      let updatePermission = await Permission.updateOne({
        userId: userId,
        section: section.name
      })
        .set(permissionGenerate);


      // If it does not contain the userId and the section, it
      // creates it with the user's data and the section.
      if (updatePermission) {
        if(section.rolesPermit.includes(role)) {
          updatedRole.push(updatePermission);
        }else{
          let removePermission = await Permission.destroyOne({id:updatePermission.id});
        }
      } else {
        if(section.rolesPermit.includes(role)) {
          const newRole = await Permission.create({
            userId: userId,
            section: section.name,
            role: role,
            permission: getRoleVal
          }).fetch();

          updatedRole.push(newRole);
        }
      }

      //sub sections
      section.subSections.forEach((async (subSection) => {

        let updatePermission = await Permission.updateOne({
          userId: userId,
          section: subSection.name
        })
          .set(permissionGenerate);


        // If it does not contain the userId and the section, it
        // creates it with the user's data and the section.
        if (updatePermission) {
          if(section.rolesPermit.includes(role)) {
            updatedRole.push(updatePermission);
          }else{
            let subRemovePermission = await Permission.destroyOne({id:updatePermission.id});
          }
        } else {
          if(section.rolesPermit.includes(role)) {
            const newRole = await Permission.create({
              userId: userId,
              section: subSection.name,
              role: role,
              permission: getRoleVal
            }).fetch();

            updatedRole.push(newRole);
          }
        }

      }));

    }));

    if (!Permission.customUpdateUserRole(role, userId))
      console.error('No se actualizo en role de isSuperAdmin en el usuario.')

    return updatedRole;
  },


  /**
   * Asynchronous operation that updates the 'user.isSuperAdmin' field
   * whether it is a super admin or not.
   * @param role
   * @param userId
   * @returns {Promise<boolean>}
   */
  customUpdateUserRole: async function (role, userId) {
    let isSuperAdmin = false;

    if (role == 'supAdm')
      isSuperAdmin = true;

    let updateUser = await User.updateOne({id: userId}).set({isSuperAdmin: isSuperAdmin});

    if (updateUser)
      return true;

    return false;

  },

};

