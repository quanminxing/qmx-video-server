'use strict';

const moment = require('moment');
const Controller = require('egg').Controller;
class AdminController extends Controller {
  async loginByWechat() {
    try {
      let appId = 'wx52c4f518bbba52b5';
      let secret = 'a03859eb4bcb57f3cc09995a01077c56';
      let { js_code } = this.ctx.request.body;
      console.log(js_code)
      let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${js_code}&grant_type=authorization_code`;
      let result = await this.app.curl(url);
      console.log(result)
      this.ctx.body = JSON.parse(result.data);
    }
    catch (e) {
      console.log(e);
      this.ctx.body = '';
    }
  }



  async index() {
    const query = this.ctx.request.query;
    const work_id = this.ctx.session && this.ctx.session.user && this.ctx.session.user.id ? this.ctx.session.user.id : '';
    let user = await this.service.people.find(work_id);

    // if (this.ctx.session.user.auth === 0) {
    //   //非管理员不能查看
    // }
    await this.ctx.render('index.html', {
      current: "people",
      key: await this.service.keyUnit.count(
        'work_id = ' + work_id
      ),
      video: await this.service.video.count(` and work_id = ${work_id}`),
      business: await this.service.business.count({
        work_id
      }),
      bill: await this.service.bill.count({
        work_id
      }),
      title: "员工信息",
      user
    });

  };


  async list() {
    const query = this.ctx.request.query;
    const pageNum = +query.pageNumber || 1;
    const pageSize = +query.pageSize || 100;
    const work_id = this.ctx.session && this.ctx.session.user && this.ctx.session.user.id ? this.ctx.session.user.id : '';
    let result, total;
    result = await this.service.workerLog.listByUser(pageNum, pageSize, work_id);
    total = await this.service.workerLog.count({ work_id });

    result = result.map((d) => {
      d.time = moment(d.time).format('YYYY-MM-DD hh:mm:ss');
      return d;
    });

    this.ctx.body = {
      pageNumber: pageNum,
      pageSize,
      totalRow: total,
      totalPage: total > pageSize ? total % pageSize : 1,
      list: result
    };
  }

  async adminLogin() {

    await this.ctx.render('login.html', {

    });
  };

  async adminLogout() {
    this.ctx.session.adminLogin = false;
    this.ctx.session.user = null;
    await this.ctx.render('login.html');
  };

  async login() {
    const name = this.ctx.request.body.name;
    const password = this.ctx.request.body.password;
    const login = await this.service.people.login(name, password);

    if (login && login.length !== 0) {
      this.ctx.session.adminLogin = true;
      this.ctx.session.user = login[0];
      if (this.ctx.session.user.auth === 0) {
        this.ctx.session.user.position = '管理员'
      } else {
        this.ctx.session.user.position = '员工'
      }
      this.ctx.redirect('/manager/index');
    } else {
      await this.ctx.render('login.html', {
        msg: '用户名或密码错误',
      });
    }
  };

  async getSTS() {
    // console.log(this.oss.options.accessKeyId);
    // this.oss.options.accessKeyId = 'LTAI22EYvc2T0NRK'
    // this.oss.options.accessKeySecret = 'tvCWJfWc2x0WXWu0R5VfBHV0P3OAQy'
    const bucket1_sts = this.app.oss.createInstance(this.app.config.bucket1_sts)
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
    if (this.ctx.request.query.filetype == 'video') {
      stskey = await bucket1_sts.assumeRole('acs:ram::1700221430231057:role/aliyunosstokengeneratorrole', policy_video, 15 * 60, 'sts-serssion')
    } else if (this.ctx.request.query.filetype == "image") {
      stskey = await bucket1_sts.assumeRole('acs:ram::1700221430231057:role/aliyunosstokengeneratorrole', policy_image, 15 * 60, 'sts-serssion')
    }

    // const bucket1 = this.oss.createInstance({
    //   endpoint: 'oss-cn-hangzhou.aliyuncs.com',
    //   accessKeyId: stskey.credentials.AccessKeyId,
    //   accessKeySecret: stskey.credentials.AccessKeySecret,
    //   stsToken: stskey.credentials.SecurityToken,
    //   bucket: 'qmx-video'
    // })
    // const result = await bucket1.put('video/test.xlsx', './app/public/assets/tpl.xlsx')
    this.ctx.body = {
      sts: {
        accessKeyId: stskey.credentials.AccessKeyId,
        accessKeySecret: stskey.credentials.AccessKeySecret,
        stsToken: stskey.credentials.SecurityToken,
        endpoint: 'oss-cn-hangzhou.aliyuncs.com',
        bucket: 'qmx-video'
      }
    }
  }
}
module.exports = AdminController;