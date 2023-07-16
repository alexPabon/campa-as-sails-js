module.exports = async function (req, res, proceed) {

  if (!req.me) {
    return res.unauthorized();
  }

  let contSection = 'users';
  let section = 'users.list';
  let findContSection = sails.config.userPermission.sections.find(section => section.name === contSection);
  let findSection = req.me.permissions.find(role => role.section === section);

  if(!findSection || !findContSection || !(findContSection.rolesPermit.includes(findSection.role) || findSection.role === 'supAdm')){
    return res.unauthorized();
  }

  let canDo = sails.config.userPermission.canDo[`${findSection.role}`];

  if(findSection.permission !== canDo.all && findSection.permission !== canDo.delEdit && findSection.permission !== canDo.edit && findSection.permission !== canDo.justSee){
    return res.unauthorized();
  }

  return proceed();

};
