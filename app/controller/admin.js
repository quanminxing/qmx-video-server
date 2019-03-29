'use strict';

const moment = require('moment');

exports.loginByWechat = function* () {
  try {
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
  const work_id = this.query.userid ? this.query.userid : this.session.user.id;
  let user = yield this.service.people.find(work_id);

  if (this.session.user.auth === 0) {
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
  const work_id = this.query.userid ? this.query.userid : this.session.user.id;
  let result, total;
  result = yield this.service.workerLog.listByUser(pageNum, pageSize, work_id);
  total = yield this.service.workerLog.count({ work_id });

  result = result.map((d) => {
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

exports.getSTS = function* () {
  // console.log(this.oss.options.accessKeyId);
  // this.oss.options.accessKeyId = 'LTAI22EYvc2T0NRK'
  // this.oss.options.accessKeySecret = 'tvCWJfWc2x0WXWu0R5VfBHV0P3OAQy'
  const bucket1_sts = this.oss.createInstance(this.app.config.bucket1_sts)
  const policy_video = {
    "Statement": [
      {
        "Action": [
          "oss:Put*",
          "oss:Get*"
        ],
        "Effect": "Allow",
        "Resource": ["acs:oss:*:*:qmx-video/video/*"],
      }
    ],
    "Version": "1"
  }
  const policy_image = {
    "Statement": [
      {
        "Action": [
          "oss:Put*"
        ],
        "Effect": "Allow",
        "Resource": ["acs:oss:*:*:qmx-video/image/*"],
      }
    ],
    "Version": "1"
  }
  let stskey
  if (this.request.query.filetype == 'video') {
    stskey = yield bucket1_sts.assumeRole('acs:ram::1700221430231057:role/aliyunosstokengeneratorrole', policy_video, 15 * 60, 'sts-serssion')
  } else if (this.request.query.filetype == "image") {
    stskey = yield bucket1_sts.assumeRole('acs:ram::1700221430231057:role/aliyunosstokengeneratorrole', policy_image, 15 * 60, 'sts-serssion')
  }

  // const bucket1 = this.oss.createInstance({
  //   endpoint: 'oss-cn-hangzhou.aliyuncs.com',
  //   accessKeyId: stskey.credentials.AccessKeyId,
  //   accessKeySecret: stskey.credentials.AccessKeySecret,
  //   stsToken: stskey.credentials.SecurityToken,
  //   bucket: 'qmx-video'
  // })
  // const result = yield bucket1.put('video/test.xlsx', './app/public/assets/tpl.xlsx')
  this.body = {
    sts: {
      accessKeyId: stskey.credentials.AccessKeyId,
      accessKeySecret: stskey.credentials.AccessKeySecret,
      stsToken: stskey.credentials.SecurityToken,
      endpoint: 'oss-cn-hangzhou.aliyuncs.com',
      bucket: 'qmx-video'
    }
  }
};