'use strict';
const Service = require('egg').Service;


class CategoryService extends Service {
    async insert(obj) {
        const result = await this.app.mysql.insert('video_category', {
            name: obj.name,
            parent_id: obj.parent_id,
            level: obj.level,
        });

        return result;
    }

    // 获取列表
    async list(pageNum, pageSize) {
        const articles = await this.app.mysql.query('select id,name,parent_id,level from video_category;', [pageSize, (pageNum - 1) * pageSize]);
        return articles;
    }

    // 获取某条信息
    async find(id) {
        const article = await this.app.mysql.get('video_category', { id });

        return article;
    }


    // 总数
    async count(where) {
        const count = await this.app.mysql.query('select count(*) from video_category where ?', [where]);

        return count[0]['count(*)'];
    }

    // 更新
    async update(data) {
        const result = await this.app.mysql.update('video_category', data);

        return result.affectedRows === 1;
    }

    // 删除
    async remove(id) {
        const result = await this.app.mysql.delete('video_category', {
            id: id
        });

        return result.affectedRows === 1;
    }

}

module.exports = CategoryService
