const Controller = require('egg').Controller;
class BannerController extends Controller {
	async banner() {
		const body = this.ctx.request.body;
		let id = body.id;
		const work_id = this.ctx.session && this.ctx.session.user && this.ctx.session.user.id ? this.ctx.session.user.id : 0;
		const oper = body.oper;
		const img_name = body.img_name;
		const url_name = body.url_name;
		const img_url = body.img_url;
		const url = body.url;
		const is_show = body.is_show;
		const type_id = body.type_id;
		const timestamp = body.timestamp;

		let result
		if (oper === 'add') {
			result = await this.service.banner.insert({
				work_id,
				img_name,
				url_name,
				img_url,
				url,
				is_show,
				type_id,
			});

			this.ctx.body = {
				status: 200,
				data: '添加成功'
			};
		} else if (oper === 'edit') {
			result = await this.service.banner.update({
				id,
				work_id,
				img_name,
				url_name,
				img_url,
				url,
				is_show,
				type_id,
			});

			this.ctx.body = {
				status: 200,
				data: '修改成功'
			};
		}

	}
	async list() {
		const { ctx, query = ctx.request.query } = this;
		const platform = query.platform;
		const res = await this.service.banner.list(platform);
		// 设置响应内容和响应状态码
		ctx.body = {
			status: 200,
			data: res
		};
	}
	async listAll() {
		const pageNum = this.ctx.request.query.pageNum || 1;
		const pageSize = this.ctx.request.query.pageSize || 100;
		let result = this.service.banner.listAll(pageNum, pageSize);
		let count = this.service.banner.count();

		[result, count] = await Promise.all([result, count]);


		this.ctx.body = {
			status: 200,
			data: result,
			count: count
		}
	}

	async listById() {
		const banner_id = this.ctx.request.query.id;
		const res = await this.service.banner.listById(banner_id);
		this.ctx.body = {
			status: 200,
			data: res
		}
	}

	async remove() {
		const work_id = this.ctx.session && this.ctx.session.user && this.ctx.session.user.id ? this.ctx.session.user.id : 0; //this.ctx.session.user.id;
		let ids = this.ctx.request.body.ids;
		try {
			if (typeof (ids) == 'string') {
				id = id.split(',');

			}
			let removebanner = this.service.banner.remove(ids);
			let writelog = this.service.workerLog.insert({
				event: '删除banner' + ids,
				place: 'banner',
				work_id
			});

			[removebanner, writelog] = await Promise.all([removebanner, writelog]);
			
			if (removebanner) {
				this.ctx.body = {
					status: 200,
					data: '删除成功' + ids
				};
			}
		} catch (err) {
			this.ctx.body = {
				status: 200,
				err_message: err.message
			}
			throw err;
		}
	}
}

module.exports = BannerController;