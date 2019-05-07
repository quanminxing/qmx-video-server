'use strict';
const Service = require('egg').Service;


class FavService extends Service {
    async insert(obj) {
        let result;
        const exist = await this.app.mysql.select('video_user_fav', {
            where: {
                user_id: obj.user_id,
                video_id: obj.video_id,
            },
        });

        if (exist && exist.length !== 0) {
            result = await this.app.mysql.update('video_user_fav', {
                id: exist[0].id,
                datetime: this.app.mysql.literals.now,
            });
        } else {
            result = await this.app.mysql.insert('video_user_fav', {
                user_id: obj.user_id,
                video_id: obj.video_id,
                datetime: this.app.mysql.literals.now,
            });
        }

        return result;
    }

    // 获取某人列表
    async listByUser(pageNum, pageSize, openid) {
        const articles = await this.app.mysql.query('select VUF.video_id, VUF.datetime ,VV.name,VV.price,VV.url,VV.short_image, VV.waterfall_image, VV.short_image, VV.classify_id, VV.category_id from video_user_fav AS VUF LEFT JOIN video_video AS VV on VV.id = VUF.video_id where VUF.user_id = ? order by VUF.datetime desc limit ? offset ?;', [openid, pageSize, (pageNum - 1) * pageSize]);
        return articles;
    }
    // 获取某条信息
    async find(id) {
        const article = await this.app.mysql.get('video_user_fav', { id });
        return article;
    }

    // 获取某条信息是否被收藏
    async findByUser(openid, id) {
        const articles = await this.app.mysql.query('select video_id from video_user_fav where user_id = ? and video_id = ?;', [openid, id]);
        return articles;
    }


    // 总数
    async count(where) {
        const count = await this.app.mysql.query('select count(*) from video_user_fav where ?', [where]);

        return count[0]['count(*)'];
    }

    // 更新
    async update(data) {
        const result = await this.app.mysql.update('video_user_fav', data);

        return result.affectedRows === 1;
    }

    // 删除
    async remove(id) {
        const result = await this.app.mysql.delete('video_user_fav', {
            id: id
        });

        return result.affectedRows === 1;
    }

    async deleteFromUser(ids, openid) {
        const result = await this.app.mysql.query('delete from video_user_fav where video_id in(' + ids + ') and user_id = ?', [openid]);

        return result
    }

}

module.exports = FavService