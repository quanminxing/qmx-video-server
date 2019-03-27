
const Service = require('egg').Service;

class SqlService extends Service {
  async find(table_name) {
    let colum = await this.app.mysql.query("select COLUMN_NAME from information_schema.COLUMNS where table_name = ?;", [table_name]);
    return colum;
  }
}

/**
 * CREATE TABLE `qmx-video`.`video_banner` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `img_name` VARCHAR(45) NULL DEFAULT NULL,
  `url_name` VARCHAR(45) NULL DEFAULT NULL,
  `img_url` VARCHAR(45) NULL DEFAULT NULL,
  `url` VARCHAR(45) NULL DEFAULT NULL,
  `video_bannercol` INT(1) DEFAULT 0;
  `timestamp` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`));

 */

module.exports = SqlService;