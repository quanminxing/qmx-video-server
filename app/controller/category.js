'use strict';

const moment = require('moment');
const marked = require('marked');
const counter = require('../lib/count');


exports.index = function* () {

  yield this.render('category.html',{
    current:"category",
    title:"类目库"
  });

};



exports.main = function *(){

    const body = this.request.body;
    const oper = body.oper; 
    const id = body.id;
    const name = body.name;
    const parent_id = body.parent_id;
    const level = body.level;
    const work_id = this.session.user.id;
  
    if(oper === 'add'){

      this.body = yield this.service.category.insert({
        name,
        parent_id,
        level
      });

      yield this.service.workerLog.insert({
        event: '新增类目'+ name,
        place:'类目管理',
        work_id
      });
  
    }else if(oper === 'edit'){
  
      yield this.service.category.update({
        id,
        name,
      });

      yield this.service.workerLog.insert({
        event: '修改类目'+ name,
        place:'类目管理',
        work_id
      });
  
      this.body = 'success';
  
    }else if(oper === 'del'){

      yield this.service.category.remove(id);

      yield this.service.workerLog.insert({
        event: '删除类目'+ id,
        place:'类目管理',
        work_id
      });
  
  
      this.body = 'success';
    }
  
  
  }
  
  exports.list = function* () {
    const pageNum = +this.query.page || 1;
    const pageSize = +this.query.rows || 100;

    //全查
    let result = yield this.service.category.list();
    let total = yield this.service.category.count();
    this.body = {
      total: total > pageSize ? (parseInt(total / pageSize) + 1) : 1,
      rows: result
    };
  }