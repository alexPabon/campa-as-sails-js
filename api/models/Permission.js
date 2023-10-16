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

    createdAt: {type: 'number', autoCreatedAt: true,},
    updatedAt: {type: 'number', autoUpdatedAt: true,},

    userId: {
      type: 'number',
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
      type: 'number',
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
    // let removePermission = await Permission.destroy({userId: userId});

    userPerm.forEach(section => {

      if (section.rolesPermit.includes(role) || role == 'supAdm') {
        permissionGenerate.push({
          userId: userId,
          section: section.name,
          role: role,
          permission: getRoleVal
        });
      }

      if (section.rolesPermit.includes(role) || role == 'supAdm') {
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

      let updatePermission = null;
      const query = {
        userId: userId,
        section: section.name
      };

      const total = await Permission.count(query);

      if(total > 1){
        const removePermission = await Permission.destroy(query);
      }else if(total == 1){
        updatePermission = await Permission.updateOne(query).set(permissionGenerate);
      }

      // If it does not contain the userId and the section, it
      // creates it with the user's data and the section.
      if (updatePermission) {
        if (section.rolesPermit.includes(role) || role == 'supAdm') {
          updatedRole.push(updatePermission);
        } else {
          let removePermission = await Permission.destroyOne({id: updatePermission.id});
        }
      } else {
        if (section.rolesPermit.includes(role) || role == 'supAdm') {
          let newRole = await Permission.create({
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

        let updatePermission = null;
        const query = {
          userId: userId,
          section: subSection.name
        };

        const total = await Permission.count(query);

        if(total > 1){
          const removePermission = await Permission.destroy(query);
        }else if(total == 1){
          updatePermission = await Permission.updateOne(query).set(permissionGenerate);
        }

        // If it does not contain the userId and the section, it
        // creates it with the user's data and the section.
        if (updatePermission) {
          if (section.rolesPermit.includes(role) || role == 'supAdm') {
            updatedRole.push(updatePermission);
          } else {
            let subRemovePermission = await Permission.destroyOne({id: updatePermission.id});
          }
        } else {
          if (section.rolesPermit.includes(role) || role == 'supAdm') {
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

  /**
   * Asynchronous operation that removes duplicate permissions
   * @param userId
   * @returns {Promise<boolean>}
   */
  removeDuplicatePermissions: async function (userId) {

    const userPermissions = await Permission.find({
      where: {userId: userId},
      select: ['section']
    });

    const sectionCounts = userPermissions.reduce((acc, permission) => {
      acc[permission.section] = (acc[permission.section] || 0) + 1;
      return acc;
    }, {});

    const sectionsWithMultipleInstances = Object.keys(sectionCounts).filter(
      (section) => sectionCounts[section] > 1
    );

    const deletePermission = await Permission.destroy({
      userId: userId,
      section: {'in': sectionsWithMultipleInstances}
    })

    if (deletePermission)
      return true;

    return false;
  }

};

