/**
 * PermissionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  friendlyName: 'Observe my session permissions',


  description: 'Subscribe to the logged-in user\'s session so that you receive socket broadcasts when logged out in another tab.',


  exits: {

    success: {
      description: 'The requesting socket is now subscribed to socket broadcasts about the logged-in user\'s session.',
    },

  },
};

