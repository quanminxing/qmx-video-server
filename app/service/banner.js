const Service = require('egg').Service;

class BannerService extends Service {
    async list() {
      let results = await this.app.mysql.query("select id, img_name, img_url, url_name, url, date_format(timestamp,'%Y-%m-%d %H:%i') as timestamp from video_banner where is_show = 1;");
      console.log(results)
      // select COLUMN_NAME from information_schema.COLUMNS where table_name = ?;
      return results;
    }
}

module.exports = BannerService