'use strict';
const Service = require('egg').Service;


class VideoService extends Service {
	async insert(obj) {
		const result = await this.app.mysql.insert('video_video', {
			work_id: obj.work_id,
			name: obj.name,
			description: obj.description,
			demo_description: obj.demo_description,
			demo_pic: obj.demo_pic,
			category_id: obj.category_id,
			price: obj.price,
			business: obj.business,
			time: obj.time,
			format: obj.format,
			url: obj.url,
			is_show: obj.is_show,
			platform_id: obj.platform_id,
			column_id: obj.column_id,
			keystring: obj.keystring,
			short_image: obj.short_image,
			timestamp: this.app.mysql.literals.now,
			style_id: obj.style_id,
			usage_id: obj.usage_id,
			is_top: obj.is_top,
			brand: obj.brand,
			classify_id: obj.classify_id,
			scale_id: obj.scale_id,
			waterfall_image: obj.waterfall_image
		});
		return result.affectedRows === 1;
	}



	// 获取列表
	async search(pageNum, pageSize, where, orderby) {
		let articles, sql;

		try {
			sql = `select VV.id, VV.work_id, VV.name, VV.description, VV.demo_description, VV.demo_pic, VV.category_id, VV.price, VV.business, VV.time, VV.format, VV.scale_id, VV.url, VV.is_show, VV.platform_id, VV.column_id, VV.keystring, VV.short_image, VV.timestamp, VV.style_id, VV.usage_id, VV.is_top, VV.brand, VV.classify_id, VV.waterfall_image,`
			+ ` VC.name AS categroy_name, VCOL.name AS column_name, VPF.name AS platform_name, VS.name AS style_name, VU.name AS usage_name, VCL.name AS classify_name`
			+ ` from video_video AS VV`
			+ ` LEFT JOIN video_category AS VC on category_id = VC.id`
			+ ` LEFT JOIN video_column AS VCOL on column_id = VCOL.id`
			+ ` LEFT JOIN video_platform AS VPF on VV.platform_id = VPF.id`
			+ ` LEFT JOIN video_style AS VS on style_id = VS.id`
			+ ` LEFT JOIN video_usage AS VU on usage_id = VU.id`
			+ ` LEFT JOIN video_classify AS VCL on classify_id = VCL.id`
			+ ` where VV.is_del = false ${where} ${orderby}`;
			articles = await this.app.mysql.query(sql + ` limit ${pageSize} offset ${(pageNum-1) * pageSize};`);
			
			return articles;
		} catch (err) {
			this.ctx.body = {
				status: 503,
				err_message: err.message
			}
		}
	}

	// 获取某条信息
	async find(id) {
		const article = await this.app.mysql.query('select VS.name as style_name, VU.name as usage_name, VV.id as video_id ,VV.name as video_name, VV.price, VV.business, VV.time,VV.platform_id,VV.column_id,VV.keystring, VV.format, VV.scale_id, VV.work_id, VV.url, VV.is_show, VV.is_top, VV.short_image,VV.waterfall_image, VV.demo_description,VV.demo_pic, VCG.name as category_name, VPF.name as platform_name, VCO.name as column_name, VV.timestamp,VV.category_id, VV.description from video_video AS VV LEFT JOIN video_category AS VCG on VV.category_id = VCG.id LEFT JOIN video_platform AS VPF on VV.platform_id = VPF.id LEFT JOIN video_column AS VCO on VV.column_id = VCO.id LEFT JOIN video_usage AS VU on VV.usage_id = VU.id LEFT JOIN video_style AS VS on VV.style_id = VS.id where VV.id = ? and VV.is_wechat = true;', [id]);

		return article;
	}

	async listByHot(pageSize) {
		const articles = await this.app.mysql.query('select * from video_hot AS VH LEFT JOIN video_video AS VV on VH.video_id=VV.id and VV.is_wechat = true order by pv desc limit ?;', [pageSize]);
		return articles;
	}

	async listByRecommand(where, pageSize) {
		let sql = '';
		if (where) {
			sql = `select * from video_video WHERE id >= (SELECT floor(RAND() * (SELECT MAX(id) FROM video_video))) ${where} and video_video.is_wechat = true ORDER BY id LIMIT 6`
		} else {
			sql = `select video_id as id,video_video.time ,video_video.name as name, video_video.short_image as short_image from video_recommand LEFT JOIN video_video on video_recommand.video_id=video_video.id where video_video.is_wechat = true ORDER BY video_recommand.id LIMIT 6`
		}

		const articles = await this.app.mysql.query(sql);
		return articles;
	}

	// 搜索
	async searchByKeyword(pageNum, pageSize, keyword) {
		let sql = `select id,name,url,short_image,price from video_video where name like '%` + keyword + `%' and is_wechat = true order by timestamp asc limit ${pageSize} offset ${(pageNum - 1) * pageSize};`;
		const articles = await this.app.mysql.query(sql);
		return articles;
	}

	// 总数
	async count(where) {
		let count;
		if(where) {
			count = await this.app.mysql.query(`select count(*) from video_video AS VV where is_wechat = true ${where};`);
		} else {
			count = await this.app.mysql.query(`select count(*) from video_video AS VV where is_wechat = true;`);
		}

		return count[0]['count(*)'];
	}

	// 更新
	async update(data) {
		const result = await this.app.mysql.update('video_video', data);

		return result.affectedRows === 1;
	}

	// 删除
	async remove(ids) {
		const conn = await this.app.mysql.beginTransaction();
		try {
			const result = await this.app.mysql.query(`UPDATE video_video SET is_del = true WHERE id IN (${ids});`);
			if (result.affectedRows > 0) {
                await conn.commit();
                return true;
            } else {
                await conn.rollback();
                return false;
            }
		} catch(err) {
			conn.rollback();
			return false;
		}
	}

	async top(data) {
		try {
			const result = await this.app.mysql.update('video_video', {
				id: data.id,
				is_top: data.is_top
			})
			return result.affectedRows === 1 ? true : false;
		} catch (err) {
			throw err;
		}
	}
}
module.exports = VideoService
