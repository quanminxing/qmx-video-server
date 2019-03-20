'use strict';

const moment = require('moment');
const marked = require('marked');
const counter = require('../lib/count');


exports.index = function* () {

  yield this.render('key.html',{
    current:"key",
    title:"颗粒库"
  });

};


exports.listAll = function *(){
    const pageNum = +this.query.page || 1;
    const pageSize = +this.query.rows || 100;
    //全查
    let result = yield this.service.key.list();
    let total = yield this.service.key.count();

    for(let i = 0; i < result.length; i++){
      if(result[i].level === 3){
        result[i].children = yield this.service.keyUnit.listByKeyid(1, 1000, result[i].id)
      }else{
        result[i].children = []
      }
    }

    this.body = {
      total: total > pageSize ? (parseInt(total / pageSize) + 1) : 1,
      rows: result
    };
}

exports.main = function *(){

    const body = this.request.body;
    const oper = body.oper; 
    const id = body.id;
    const name = body.name;
    const parent_id = body.parent_id;
    const level = body.level;
    const work_id = this.session.user.id;
  
    if(oper === 'add'){

      this.body = yield this.service.key.insert({
        name,
        parent_id,
        level
      });

      yield this.service.workerLog.insert({
        event: '新增颗粒度'+ name,
        place:'颗粒库',
        work_id
      });
  
    }else if(oper === 'edit'){
  
      yield this.service.key.update({
        id,
        name,
      });

      yield this.service.workerLog.insert({
        event: '修改颗粒度'+ name,
        place:'颗粒库',
        work_id
      });
  
      this.body = 'success';
  
    }else if(oper === 'del'){
  
      yield this.service.key.remove(id);

      yield this.service.workerLog.insert({
        event: '删除颗粒度'+ id,
        place:'颗粒库',
        work_id
      });
  
      this.body = 'success';
    }
  
  
  }
  
  exports.list = function* () {
    const pageNum = +this.query.page || 1;
    const pageSize = +this.query.rows || 100;

    //全查
    let result = yield this.service.key.list();
    let total = yield this.service.key.count();
    this.body = {
      total: total > pageSize ? (parseInt(total / pageSize) + 1) : 1,
      rows: result
    };
  }