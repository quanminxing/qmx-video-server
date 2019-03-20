'use strict';

const moment = require('moment');

exports.loginByWechat = function* () {
  console.log('wechat login')
  try {
    console.log(this)
    let appId = 'wx52c4f518bbba52b5';
    let secret = 'a03859eb4bcb57f3cc09995a01077c56';
    let { js_code } = this.request.body;
    console.log(js_code)
    let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${js_code}&grant_type=authorization_code`;
    let result = yield this.curl(url);
    this.body = JSON.parse(result.data);
  }
  catch (e) {
    console.log(e);
    this.body = '';
  }
}

const loginRule = {
  name: 'name',
  password: 'password',
};


exports.index = function* () {
  const work_id = this.query.userid? this.query.userid :this.session.user.id;
  let user = yield this.service.people.find(work_id);

  if(this.session.user.auth === 0){
      //非管理员不能查看
  }
  yield this.render('index.html', {
    current: "people",
    key: yield this.service.keyUnit.count(
      'work_id = ' + work_id
    ),
    video: yield this.service.video.count({
      work_id
    }),
    business: yield this.service.business.count({
      work_id
    }),
    bill: yield this.service.bill.count({
      work_id
    }),
    title: "员工信息",
    user
  });

};


exports.list = function* () {
  const pageNum = +this.query.pageNumber || 1;
  const pageSize = +this.query.pageSize || 100;
  const work_id = this.query.userid? this.query.userid :this.session.user.id;
  let result, total;
  result = yield this.service.workerLog.listByUser(pageNum, pageSize, work_id);
  total = yield this.service.workerLog.count({work_id});

  result = result.map((d)=>{
    d.time = moment(d.time).format('YYYY-MM-DD hh:mm:ss');
    return d;
  });

  this.body = {
    pageNumber: pageNum,
    pageSize,
    totalRow: total,
    totalPage: total > pageSize ? total % pageSize : 1,
    list: result
  };
}

exports.adminLogin = function* () {

  yield this.render('login.html', {

  });
};

exports.adminLogout = function* () {
  this.session.adminLogin = false;
  this.session.user = null;
  yield this.render('login.html');
};

exports.login = function* () {
  // this.validate(loginRule);
  const name = this.request.body.name;
  const password = this.request.body.password;
  const login = yield this.service.people.login(name, password);

  if (login && login.length !== 0) {
    this.session.adminLogin = true;
    this.session.user = login[0];
    if (this.session.user.auth === 0) {
      this.session.user.position = '管理员'
    } else {
      this.session.user.position = '员工'
    }
    this.redirect('/manager/index');
  } else {
    yield this.render('login.html', {
      msg: '用户名或密码错误',
    });
  }

};