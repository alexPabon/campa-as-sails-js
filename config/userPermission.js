let spAd = 2000;
let adm = 500;
let editor = 400;
let guest = 100;

module.exports.userPermission = {
  users: {
    supAdm: spAd,
    adm: adm,
    editor: editor,
    guest: guest
  },
  canDo: {
    adm: {
      all: adm,
      delEdit: 480,
      edit: 460,
      justSee: 440,
      none: 420,
    },
    editor: {
      all: editor,
      delEdit: 380,
      edit: 360,
      justSee: 340,
      none: 320
    },
    guest: {
      all: 160,
      delEdit: 140,
      edit: 120,
      justSee: guest,
      none: 80
    }
  },
  sections: [
    {
      name: 'users',
      url:'',
      rolesPermit: ["adm"],
      subSections: [
        {
          name: 'users.list',
          url: '/users/list',
        },
      ],
    },
    {
      name: 'clients',
      url: '/clients/listados',
      rolesPermit: ["adm", "editor", "guest"],
      subSections: [],
    },

  ],
};
