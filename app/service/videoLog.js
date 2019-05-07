'use strict';
const Service = require('egg').Service;


class VideoLogService extends Service {
    async insert(obj) {
        let result;
        const exist = await this.app.mysql.select('video_log', {
            where: {
                user_id: obj.user_id,
                video_id: obj.video_id,
            },
        });

        if (exist && exist.length !== 0) {
            result = await this.app.mysql.update('video_log', {
                id: exist[0].id,
                datetime: this.app.mysql.literals.now,
            });
        } else {
            result = await this.app.mysql.insert('video_log', {
                user_id: obj.user_id,
                video_id: obj.video_id,
                datetime: this.app.mysql.literals.now,
            });
        }

        return result;
    }

    async updateHot(video_id) {
        let result;
        let exist  = await this.app.mysql.get('video_hot', {
            video_id
        });
        if(exist) {
            result = await this.app.mysql.query(`UPDATE video_hot SET pv = pv + 1, stat_time = ${this.app.mysql.literals.now} WHERE id=${exist.id};`)
        } else {
            result = await this.app.mysql.insert('video_hot', {
                video_id,
                pv: 1,
                uv:1,
                stat_time: this.app.mysql.literals.now
            })
        }
        return result;
    }

    // 获取列表
    async list(pageNum, pageSize) {
        const articles = await this.app.mysql.query('select * from video_log;', [pageSize, (pageNum - 1) * pageSize]);
        return articles;
    }
    // 获取某人列表
    async listByUser(pageNum, pageSize, work_id) {
        const articles = await this.app.mysql.query('select VLOG.video_id, VLOG.datetime ,VV.name,VV.price,VV.url,VV.short_image, VV.waterfall_image, VV.classify_id, VV.category_id from video_log AS VLOG LEFT JOIN video_video AS VV on VV.id = VLOG.video_id where VLOG.user_id = ? order by VLOG.datetime desc limit ? offset ?;', [work_id, pageSize, (pageNum - 1) * pageSize]);
        return articles;
    }

    // 获取某条信息
    async find(id) {
        const article = await this.app.mysql.get('video_log', { id });
        return article;
    }


    // 总数
    async count(where) {
        const count = await this.app.mysql.query('select count(*) from video_log where ?', [where]);

        return count[0]['count(*)'];
    }

    // 更新
    async update(data) {
        const result = await this.app.mysql.update('video_log', data);

        return result.affectedRows === 1;
    }

    // 删除
    async remove(id) {
        const result = await this.app.mysql.delete('video_log', {
            id: id
        });

        return result.affectedRows === 1;
    }


    async deleteFromUser(ids, openid) {
        const result = await this.app.mysql.query('delete from video_log where id in(' + ids + ') and user_id = ?', [openid]);
        return result
    }
}

module.exports = VideoLogService