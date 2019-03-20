'use strict';

const crypto = require('crypto');

module.exports = app => {
  class VideoWorkService extends app.Service {
    * insert(obj) {
      const md5Password = crypto.createHash('md5').update(password).digest('hex');
      const result = yield app.mysql.insert('video_worker', {
        name : obj.name,
        phone: obj.phone,
        auth: obj.auth,
        desc: obj.desc,
        cname: obj.cname,
        password: md5Password
      });

      return result.affectedRows === 1;
    }

    // 登陆
    * login(name, password) {
      const md5Password = crypto.createHash('md5').update(password).digest('hex');

      const user = yield app.mysql.select('video_worker', {
        where: {
          name,
          password: md5Password,
        },
      });

      return user.length;
    }
    
    // 更新
    * update(data) {
      const result = yield app.mysql.update('video_worker', data);

      return result.affectedRows === 1;
    }

  }
  return VideoWorkService;
};
