const Controller = require('egg').Controller;
class BannerController extends Controller {
	async banner() {
		const body = this.ctx.request.body;
		let id = body.id;
		const work_id= this.app.session ? this.app.session.user.id : null;
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

			this.ctx.body = 'success';
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

			this.ctx.body = 'success';
		}

	}
	async list() {
		const { ctx, query = ctx.request.query } = this;
		const platform = query.platform;
		const res = await this.service.banner.list(platform);
		// 设置响应内容和响应状态码
		ctx.body = { results: res };
	}
	async listAll() {
		const pageNum = this.ctx.request.query.pageNum;
		const pageSize = this.ctx.request.query.pageSize;
		const res = await this.service.banner.listAll(pageNum, pageSize);
		this.ctx.body = { results: res }
	}

	async listById() {
		const banner_id = this.ctx.query.id;
		const res = await this.service.banner.listById(banner_id);
		this.ctx.body = { result: res }
	}

	async remove() {
		let work_id = 8 //this.session.user.id;
		let id = this.ctx.request.body.id;
		id = id.split(',');
		for (let i = 0, l = id.length; i < l; i++) {
			let removebanner = await this.service.banner.remove(id[i]);

			let writelog = await this.service.workerLog.insert({
				event: '删除banner' + id[i],
				place: 'banner',
				work_id
			});
			//await Promise.all([removebanner, writelog]);
		}

		this.ctx.body = 'success';
	}

}

module.exports = BannerController;