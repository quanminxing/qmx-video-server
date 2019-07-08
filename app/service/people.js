'use strict';

const crypto = require('crypto');
const Service = require('egg').Service;

class PeopleService extends Service {
  async insert(obj) {
    // const md5Password = crypto.createHash('md5').update(obj.password).digest('hex');
    const result = await this.app.mysql.insert('video_worker', {
      username: obj.username,
      cname: obj.cname,
      phone: obj.phone,
      description: obj.description,
      auth: obj.auth,
      password: obj.password,
      timestamp: this.app.mysql.literals.now,
      email: obj.email
    });

    return result.affectedRows === 1;
  }

  async list(where, pageNum, pageSize) {

    let sql = 'select id,username,cname,description,phone,auth,email,password,timestamp from video_worker where'
    if(where) {
      sql = 'select id,username,cname,description,phone,auth,email,password,timestamp from video_worker where'
    } else {
      sql = 'select id,username,cname,description,phone,auth,email,password,timestamp from video_worker'
    }
    sql += ' ' + where;
    sql += ' order by timestamp desc limit ? offset ?;'
    const articles = await this.app.mysql.query(sql, [pageSize, (pageNum - 1) * pageSize]);
    return articles;
  }

  async listAll() {

    const articles = await this.app.mysql.query('select id,username,cname,description,phone,auth,email,password,timestamp from video_worker order by timestamp desc;');

    return articles;
  }

  // 获取某条信息
  async find(id) {
    const article = await this.app.mysql.get('video_worker', { id });

    return article;
  }
  // 登陆
  async login(username, password) {
    //const md5Password = crypto.createHash('md5').update(password).digest('hex');

    const user = await this.app.mysql.select('video_worker', {
      where: {
        username: username,
        password: password,
      },
    });

    return user;
  }
  // 搜索
  async search(pageNum, pageSize, where) {

    let sql = 'select id,username,cname,description,phone,auth,email,password,timestamp from video_worker where'

    sql += ' ' + where;
    sql += ' order by timestamp desc limit ? offset ?;'
    const articles = await this.app.mysql.query(sql, [pageSize, (pageNum - 1) * pageSize]);
    return articles;
  }
  
  // 总数
  async count(where) {
    let sql = `select count(*) from video_worker where ${where}`;
    let count = await this.app.mysql.query(sql);

    return count[0]['count(*)'];
  }

  // 更新
  async update(data) {
    const result = await this.app.mysql.update('video_worker', data);

    return result.affectedRows === 1;
  }

  // 删除
  async remove(ids) {
    const result = await this.app.mysql.delete('video_worker', {
      id: ids
    });

    return result.affectedRows === 1;
  }

}
module.exports = PeopleService;
