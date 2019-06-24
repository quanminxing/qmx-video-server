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
          phone,
          video_id,
          openid,
          comment,
          email
        });

        newResult = await this.service.bill.list('where VB.id = ' + result.insertId, 1, 1);
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
      let sql = 'where VB.is_del=false'
      result = await this.service.bill.list(sql, pageNum, pageSize);
      total = await this.service.bill.count(sql);
    } else {
      let sql = 'where VB.is_del=false'

      const id = query.id ? ` and VB.id=${query.id}` : '';
      const openid = query.user_id ? '' : '';
      const phone = query.phone ? ` and VB.phone="${query.phone}"` : '';
      const name = query.name ? ` and VB.name="${query.name}"` : '';
      const business = query.business ? ` and VB.business="${query.business}"` : '';
      const trade_status = query.trade_status ? ` and VB.trade_status="${query.trade_status}"` : '';
      const pay_status = query.pay_status ? ` and VB.pay_status="${query.pay_status}"` : '';
      let order_time = query.order_time || '';
      const work_id = query.work_id ? ' and VB.work_id=' + query.work_id : '';
      const order_id = query.order_id ? ' and VB.order_id="' + query.order_id + '"' : '';
      const sale_status = query.sale_status ? ' and VB.sale_status="' + query.sale_status + '"' : '';

      if (order_time) {
        order_time = order_time.split(',');
        order_time = ` and VB.timestamp between '${order_time[0] + ' 00:00:00'}' and '${order_time[1] + ' 23:59:59'}'`
      }
      sql += id + openid + phone + name + business + trade_status + pay_status + order_time + work_id + order_id + sale_status;

      result = await this.service.bill.list(sql, pageNum, pageSize);
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
    const openid = query.user_id;
    let trade_status = query.trade_status;
    const pageNum = parseInt(query.pageNum || 1);
    const pageSize = parseInt(query.pageSize || 10)
    const _search = query._search;
    let total, sql;
    // result = result.map((d)=>{
    //   d.timestamp = moment(d.timestamp).format('YYYY-MM-DD hh:mm:ss');
    //   return d;
    // });
    if (openid) {

      if (_search && trade_status) {

        trade_status = trade_status.split(',')

        for (let i = 0; i < trade_status.length; i++) {
          trade_status[i] = '"' + trade_status[i] + '"'
        }
        console.log(trade_status)
        sql = ` where VB.is_del = false and openid = '${openid}' and trade_status IN (${trade_status})`
      } else {
        sql = ` where VB.is_del = false and openid = '${openid}'`
      }
      result = await this.service.bill.listByUser(sql, pageNum, pageSize);
      total = await this.service.bill.count(sql)
      this.ctx.body = {
        status: 200,
        data: result,
        total: total
      };
    } else {
      this.ctx.body = {
        status: 500,
        err_message: 'openid null'
      }
    }
  }


  async detail() {
    const id = this.ctx.request.query.id;
    const openid = this.ctx.request.openid;
    let sql = ` where VB.is_del = false and VB.id = ${id}`
    if (!id) {
      this.ctx.body = {
        status: 500,
        err_message: 'id null'
      }
      return;
    }

    if (openid) sql += ` and openid = "${openid}"`

    let bill_record = await this.service.bill.list(sql, 1, 1);

    if (bill_record.length <= 0) {
      this.ctx.body = {
        status: 500,
        err_message: '未找到此订单'
      }
      return;
    }
    bill_record = bill_record[0]
    const pay_record = await this.service.pay.findByOrder(bill_record.order_id);
    delete bill_record.is_del;
    delete bill_record.is_show;

    if (!pay_record) {
      bill_record.pay_info = {};

    } else {
      bill_record.pay_info = pay_record;

    }

    this.ctx.body = {
      status: 200,
      data: bill_record
    }
  }

  //各交易状态数量
  async tradeCount() {
    const query = this.ctx.request.query;
    const openid = query.user_id;
    if (!openid) {
      this.ctx.body = {
        status: 500,
        err_message: 'userid null'
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
          } else if (record && record.trade_status == '退款完成') {
            this.ctx.body = {
              status: 500,
              err_message: '操作失败,退款完成的订单不能修改交易状态'
            }
          } else if (record && record.pay_status == '已付款') {
            this.ctx.body = {
              status: 500,
              err_message: '操作失败，已付款的订单,交易状态不能修改为待付款'
            }
          } else if (!record) {
            this.ctx.body = {
              status: 500,
              err_message: '操作失败,未查询到订单信息'
            }
          }
          break;
        case '退款完成':
          if (!record) {
            this.ctx.body = {
              status: 500,
              err_message: '操作失败,未查询到订单信息'
            }
            return;
          } else if (refund_price < 0) {
            this.ctx.body = {
              status: 500,
              err_message: '操作失败,请输入退款金额'
            }
            return;
          } else if (refund_price > record.price) {
            this.ctx.body = {
              status: 500,
              err_message: '操作失败,退款金额不能大于订单金额'
            }
            return;
          } else if (record.pay_status != '已付款') {
            this.ctx.body = {
              status: 500,
              err_message: '操作失败,未付款订单不能退款'
            }
            return;
          } else if (record.trade_status == '退款完成') {
            this.ctx.body = {
              status: 500,
              err_message: '操作失败,退款完成的订单不能重复退款'
            }
            return;
          }
          if (record && record.pay_status === '已付款' && record.trade_status != '退款完成') {
            let result = await this.service.bill.update({
              id,
              trade_status,
              refund_time: new Date(),
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
              err_message: '操作失败,没有此订单或订单状态不允许修改'
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
              err_message: '操作失败,退款完成的订单不能修改交易状态'
            }
          }
          break;
      }
    } else {
      this.ctx.body = {
        status: 500,
        err_message: '操作失败,提交的状态错误'
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
        err_message: '操作失败,金额非法'
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
        err_message: '操作失败,未查询到订单或订单付款状态非未付款'
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

  async buyerInfo() {
    const body = this.ctx.request.body;
    const id = body.id;
    const name = body.name;
    const business = body.business;
    const phone = body.phone;
    const email = body.email;
    const comment = body.comment;

    if (!id) {
      this.ctx.body = {
        status: 500,
        err_message: 'id null'
      }
      return;
    }
    const result = await this.service.bill.update({
      id,
      name,
      business,
      phone,
      email,
      comment
    });
    if (!result) {
      this.ctx.body = {
        status: 500,
        err_message: '修改失败'
      }
      return;
    }
    this.ctx.body = {
      status: 200,
      data: '修改成功'
    }
  }

  async settle() {
    const body = this.ctx.request.body;
    const id = body.id;
    const settle_status = body.settle_status;
    const earnest_price = body.earnest_price;
    const price = body.price;
    let result = '';
    if (!id) {
      this.ctx.body = {
        status: 500,
        err_message: 'id null'
      }
      return;
    }
    if(price < 0) {
      this.ctx.body = {
        status: 500,
        err_message: '操作失败，订单价格必须大于0'
      }
      return;
    }
    if(settle_status !== '全款' && earnest_price <= 0) {
      this.ctx.body = {
        status: 500,
        err_message: '操作失败，定金金额必须大于0'
      }
      return;
    }
    if(price <= earnest_price) {
      this.ctx.body = {
        status: 500,
        err_message: '操作失败，定金金额必须小于订单价格'
      }
      return;
    }

    const bill_record = await this.service.bill.find(id);
    if(!bill_record) {
      this.ctx.body = {
        status: 500,
        err_message: '修改失败,没有此订单'
      }
      return;
    }
    if(bill_record.pay_status !== '未付款') {
      this.ctx.body = {
        status: 500,
        err_message: '操作失败，已付款的订单，不能修改结算方式、价格、定金'
      }
      return;
    }
    if(bill_record.trade_status === '退款完成') {
      this.ctx.body = {
        status: 500,
        err_message: '操作失败：退款完成的订单，不能修改结算方式、价格、定金'
      }
      return;
    }

    if (settle_status === '定金+尾款') {
      result = await this.service.bill.update({
        id,
        price,
        sale_status: '待支付定金',
        settle_status,
        earnest_price,
      });
    } else if (settle_status === '全款') {
      result = await this.service.bill.update({
        id,
        price,
        sale_status: '待支付全款',
        settle_status,
        earnest_price,
      });
    }

    if (!result) {
      this.ctx.body = {
        status: 500,
        err_message: '修改失败'
      }
      return;
    }
    this.ctx.body = {
      status: 200,
      data: '修改成功'
    }
  }

  async saleStatus() {
    const body = this.ctx.request.body;
    const id = body.id;
    const sale_status = body.sale_status;
    const refund_price = body.refund_price;
    const status = ["待沟通", "需求沟通中", "需求不可行", "需求已确认", "待支付定金", "已支付定金", "待支付全款", "已支付全款", "脚本策划中", "待确认脚本", "脚本修改中", "脚本已确认", "待寄送样品", "样品已寄到", "拍摄排期中", "拍摄中", "后期排期中", "后期制作中", "待确认样片", "样片修改中", "样片已确认", "待支付尾款", "已支付尾款", "等待成片", "成片已交付", "交易成功", "退款中", "退款完成"];
    let result = '';
    if (!id) {
      this.ctx.body = {
        status: 500,
        err_message: 'id null'
      }
      return;
    }
    if (!status.includes(sale_status)) {
      this.ctx.body = {
        status: 500,
        err_message: '修改失败,状态错误'
      }
      return;
    }

    const bill_record = await this.service.bill.find(id);
    if (!bill_record) {
      this.ctx.body = {
        status: 500,
        err_message: '修改失败,订单不存在'
      }
      return;
    }
    if (bill_record.sale_status === '退款完成') {
      this.ctx.body = {
        status: 500,
        err_message: '操作失败，退款完成的订单不能修改销售进度'
      }
      return;
    }
    const pay_record = await this.service.pay.findByOrder(bill_record.order_id, ' and verify = "待审核"');
    if(pay_record && pay_record.length > 0) {
      this.ctx.body = {
        status: 500,
        err_message: '操作失败，存在待审核的支付记录，请先完成审核'
      }
      return
    }

    switch (sale_status) {
      case '待支付定金':
        if (!(bill_record.settle_status === '定金+尾款')) {
          this.ctx.body = {
            status: 500,
            err_message: '操作失败，结算方式为“定金+尾款”的订单，销售进度才可以修改为“待支付定金”'
          }
          break;
        }
        if (!(bill_record.pay_status === '未付款')) {
          this.ctx.body = {
            status: 500,
            err_message: '操作失败，未付款的订单，销售进度才可以修改为“待支付定金”'
          }
          break;
        }
        result = await this.service.bill.update({
          id,
          sale_status,
          trade_status: '待付款'
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
        break;
      case '待支付尾款':
        if (!(bill_record.settle_status === '定金+尾款')) {
          this.ctx.body = {
            status: 500,
            err_message: '操作失败，结算方式为“定金+尾款”的订单，销售进度才可以修改为“待支付尾款”'
          }
          break;
        }
        if (!(bill_record.pay_status === '已支付定金')) {
          this.ctx.body = {
            status: 500,
            err_message: '操作失败，支付状态为“已支付定金”的订单，销售进度才可以修改为“待支付尾款”'
          }
          break;
        }
        result = await this.service.bill.update({
          id,
          sale_status,
          trade_status: '待付款'
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
        break;
      case '待支付全款':
        if (!(bill_record.settle_status === '全款')) {
          this.ctx.body = {
            status: 500,
            err_message: '操作失败，结算方式为“全款”的订单，销售进度才可以修改为“待支付全款”'
          }
          break;
        }
        if (!(bill_record.pay_status === '未付款')) {
          this.ctx.body = {
            status: 500,
            err_message: '操作失败，未付款的订单，销售进度才可以修改为“待支付全款”'
          }
          break;
        }
        result = await this.service.bill.update({
          id,
          sale_status,
          trade_status: '待付款'
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
        break;
      case '退款完成':
        // if (refund_price <) {
        //   this.ctx.body = {
        //     status: 500,
        //     err_message: '操作失败，请输入退款金额'
        //   }
        //   return;
        // }
        if(bill_record.pay_status === '未付款') {
          this.ctx.body = {
            status: 500,
            err_message: '操作失败，未付款的订单不能退款'
          }
          return;
        }
        if (refund_price > bill_record.paid_price) {
          this.ctx.body = {
            status: 500,
            err_message: '操作失败，退款金额不能大于已付金额'
          }
          return;
        }

        if (bill_record.pay_status === '已支付定金' || bill_record.pay_status === '已支付尾款' || bill_record.pay_status === '已支付全款') {
          result = await this.service.bill.update({
            id,
            sale_status,
            refund_price,
            trade_status: '退款完成',
            refund_time: this.app.mysql.literals.now
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
          break;
        } else {
          this.ctx.body = {
            status: 500,
            err_message: '操作失败，未付款的订单不能退款'
          }
        }
      case '需求不可行':
        result = await this.service.bill.update({
          id,
          sale_status,
          trade_status: '交易关闭'
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
        break;
      case '待确认脚本':
        result = await this.service.bill.update({
          id,
          sale_status,
          trade_status: '待确认'
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
        break;
      case '待寄送样品':
        result = await this.service.bill.update({
          id,
          sale_status,
          trade_status: '待寄送'
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
        break;
      case '待确认样片':
        result = await this.service.bill.update({
          id,
          sale_status,
          trade_status: '待确认'
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
        break;
      case '交易成功':
        result = await this.service.bill.update({
          id,
          sale_status,
          trade_status: '交易成功',
          trade_time: this.app.mysql.literals.now
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
        break;
      case '退款中':
        result = await this.service.bill.update({
          id,
          sale_status,
          trade_status: '退款中'
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
        break;
      default:
        result = await this.service.bill.update({
          id,
          sale_status,
          trade_status: '进行中'
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
        break;
    }
  }
}

module.exports = BillController;