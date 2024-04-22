
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

    const Permission = sails.models.permission;
    const sections = [...sails.config.userPermission.sections];
    const api = Object.assign({}, sails.config.userPermission.api);
    let userPerm = await Permission.convertAndMerge(api, sections);
    let permissionGenerate = [];
    let getRoleVal = sails.config.userPermission.users[`${role}`];
    let removePermission = await Permission.destroy({userId: userId}).fetch();

    if (!removePermission) {
      console.error('The permissions were not removed.');
    }

    userPerm.forEach(section => {

      if (section.rolesPermit.includes(role) || role === 'supAdm') {
        permissionGenerate.push({
          userId: userId,
          section: section.name,
          role: role,
          permission: getRoleVal
        });
      }

      if (section.rolesPermit.includes(role) || role === 'supAdm') {
        section.subSections.forEach(subSection => {
          permissionGenerate.push({
            userId: userId,
            section: subSection.name,
            role: role,
            permission: getRoleVal
          });
        });
      }
    });


    try {
      await Permission.createEach(permissionGenerate).fetch();
    } catch (error) {
      if (error.code === 'E_UNIQUE') {
        console.error('An attempt was made to insert a duplicate record:', error.code);
      } else {
        throw error;
      }
    }

    if (!Permission.customUpdateUserRole(role, userId)) {
      console.error('The isSuperAdmin role in the user table is not updated.');
    }

    return await Permission.find({userId: userId});
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

    if (role === 'supAdm') {
      isSuperAdmin = true;
    }

    let updateUser = await User.updateOne({id: userId}).set({isSuperAdmin: isSuperAdmin});

    return !!updateUser;

  },

  /**
   * Asynchronous operation that creates the permissions for all users.
   * @returns {Promise<string>}
   */
  customVerifyRoles: async function () {
    const Permission = sails.models.permission;
    const sections = [...sails.config.userPermission.sections];
    const api = Object.assign({}, sails.config.userPermission.api);
    let userPerm = await Permission.convertAndMerge(api, sections);
    let permissionGenerate = [];
    let permittedSections = [];
    const users =  await User.find().select(['id']).populate('permissions');

    userPerm.forEach(section => {

      if(!permittedSections.includes(section.name)){
        permittedSections.push(section.name);
      }

      section.subSections.forEach(subSection => {
        if(!permittedSections.includes(subSection.name)){
          permittedSections.push(subSection.name);
        }
      });

    });


    users.forEach(user => {
      if(user.permissions.length === 0){
        Permission.customCreateRole('guest', user.id);
      }else{
        userPerm.forEach(section => {
          const userRole = user.permissions[0].role;

          /** Verify if the user has a permission to the section */
          if(section.rolesPermit.includes(userRole) || userRole === 'supAdm'){
            let findPermission = user.permissions.find(permission => permission.section === section.name);
            let findGeneralPermission = permissionGenerate.find(permission => permission.section === section.name && permission.userId === user.id);
            if (!findPermission && !findGeneralPermission) {

              let template = {
                userId: user.id,
                section: section.name,
                role: userRole,
                permission: sails.config.userPermission.users[`${userRole}`]
              };
              permissionGenerate.push(template);
            }

            /** Verify if the user has a permission to the subSection */
            section.subSections.forEach(subSection => {
              let findPermission = user.permissions.find(permission => permission.section === subSection.name);
              let findGeneralPermission = permissionGenerate.find(permission => permission.section === subSection.name && permission.userId === user.id);
              if (!findPermission && !findGeneralPermission) {

                let template = {
                  userId: user.id,
                  section: subSection.name,
                  role: userRole,
                  permission: sails.config.userPermission.users[`${userRole}`]
                };
                permissionGenerate.push(template);
              }
            });
          }
        });

      }
    });

    if(permissionGenerate.length > 0){
      try {
        await Permission.createEach(permissionGenerate).fetch();
      } catch (error) {
        if (error.code === 'E_UNIQUE') {
          console.error('An attempt was made to insert a duplicate record:', error.code);
        } else {
          throw error;
        }
      }
    }

    Permission.destroy({
      section: {'nin': permittedSections}
    }).exec((err) =>{
      if (err) {
        // manejar error
        console.log(err);
      } else {
        console.log('unused sections, removed correctly');
      }
    });

    return 'insert permissions: ' + permissionGenerate.length;
  },

  /**
   * Asynchronous operation that removes duplicate permissions
   * @param userId
   * @returns {Promise<boolean>}
   */
  removeDuplicatePermissions: async function (userId) {

    const Permission = sails.models.permission;
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
    });

    if (deletePermission) {
      return true;
    }

    return false;
  },

  convertAndMerge: (api, sections) => {
    // Iterar sobre las propiedades del objeto api
    for (let key in api) {
      // Crear un nuevo objeto con la estructura de sections
      let newSection = {
        name: api[key].name,
        url: api[key].url,
        rolesPermit: api[key].rolesPermit,
        subSections: []
      };

      // Convertir las subsecciones
      for (let subKey in api[key].subSections) {
        newSection.subSections.push({
          name: api[key].subSections[subKey].name,
          url: api[key].subSections[subKey].url
        });
      }

      // Agregar el nuevo objeto al array sections
      sections.push(newSection);
    }

    // Retornar el array sections actualizado
    return sections;
  }

};

