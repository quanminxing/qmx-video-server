const Service = require('egg').Service;

class InfoService extends Service {
    async bannerType(param) {
        let results = await this.app.mysql.query(`select * from video_banner_type where platform = ?;`, [param]);
        // select COLUMN_NAME from information_schema.COLUMNS where table_name = ?;
        return results;
    }

    async regard() {
        let result = await this.app.mysql.get('video_regard', { id:1 })
        return result;
    }
}

module.exports = InfoService