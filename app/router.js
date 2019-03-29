'use strict';

module.exports = app => {
  const admin = app.role.can('admin');


  //登陆

  app.get('/adminlogin', app.controller.admin.adminLogin);
  app.get('/adminlogout', app.controller.admin.adminLogout);
  app.get('/manager/index', app.controller.admin.index);
  app.get('/manager/list', app.controller.admin.list)
  app.post('/login', app.controller.admin.login);

  //获取上传文件临时验证凭证
  app.get('/api/getSTS', app.controller.admin.getSTS);


  //商家库
  app.post('/business', admin, app.controller.business.main);
  app.get('/business', admin, app.controller.business.list);
  app.get('/manager/business', admin, app.controller.business.index);

  //套餐管理
  app.post('/package', admin, app.controller.package.main);
  app.get('/package', app.controller.package.list);
  app.get('/package/findVideoByPackageId', app.controller.package.findVideoByPackageId);
  app.get('/manager/package', admin, app.controller.package.index);

  //平台管理
  app.post('/platform', admin, app.controller.platform.main);
  app.get('/platform', app.controller.platform.list);
  app.get('/manager/platform', admin, app.controller.platform.index);

  //视频功能管理
  app.post('/usage', admin, app.controller.usage.main);
  app.get('/usage', app.controller.usage.list);
  app.get('/manager/usage', admin, app.controller.usage.index);

  //视频风格管理
  app.post('/style', admin, app.controller.style.main);
  app.get('/style', app.controller.style.list);
  app.get('/manager/style', admin, app.controller.style.index);

  //栏目管理
  app.post('/column', admin, app.controller.column.main);
  app.get('/column', app.controller.column.list);
  app.get('/column/listall', app.controller.column.listAll);
  app.get('/manager/column', admin, app.controller.column.index);

  //推荐管理
  app.post('/recommand', admin, app.controller.recommand.main);
  app.get('/recommand', admin, app.controller.recommand.list);
  app.get('/manager/recommand', admin, app.controller.recommand.index);


  //视频库
  app.get('/manager/video/detail', admin, app.controller.video.detail);

  app.post('/video', admin, app.controller.video.main);
  app.get('/video', admin, app.controller.video.list);
  app.get('/video/listByColumn', app.controller.video.listByColumn);
  app.get('/video/listByCategory', app.controller.video.listByCategory);
  app.get('/video/listByUsage', app.controller.video.listByUsage);
  app.get('/video/listByStyle', app.controller.video.listByStyle);
  app.get('/video/listByHot', app.controller.video.listByHot);
  app.get('/video/listByRecommand', app.controller.video.listByRecommand);
  app.get('/video/listByFilter', app.controller.video.listByFilter);

  app.get('/video/searchByKeyword', app.controller.video.searchByKeyword);
  app.get('/video/detail', app.controller.video.getDetail);
  app.get('/manager/video', admin, app.controller.video.index);

  //人员管理
  app.post('/people', admin, app.controller.people.main);
  app.get('/people', admin, app.controller.people.list);
  app.get('/manager/people', admin, app.controller.people.index);

  //订单管理
  app.post('/bill', app.controller.bill.main);
  app.get('/bill', admin, app.controller.bill.list);
  app.get('/manager/bill', admin, app.controller.bill.index);
  app.get('/bill/listByUser', app.controller.bill.listByUser);

  //颗粒度管理
  app.post('/key', admin, app.controller.key.main);
  app.get('/key', admin, app.controller.key.list);
  app.get('/key/listall', admin, app.controller.key.listAll);
  app.get('/manager/key', admin, app.controller.key.index);


  //类目管理
  app.post('/category', admin, app.controller.category.main);
  app.get('/category', app.controller.category.list);
  app.get('/manager/category', admin, app.controller.category.index);


  //颗粒度内容上传
  app.post('/keyunit', admin, app.controller.keyUnit.main);
  app.get('/keyunit', admin, app.controller.keyUnit.list);

  //文件上传
  app.post('/video/uploadBatch', app.controller.video.upload);

  // 微信api登录
  app.post('/api/login', app.controller.admin.loginByWechat)

  // 微信api日志

  app.post('/api/log', app.controller.log.log)
  app.get('/api/log/listByUser', app.controller.log.listByUser)
  app.post('/api/log/deleteLog', app.controller.log.deleteLog)

  // 微信api收藏
  app.post('/api/fav', app.controller.fav.fav)
  app.get('/api/fav/listByUser', app.controller.fav.listByUser)
  app.get('/api/fav/findByUser', app.controller.fav.findByUser)
  app.post('/api/fav/deleteFav', app.controller.fav.deleteFav)


  // 微信api搜索词

  app.post('/api/keyword', app.controller.keyword.add)
  app.get('/api/keyword/listByUser', app.controller.keyword.listByUser)
  app.post('/api/keyword/deleteKeyword', app.controller.keyword.deleteKeyword)

  app.get('/api/user', app.controller.user.find)
  app.post('/api/user/save', app.controller.user.save)

  app.get('/api/sendMail', app.controller.mail.sendMail)

  //banner
  app.post('/api/banner',  app.controller.banner.banner)
  app.post('/api/banner/del', app.controller.banner.remove)
  app.get('/api/banner', app.controller.banner.list)
  app.get('/api/banner/all', app.controller.banner.listAll)
  app.get('/api/banner/listById', app.controller.banner.listById)



  //app.get('/manager', admin, app.controller.admin.manager);


  //登陆
  //app.post('/adminLogin', app.controller.admin.login);


  // 管理员登陆
  // app.get('/adminlogin', app.controller.site.adminLogin);
  // app.get('/adminLogout', app.controller.site.adminLogout);

  // app.get('/500', app.controller.site.error);

  // app.get('/*', app.controller.site.notFound);

  app.get('/api/sql', app.controller.sql.checksql)
};
