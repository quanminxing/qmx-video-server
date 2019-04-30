'use strict';

const moment = require('moment');
const path = require('path');
const fs = require('fs');
const Controller = require('egg').Controller;
const xlsx = require('node-xlsx');

function saveStream(stream, filepath) {
	return new Promise((resolve, reject) => {
		const ws = fs.createWriteStream(filepath);
		stream.pipe(ws);
		ws.on('error', reject);
		ws.on('finish', resolve);
	});
}

class VideoController extends Controller {
	// async upload() {

	//   const stream = await this.getFileStream();
	//   const filepath = path.join(this.app.config.logger.dir, 'multipart-test-file.xlsx');
	//   await saveStream(stream, filepath);
	//   const work_id = this.ctx.session.user.id;
	//   const workSheetsFromBuffer = xlsx.parse(fs.readFileSync(filepath));
	//   console.log(JSON.stringify(workSheetsFromBuffer));
	//   let rows = workSheetsFromBuffer[0].data;
	//   rows.shift();

	//   let categorys = await this.service.category.list();
	//   let platforms = await this.service.platform.list();
	//   let columns = await this.service.column.list();
	//   let styles = await this.service.styles.list();
	//   let usages = await this.service.usages.list();
	//   categorys = categorys.filter((d) => { return d.level === 1 });

	//   for (let i = 0, l = rows.length; i < l; i++) {
	//     let d = rows[i];
	//     await this.service.video.insert({
	//       work_id,
	//       name: d[0],
	//       description: d[1],
	//       category_id: categorys.filter((category) => {
	//         return category.name === d[2]
	//       })[0].id || 16,
	//       price: d[3],
	//       business: d[4],
	//       time: d[5],
	//       format: d[6],
	//       url: d[7],
	//       short_image: d[8],
	//       is_show: d[9],
	//       platform_id: platforms.filter((platform) => {
	//         return platform.name === d[14]
	//       })[0].id || 1,
	//       column_id: columns.filter((column) => {
	//         return column.name === d[15]
	//       })[0].id || 1,
	//       usage_id: usages.filter((usage) => {
	//         return usage.name === d[16]
	//       })[0].id || 1,
	//       style_id: styles.filter((style) => {
	//         return style.name === d[17]
	//       })[0].id || 1,
	//       keystring: d[16]
	//     });
	//     await this.service.workerLog.insert({
	//       event: '上传视频' + d[0],
	//       place: '视频库',
	//       work_id
	//     });
	//   }

	//   this.ctx.body = 'success';
	//   return

	//   const plus = 'http://pic-cloud-hn.b0.upaiyun.com/';
	//   const filename = moment(Date.now()).format('YYYY-MM-DD') + '/' + stream.filename;
	//   let result = await this.app.upyun.putFile(filename, fs.readFileSync(filepath), 'text/plain', true, null);
	//   console.log(plus + filename);
	//   if (result) {
	//     this.ctx.body = plus + filename;
	//   } else {
	//     this.ctx.body = '上传失败';
	//   }

	//   //const object = await this.app.upyun.put(moment(Date.now()).format('YYYY-MM-DD') + '/' + stream.filename, stream);

	// };

	async index() {
		let categorys = await this.service.category.list();
		let platforms = await this.service.platform.list();
		let usages = await this.service.usage.list();
		let styles = await this.service.style.list();
		let columns = await this.service.column.list();
		categorys = categorys.filter((d) => { return d.level === 1 });
		let users = await this.service.people.listAll()
		await this.ctx.render('video.html', {
			current: "video",
			columns: JSON.stringify(columns),
			categorys: JSON.stringify(categorys),
			platforms: JSON.stringify(platforms),
			styles: JSON.stringify(styles),
			usages: JSON.stringify(usages),
			title: "视频库",
			users: JSON.stringify(users)
		});
	};

	async detail() {

		const id = this.ctx.request.query.id;
		const detail = await this.service.video.find(id);
		const work_id = this.ctx.session && this.ctx.session.user && this.ctx.session.user.id ? this.ctx.session.user.id : '';
		detail[0].timestamp = moment(detail[0].timestamp).format('YYYY-MM-DD hh:mm:ss')
		if (detail[0].url.indexOf('embed') !== -1) {
			detail[0].isqq = 1
		} else {
			detail[0].isqq = 0
		}
		let user = await this.service.people.find(detail[0]['work_id']);
		await this.ctx.render('video-detail.html', {
			title: "视频库",
			detail: detail[0],
			user
		});
	};

	async getDetail() {

		const id = this.ctx.request.query.id;
		const detail = await this.service.video.find(id);
		this.ctx.body = {
			"success": true,
			detail
		}
	};


	// 新增

	async main() {

		const body = this.ctx.request.body;
		const oper = body.oper;
		let id = body.id;
		const work_id = this.ctx.session && this.ctx.session.user && this.ctx.session.user.id ? this.ctx.session.user.id : '';
		const name = body.name;
		const description = body.description;
		const category_id = body.category_id;
		const platform_id = body.platform_id;
		const usage_id = body.usage_id;
		const style_id = body.style_id;
		const column_id = body.column_id;
		const keystring = body.keystring;
		const demo_description = body.demo_description;
		const demo_pic = body.demo_pic;
		const price = body.price;
		const business = body.business;
		const time = body.time;
		const format = body.format;
		const url = body.url;
		const is_show = body.is_show;
		const is_top = body.is_top
		const short_image = body.short_image;
		const brand = body.brand;
		const classify_id = body.classify_id;
		const scale_id = body.scale_id;
		const waterfall_image = body.waterfall_image;
		const is_wechat = body.is_wechat;
		const is_model = body.is_model;
		const sence = body.sence;
		const platform = body.platform;
		const category = body.category;
		const related_id = body.related_id;
		const script_url = body.script_url;

		if (oper === 'add') {

			try {

				let result = this.service.video.insert({
					work_id,
					name,
					description,
					demo_description,
					demo_pic,
					category_id,
					price,
					business,
					time,
					format,
					url,
					is_show,
					is_top,
					short_image,
					platform_id,
					column_id,
					keystring,
					style_id,
					usage_id,
					brand,
					classify_id,
					scale_id,
					waterfall_image,
					is_wechat,
					is_model,
					sence,
					platform,
					category,
					related_id,
					script_url
				});

				let log = this.service.workerLog.insert({
					event: '上传视频' + name,
					place: '视频库',
					work_id
				});
				[result, log] = await Promise.all([result, log]);
				if(result) {
					this.ctx.body = {
					  status: 200,
					  data: result
					}
				} else {
					this.ctx.body = {
						status: 503,
						err_message: '新增失败'
					}
				}
			} catch (err) {
				this.ctx.body = {
					status: 503,
					err_message: err.message
				}
				throw err;
			}

		} else if (oper === 'edit') {
			try {
				let result = this.service.video.update({
					id,
					work_id,
					name,
					description,
					demo_description,
					demo_pic,
					category_id,
					price,
					business,
					time,
					format,
					url,
					is_show,
					is_top,
					short_image,
					platform_id,
					column_id,
					keystring,
					style_id,
					usage_id,
					brand,
					classify_id,
					scale_id,
					waterfall_image,
					is_wechat,
					is_model,
					sence,
					platform,
					category,
					related_id,
					script_url
				});
	
				let log = this.service.workerLog.insert({
					event: '修改视频' + name,
					place: '视频库',
					work_id
				});
				[result, log] = await Promise.all([result, log])

				if(result) {
					this.ctx.body = {
						status: 200,
						data: result
					};
				} else {
					this.ctx.body = {
						status: 503,
						err_message: '修改失败'
					}
				}

			} catch (err) {
				this.ctx.body = {
					status: 503,
					err_message: err.message
				}
				throw err
			}


		}
	}


	// async listByFilter() {
	// 	const query = this.ctx.request.query;
	// 	const pageNum = +query.page || 1;
	// 	const pageSize = +query.rows || 100;
	// 	let sql = '';

	// 	const querys = ['category_id', 'usage_id', 'platform_id', 'column_id'];

	// 	for (let key in query) {
	// 		if (querys.indexOf(key) !== -1) {
	// 			sql += ' and' + key + '=' + query[key];
	// 		}
	// 	}
	// 	if (sql == '') {
	// 		sql = '1=1'
	// 	} else {
	// 		sql = sql.substring(0, sql.length - 3);
	// 	}


	// 	let result, total;

	// 	result = await this.service.video.search(pageNum, pageSize, sql);
	// 	total = await this.service.video.count(sql);

	// 	this.ctx.body = {
	// 		total: parseInt(total / pageSize) + 1,
	// 		rows: result,
	// 		totalRow: total,
	// 	};
	// }


	async list() {

		const query = this.ctx.request.query;
		const _search = query._search;
		const id = query.id //? query.id : (query.video_id ? query.video_id: ''); // 容错前端
		const column_id = query.column_id ? ' and VV.column_id = ' + query.column_id : '';
		const name = query.name ? ' and VV.name like ' + `"%${query.name}%"` : '';
		const category_id = query.category_id ? ' and VV.category_id = ' + query.category_id : '';
		const classify_id = query.classify_id ? query.classify_id.split(',') : '';
		const platform_id = query.platform_id ? ' and VV.platform_id = ' + query.platform_id : '';
		const usage_id = query.usage_id ? ' and VV.usage_id = ' + query.usage_id : '';
		const price = query.price ? query.price.split(',') : '';
		const model = query.model ? ' and VV.is_model = ' + query.model : '';
		const sence = query.sence ? ' and VV.sence = ' + query.sence : '';
		const related_id = query.related_id ? ' and VV.related_id = ' + query.related_id : '';
		const pageSize = query.pageSize ? query.pageSize : 20;
		const pageNum = query.pageNum ? query.pageNum : 1;
		const sidx = query.sidx ? 'VV.' + query.sidx : 'uv';
		const sord = query.sord || 'desc';

		let classifySql = classify_id[0] ? ` and VV.classify_id IN (${classify_id})` : ''
		let priceSql = (price[0] ? ` and VV.price >= ${price[0]}` : '') + (price[1] ? ` and VV.price <= ${price[1]}` : '');

		let orderby = '';

		if(query.sidx) {
			orderby += `order by ${sidx} ${sord}`
		} else {
			orderby += `order by VV.is_top desc, ${sidx} ${sord}`
		}
		if (_search === 'true') {
			if (id) {
				let sql = ' and VV.id = ' + id ;
				let result = await this.service.video.search(pageNum, pageSize, sql, orderby);
				this.ctx.body = {
					status: 200,
					data: result
				}
			} else {
				try {
					let sql = column_id + name + category_id + priceSql + classifySql + platform_id + usage_id + model + sence + related_id + ' and VV.is_wechat = true'
					let result = this.service.video.search(pageNum, pageSize, sql, orderby)
					let count = this.service.video.count(sql)
					let [data, total] = await Promise.all([result, count]);
					if (result && count) {
						this.ctx.body = {
							status: 200,
							data: data,
							total: total
						}
					} else {
						this.ctx.body = {
							status: 503,
							err_message: '查询失败'
						}
					}
				} catch (err) {
					this.ctx.body = {
						status: 503,
						err_message: err.message
					}
					throw err;
				}
			}
		} else {
			
			let result = this.service.video.search(pageNum, pageSize, '', orderby)
			let count = this.service.video.count()
			let [data, total] = await Promise.all([result, count])
			this.ctx.body = {
				status: 200,
				data: data,
				total: total
			}
		}
	}

	async listAll() {
		const query = this.ctx.request.query;
		const _search = query._search;
		const id = query.id;
		const column_id = query.column_id ? ' and VV.column_id = ' + query.column_id : '';
		const name = query.name ? ' and VV.name like ' + `"%${query.name}%"` : '';
		const category_id = query.category_id ? ' and VV.category_id = ' + query.category_id : '';
		const classify_id = query.classify_id ? query.classify_id.split(',') : '';
		const platform_id = query.platform_id ? ' and VV.platform_id = ' + query.platform_id : '';
		const usage_id = query.usage_id ? ' and VV.usage_id = ' + query.usage_id : '';
		const price = query.price ? query.price.split(',') : '';
		const model = query.model ? ' and VV.is_model = ' + query.model : '';
		const sence = query.sence ? ' and VV.sence = ' + query.sence : '';
		const related_id = query.related_id ? ' and VV.related_id = ' + query.related_id : '';
		const pageSize = query.pageSize ? query.pageSize : 20;
		const pageNum = query.pageNum ? query.pageNum : 1;
		const sidx = query.sidx? 'VV.' + query.sidx : 'VV.timestamp';
		const sord = query.sord || 'desc';

		let orderby = '';

		let classifySql = classify_id[0] ? ` and VV.classify_id IN (${classify_id})` : ''
		let priceSql = (price[0] ? ` and VV.price >= ${price[0]}` : '') + (price[1] ? ` and VV.price <= ${price[1]}` : '');
		if (_search === 'true') {
			orderby = ` order by ${sidx} ${sord}`
			if (id) {
				let sql = ' and VV.id = ' + id ;
				let result = await this.service.video.search(pageNum, pageSize, sql, orderby);
				this.ctx.body = {
					status: 200,
					data: result
				}
			} else {
				try {
					let sql = column_id + name + category_id + priceSql + classifySql + platform_id + usage_id + model + sence + related_id
					let result = this.service.video.search(pageNum, pageSize, sql, orderby)
					let count = this.service.video.count(sql)
					let [data, total] = await Promise.all([result, count]);
					if (result && count) {
						this.ctx.body = {
							status: 200,
							data: data,
							total: total
						}
					} else {
						this.ctx.body = {
							status: 503,
							err_message: '查询失败'
						}
					}
				} catch (err) {
					this.ctx.body = {
						status: 503,
						err_message: err.message
					}
					throw err;
				}
			}
		} else {
			orderby = `order by VV.is_top desc, ${sidx} ${sord}`
			let result = this.service.video.search(pageNum, pageSize, '', orderby);
			let count = this.service.video.count();
			let [data, total] = await Promise.all([result, count]);
			this.ctx.body = {
				status: 200,
				data: data,
				total: total
			}
		}
	}

	async listByColumn() {
		const query = this.ctx.request.query;
		const pageNum = +query.page || 1;
		const pageSize = +query.rows || 100;
		const column_id = query.column_id;
		const sql = ` and column_id = ${column_id}`

		let result, total;
		result = await this.service.video.search(pageNum, pageSize, sql);
		total = await this.service.video.count(sql);

		this.ctx.body = {
			total: total % pageSize,
			rows: result,
			pageNum,
			pageSize
		};
	}

	async listByUsage() {
		const query = this.ctx.request.query;
		const pageNum = +query.page || 1;
		const pageSize = +query.rows || 100;
		const usage_id = query.usage_id;
		const sql = ` and usage_id = ${usage_id}`

		let result, total;
		result = await this.service.video.search(pageNum, pageSize, sql);
		total = await this.service.video.count(sql);

		this.ctx.body = {
			total: total % pageSize,
			rows: result,
			pageNum,
			pageSize
		};
	}


	async listByStyle() {
		const query = this.ctx.request.query;
		const pageNum = +query.page || 1;
		const pageSize = +query.rows || 100;
		const style_id = query.style_id;
		const sql = ` and style_id = ${style_id}`

		let result, total;
		result = await this.service.video.search(pageNum, pageSize, sql);
		total = await this.service.video.count(sql);

		this.ctx.body = {
			total: total % pageSize,
			rows: result,
			pageNum,
			pageSize
		};
	}

	async listByCategory() {
		const query = this.ctx.request.query;
		const pageNum = +query.page || 1;
		const pageSize = +query.rows || 100;
		const category_id = query.category_id;
		const sql = ` and category_id = ${category_id}`

		let result, total;
		result = await this.service.video.search(pageNum, pageSize, sql);
		total = await this.service.video.count(sql);

		this.ctx.body = {
			total: total % pageSize,
			rows: result,
			pageNum,
			pageSize
		};
	}

	async listByHot() {
		const query = this.ctx.request.query;
		const pageNum = +query.page || 1;
		const pageSize = +query.rows || 100;
		let result = await this.service.video.listByHot(pageSize);
		this.ctx.body = {
			rows: result,
		};
	}
	async listByRecommand() {
		const query = this.ctx.request.query;
		const pageNum = +query.page || 1;
		const pageSize = +query.rows || 100;
		let where = false;

		if (query.category_id) {
			where = ' and category_id = ' + query.category_id
		}

		let result = await this.service.video.listByRecommand(where, pageSize);
		this.ctx.body = {
			rows: result,
		};
	}

	async listByTop() {

	}

	async searchByKeyword() {
		const query = this.ctx.request.query;
		const pageNum = +query.page || 1;
		const pageSize = +query.rows || 100;
		const keyword = query.keyword
		let result = await this.service.video.searchByKeyword(pageNum, pageSize, keyword);
		this.ctx.body = {
			rows: result,
		};
	}



	async top() {
		const body = this.ctx.request.body;
		const id = body.id;
		const is_top = body.is_top == true || body.is_top == 'true' ? true : false;
		try {
			let result = await this.service.video.top({
				id,
				is_top,
			});
			if (result) {
				if(is_top) {
					this.ctx.body = {
						status: 200,
						data: `${id}置顶成功`
					}
				} else {
					this.ctx.body = {
						status: 200,
						data: `${id}取消置顶成功`
					}
				}

			} else {
				this.ctx.body = {
					status: 503,
					err_message: '置顶失败'
				}
			}
		} catch (err) {
			this.ctx.body = {
				status: 503,
				err_message: err.message
			}
			throw err;
		}
	}
	async remove() {
		const body = this.ctx.request.body;
		let ids = body.ids;
		const work_id = this.ctx.session && this.ctx.session.user && this.ctx.session.user.id ? this.ctx.session.user.id : '';
		try {
			await this.service.workerLog.insert({
				event: '删除视频' + ids,
				place: '视频库',
				work_id
			});
			let result = await this.service.video.remove(ids);

			if (result) {
				this.ctx.body = {
					status: 200,
					data: '删除成功'+ids
				}
			} else {
				this.ctx.body = {
					status: 503,
					err_message: "删除失败"
				}
			}
		} catch (err) {
			this.ctx.body = {
				status: 503,
				err_message: err.message
			}
		}


	}
}
module.exports = VideoController;