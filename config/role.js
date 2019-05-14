'use strict';

module.exports = app => {
  app.role.use('admin', ctx => {
    //return true
    const login = ctx.session.adminLogin;
    const role = ctx.session.user ? ctx.session.user.position : '';
    if (login && role == '管理员') {
      return true;
    } else {
      return false;
    }
  });

  app.role.use('staff', ctx => {
    const login = ctx.session.adminLogin;
    const role = ctx.session.user ? ctx.session.user.position : '';
    if(login && (role == '员工' || role == '管理员')) {
      return true
    } else {
      return false;
    }
  })
};