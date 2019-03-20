'use strict';

const crypto = require('crypto');

module.exports = app => {
  class MonthServer extends app.Service {
    * insert(obj) {
      // const md5Password = crypto.createHash('md5').update(obj.password).digest('hex');
      const result = yield app.mysql.insert('video_worker', {
        name: obj.name,
        cname: obj.cname,
        phone:obj.phone,
        description:obj.description,
        auth:obj.auth,
        password:obj.password,
        timestamp: app.mysql.literals.now,
      });

      return result.affectedRows === 1;
    }

    // 获取列表
    * list(pageNum, pageSize) {
      const articles = yield app.mysql.query('select id,name,cname,description,phone,auth,password,timestamp from video_worker order by timestamp desc limit ? offset ?;', [ pageSize, (pageNum - 1) * pageSize ]);
      return articles;
    }

    * listAll() {
      const articles = yield app.mysql.query('select id,name,cname,description,phone,auth,password,timestamp from video_worker order by timestamp desc ');
      return articles;
    }

    // 获取某条信息
    * find(id) {
      const article = yield app.mysql.get('video_worker', { id });

      return article;
    }
    // 登陆
    * login(name, password) {
      //const md5Password = crypto.createHash('md5').update(password).digest('hex');

      const user = yield app.mysql.select('video_worker', {
        where: {
          name,
          password: password,
        },
      });

      return user;
    }
    // 搜索
    * search(pageNum, pageSize, where) {
    let sql = 'select id,name,cname,description,phone,auth,password,timestamp from video_worker where'
    sql += ' '+ where;
    sql += ' order by timestamp desc limit ? offset ?;'
    const articles = yield app.mysql.query(sql, [pageSize, (pageNum - 1) * pageSize ]);
    return articles;
  }
  // 总数
  * count(where) {
    const count = yield app.mysql.query('select count(*) from video_worker where ?', [where]);

    return count[0]['count(*)'];
  } 

    // 更新
    * update(data) {
      const result = yield app.mysql.update('video_worker', data);

      return result.affectedRows === 1;
    }

    // 删除
    * remove(id) {
      const result = yield app.mysql.delete('video_worker', {
        id:id
      });

      return result.affectedRows === 1;
    }

  }
  return MonthServer;
};
