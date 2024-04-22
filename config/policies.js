/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

const groupPolicyApi = ['checkIPPolicy','is-logged-in-by-api','throttle'];

module.exports.policies = {

  '*': 'is-logged-in',

  // Bypass the `is-logged-in` policy for:
  'entrance/*': true,
  'account/logout': true,
  'view-homepage-or-redirect': true,
  'view-faq': true,
  'view-contact': true,
  'legal/view-terms': true,
  'legal/view-privacy': true,
  'deliver-contact-form-message': true,
  'users/users-list':'access/user/can-see-user-police',
  'users/create-user-controller':'access/user/can-create-user-police',
  'users/edit-user-view':'access/user/can-edit-user-police',
  'users/edit-user-controller':'access/user/can-edit-user-police',
  'users/edit-user-permission-controller':'access/user/can-edit-user-police',
  'users/delete-user-controller':'access/user/can-delete-user-police',
  // api policies
  'v1/*': groupPolicyApi,
  'v1/auth/ApiAuthController': {
    login:['checkIPPolicy','throttleLogin'],
  },
  'v1/ClientController': {
    create:[...groupPolicyApi,'request/clientRequest'],
  }

};
