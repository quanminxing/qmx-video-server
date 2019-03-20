'use strict';

module.exports = app => {
  app.role.use('admin', function() {
    //return true
    const login = this.session.adminLogin;
    if (login) {
      return true;
    }
    return false;
  });
};