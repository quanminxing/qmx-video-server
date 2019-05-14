'use strict';

const moment = require('moment');
const marked = require('marked');
const counter = require('../lib/count');
const mail = require('../lib/mail');
const Controller = require('egg').Controller;
class BillController extends Controller {
  async index() {
    let categorys = await this.service.category.list();
    categorys = categorys.filter((d) => { return d.level === 1 });
    let platforms = await this.service.platform.list();
    let columns = await this.service.column.list();
    let users = await this.service.people.listAll()
    await this.ctx.render('bill.html', {
      current: "bill",
      columns: JSON.stringify(columns),
      categorys: JSON.stringify(categorys),
      platforms: JSON.stringify(platforms),
      users: JSON.stringify(users),
      title: "订单管理"
    });
  };

  // 新增

  async main() {

    const body = this.ctx.request.body;
    const oper = body.oper;
    let id = body.id;
    const name = body.name;
    const price = body.price != 'null' ? body.price : '';
    const business = body.business;
    const status = body.status;
    const time = body.time;
    const scale = body.scale;
    const channel = body.channel;
    const phone = body.phone;
    const category_id = body.category_id;
    const video_id = body.video_id || '';
    const platform_id = body.platform_id || '';
    const comment = body.comment;
    const column_id = body.column_id;
    const openid = body.openid;
    const email = body.email;
    const work_id = body.work_id || '';

    let result;
    let newResult;
    if (oper === 'add') {

      try {
        result = await this.service.bill.insert({
          work_id,
          name,
          price,
          business,
          status,
          time,
          phone,
          video_id,
          openid,
          comment,
          email
        });

        newResult = await this.service.bill.list(1, 1, 'where VB.id = ' + result.insertId);
        let video_name, video_time, worker_name, worker_id;
        if (newResult.length > 0) {
          video_name = newResult[0].video_name ? newResult[0].video_name : '无'
          video_time = newResult[0].video_time ? newResult[0].video_time.split(':').join('分') + '秒' : '无'
          worker_name = newResult[0].worker_name ? newResult[0].worker_name : '无'
          worker_id = newResult[0].worker_id ? newResult[0].worker_id : '无'
        } else {
          video_name = '无'
          video_time = '无'
          worker_name = '无'
          worker_id = ''
        }
        if (!this.ctx.session.user) {
          let mailHtmlText = `订单ID为${result.insertId},订单内容如下：</br>` +
            `样片视频：${video_name}</br>` +
            `样片时长：${video_time}</br>` +
            `订单价格：${price}</br>` +
            `推荐人：${worker_id} -- ${worker_name}</br>` +
            //`样片功能：室内场景</br>` +
            `公司名称：${business}</br>` +
            `联系人：${name}</br>` +
            `联系方式：${phone}</br>` +
            `邮箱：${email}</br>` +
            `备注：${comment}</br>` +
            `请及时联系客户。`
          let toMailAddress = this.app.config.mailaddress
          mail.sendMail('你收到一份来自全民星小视频的brief', mailHtmlText, toMailAddress, function (info) {   //'你收到一份来自全民星小视频的brief', '请在后台查看id为' + result.insertId +'的订单'
            console.log(info);
          });
        }
        this.ctx.body = 'success';
      } catch (err) {
        this.ctx.body = {
          status: 503,
          err_message: err.err_message
        }
        throw err;
      }

    } else if (oper === 'edit') {

      await this.service.bill.update({
        id,
        work_id,
        name,
        price,
        business,
        status,
        time,
        phone,
        video_id,
        comment,
        email
      });
      await this.service.workerLog.insert({
        event: '修改订单' + name,
        place: '订单管理',
        work_id
      });
      this.ctx.body = 'success';

    } else if (oper === 'del') {

      id = id.split(',');
      for (let i = 0, l = id.length; i < l; i++) {

        await this.service.bill.remove(id[i]);

        await this.service.workerLog.insert({
          event: '删除订单' + id[i],
          place: '订单管理',
          work_id
        });
      }

      this.ctx.body = 'success';
    }

  }

  //后台列表
  async list() {
    const query = this.ctx.request.query;
    const pageNum = query.pageNum || 1;
    const pageSize = query.pageSize || 100;
    const _search = query._search;

    let result, total;

    if (_search != 'true') {
      result = await this.service.bill.list(pageNum, pageSize, '');
      total = await this.service.bill.count('');
    } else {
      let sql = 'where VB.is_del=false'
      
      const id = query.id ? ' and VB.id=' + query.id : '';
      const user_id = query.user_id ? '' : '';
      const phone = query.phone ? ' and VB.phone=' + query.phone : '';
      const name = query.name ? 'and VB.name=' + query.name : '';
      const business = query.business ? ' and VB.business=' + query.business : '';
      const trade_status = query.trade_status ? ' and VB.trade_status=' + query.trade_status : '';
      const pay_status = query.pay_status ? ' and VB.pay_status=' + query.pay_status : '';
      const order_time = query.order_time ? ' and VB.order_time=' + query.order_time : '';
      const work_id = query.work_id ? ' and VB.work_id=' + query.work_id : '';

      sql += id + user_id + phone + name + business + trade_status + pay_status + order_time + work_id;
      console.log(phone)
      result = await this.service.bill.list(pageNum, pageSize, sql);
      total = await this.service.bill.count(sql);
    }
    this.ctx.body = {
      status: 200,
      data: result,
      total: total,
    };
  }

  //前台列表
  async listByUser() {
    let result;
    const query = this.ctx.request.query;
    const openid = query.openid;
    const pageNum = parseInt(query.pageNum || 1);
    const pageSize = parseInt(query.pageSize || 10)

    // result = result.map((d)=>{
    //   d.timestamp = moment(d.timestamp).format('YYYY-MM-DD hh:mm:ss');
    //   return d;
    // });
    if (openid) {
      result = await this.service.bill.listByUser(openid, pageNum, pageSize);
      this.ctx.body = {
        status: 200,
        data: result
      };
    } else {
      this.ctx.body = {
        status: 500,
        err_message: 'openid null'
      }
    }

  }

  //各交易状态数量
  async tradeCount() {
    const query = this.ctx.request.query;
    const openid = query.user_id;
    if (!openid) {
      this.ctx.body = {
        status: 500,
        err_message: 'openid null'
      }
    } else {
      let result = await this.service.bill.tradeCount(openid);
      this.ctx.body = {
        status: 200,
        data: result
      }
    }
  }

  //修改交易状态
  async tradeStatus() {
    const body = this.ctx.request.body;
    const id = body.id;
    const trade_status = body.trade_status;
    const refund_price = body.refund_price;

    const status = ['进行中', '待付款', '待确认', '待寄送', '交易成功', '退款中', '退款完成', '交易关闭'];

    let check = status.filter((d) => {
      if (d == trade_status)
        return d
    })

    let record = await this.service.bill.find(id);
    if (check.length === 1) {
      switch (check[0]) {
        case '待付款':
          if (record && record.pay_status === '未付款' && record.trade_status != '退款完成') {
            let result = await this.service.bill.update({
              id,
              trade_status
            });
            if (result) {
              this.ctx.body = {
                status: 200,
                data: '修改成功'
              }
            } else {
              this.ctx.body = {
                status: 500,
                err_message: '修改失败'
              }
            }
          } else {
            this.ctx.body = {
              status: 500,
              err_message: '修改失败,没有此订单或订单状态不允许修改'
            }
          }
          break;
        case '退款完成':
          if (refund_price < 0 || refund_price > record.price) {
            this.ctx.body = {
              status: 500,
              err_message: '修改失败,订单付款状态非未付款'
            }
            return;
          }
          if (record && record.pay_status === '已付款' && record.trade_status != '退款完成') {
            let result = await this.service.bill.update({
              id,
              trade_status,
              refund_price
            });
            if (result) {
              this.ctx.body = {
                status: 200,
                data: '修改成功'
              }
            } else {
              this.ctx.body = {
                status: 500,
                err_message: '修改失败'
              }
            }
          } else {
            this.ctx.body = {
              status: 500,
              err_message: '修改失败, 没有此订单或订单状态不允许修改'
            }
          }
          break;

        default:
          if (record && record.trade_status != '退款完成') {
            let result = await this.service.bill.update({
              id,
              trade_status
            });
            if (result) {
              this.ctx.body = {
                status: 200,
                data: '修改成功'
              }
            } else {
              this.ctx.body = {
                status: 500,
                err_message: '修改失败'
              }
            }
          } else {
            this.ctx.body = {
              status: 500,
              err_message: '修改失败, 没有此订单或订单状态为退款完成'
            }
          }
          break;
      }
    } else {
      this.ctx.body = {
        status: 500,
        err_message: '修改失败,状态错误'
      }
    }

  }

  //修改订单价格
  async price() {
    const body = this.ctx.request.body;
    const id = body.id;
    let price = body.price;

    if (typeof price != 'number') {
      price = Number(price);
    }
    if (price < 0) {
      this.ctx.body = {
        status: 500,
        err_message: '修改失败,金额非法'
      }
      return;
    }
    let record = await this.service.bill.find(id);
    if (record && record.pay_status === '未付款') {
      let result = await this.service.bill.update({
        id,
        price
      });
      if (result) {
        this.ctx.body = {
          status: 200,
          data: '修改成功'
        }
      } else {
        this.ctx.body = {
          status: 500,
          err_message: '修改失败'
        }
      }
    } else {
      this.ctx.body = {
        status: 500,
        err_message: '修改失败,未查询到订单或订单付款状态非未付款'
      }
    }
  }

  //修改跟进销售
  async worker() {
    const body = this.ctx.request.body;
    const id = body.id;
    const work_id = body.work_id;

    let result = await this.service.bill.update({
      id,
      work_id
    });
    if (result) {
      this.ctx.body = {
        status: 200,
        data: '修改成功'
      }
    } else {
      this.ctx.body = {
        status: 500,
        err_message: '修改失败'
      }
    }
  }

  //修改销售备注
  async workerComment() {
    const body = this.ctx.request.body;
    const id = body.id;
    const work_comment = body.work_comment;

    let result = await this.service.bill.update({
      id,
      work_comment
    });
    if (result) {
      this.ctx.body = {
        status: 200,
        data: '修改成功'
      }
    } else {
      this.ctx.body = {
        status: 500,
        err_message: '修改失败'
      }
    }
  }
}
module.exports = BillController;