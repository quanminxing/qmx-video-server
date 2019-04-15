'use strict';
const Service = require('egg').Service;


class KeyService extends Service {
    async insert(obj) {
        const result = await this.app.mysql.insert('video_key', {
            name: obj.name,
            parent_id: obj.parent_id,
            level: obj.level,
        });

        return result;
    }

    // 获取列表
    async list(pageNum, pageSize) {
        const articles = await this.app.mysql.query('select id,name,parent_id,level from video_key;', [pageSize, (pageNum - 1) * pageSize]);
        return articles;
    }

    // 获取某条信息
    async find(id) {
        const article = await this.app.mysql.get('video_key', { id });

        return article;
    }


    // 总数
    async count(where) {
        const count = await this.app.mysql.query('select count(*) from video_key where ?', [where]);

        return count[0]['count(*)'];
    }

    // 更新
    async update(data) {
        const result = await this.app.mysql.update('video_key', data);

        return result.affectedRows === 1;
    }

    // 删除
    async remove(id) {
        const result = await this.app.mysql.delete('video_key', {
            id: id
        });

        return result.affectedRows === 1;
    }

}

module.exports = KeyService

