module.exports = {
  getUserCanDo: function(req, section) {

    const sectionCanDo = {
      create: true,
      edit: true,
      delete: true
    }


    let findSection = req.permissions.find(role => role.section === section);

    if(!findSection){
      sectionCanDo.create = false;
      sectionCanDo.edit = false;
      sectionCanDo.delete = false;

      return sectionCanDo;
    }

    if(findSection.role !== 'supAdm') {

      let canDo = sails.config.userPermission.canDo[`${findSection.role}`];

      if (findSection.permission !== canDo.all) {
        sectionCanDo.create = false;
      }

      if (findSection.permission !== canDo.all && findSection.permission !== canDo.delEdit) {
        sectionCanDo.delete = false;
      }

      if (findSection.permission !== canDo.all && findSection.permission !== canDo.delEdit && findSection.permission !== canDo.edit) {
        sectionCanDo.edit = false;
      }

    }

    return sectionCanDo;
  },

  getUserSections: function(req, sections) {

    let module = {};

    if(sections && sections.length > 0){
      sections.forEach(function (sect){
        let title = sect.section.split('.',1);
        title = title[0];
        if(module[`${title}`]){
          module[`${title}`].push(sect);
        }else{
          module[`${title}`] = [sect];
        }
      });
    }

    return module;
  }


};
