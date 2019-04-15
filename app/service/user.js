'use strict';
const Service = require('egg').Service;


class UserService extends Service {
    async insert(obj) {
        const result = await this.app.mysql.insert('video_user', {
            name: obj.name,
            company: obj.company,
            id: obj.id,
            phone: obj.phone
        });

        return result;
    }

    // 获取某条信息
    async find(openid) {
        const article = await this.app.mysql.get('video_user', { id: openid });

        return article;
    }

    // 更新
    async update(data) {
        const result = await this.app.mysql.update('video_user', data);

        return result.affectedRows === 1;
    }

}
module.exports = UserService
