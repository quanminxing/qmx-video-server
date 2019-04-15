'use strict';

const crypto = require('crypto');
const Service = require('egg').Service;


class VideoWorkService extends Service {
  async insert(obj) {
    const md5Password = crypto.createHash('md5').update(password).digest('hex');
    const result = await this.app.mysql.insert('video_worker', {
      name: obj.name,
      phone: obj.phone,
      auth: obj.auth,
      desc: obj.desc,
      cname: obj.cname,
      password: md5Password
    });

    return result.affectedRows === 1;
  }

  // 登陆
  async login(name, password) {
    const md5Password = crypto.createHash('md5').update(password).digest('hex');

    const user = await this.app.mysql.select('video_worker', {
      where: {
        name,
        password: md5Password,
      },
    });

    return user.length;
  }

  // 更新
  async update(data) {
    const result = await this.app.mysql.update('video_worker', data);

    return result.affectedRows === 1;
  }
}

module.exports = VideoWorkService