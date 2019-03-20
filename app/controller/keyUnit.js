'use strict';

const moment = require('moment');
const marked = require('marked');
const counter = require('../lib/count');

// 新增

exports.main = function* () {

    const body = this.request.body;
    const oper = body.oper;
    const id = body.id;
    const work_id = this.session.user.id;
    const name = body.name;
    const price = body.price;
    const description = body.description;
    const url = body.url;
    const key_id = body.key_id;

    if (oper === 'add') {
          
        yield this.service.keyUnit.insert({
            work_id,
            name,
            key_id,
            description,
            url,
            price
        });

        yield this.service.workerLog.insert({
            event: '新增颗粒库'+ name,
            place:'颗粒库',
            work_id
          });

        this.body = 'success';

    } else if (oper === 'edit') {

        yield this.service.keyUnit.update({
            id,
            work_id,
            name,
            key_id,
            description,
            url,
            price
        });

        yield this.service.workerLog.insert({
            event: '修改颗粒库'+ name,
            place:'颗粒库',
            work_id
          });

        this.body = 'success';

    } else if (oper === 'del') {

        yield this.service.workerLog.insert({
            event: '删除颗粒库'+ name,
            place:'颗粒库',
            work_id
          });

        let ids = this.request.body.ids;
        for(let i = 0, l = ids.length; i< l; i++){
            yield this.service.keyUnit.remove(ids[i]);
        }
        
        this.body = 'success';
    }


}

exports.list = function* () {
    const pageNum = +this.query.pageNumber || 1;
    const pageSize = +this.query.pageSize || 100;
    const key_id = this.query.key_id;
    let result = [], total = 0;
    if(key_id && key_id !== '0'){
                // 查所有子集
                
                let d = yield this.service.keyUnit.getChildNode(key_id);
                console.log(d);
                d = d[0].childs.split(',');
                d.shift();
                for(let i =0, l = d.length;i<l ;i++){
                    //先全取出来
                    result = result.concat(yield this.service.keyUnit.listByKeyid(1, 1000, d[i]));
                    total += yield this.service.keyUnit.count('key_id='+d[i]);
                    console.log(d[i]);
                }
                
                //再做分页
                result = result.splice((pageNum-1) * pageSize, pageSize);

                /*
        result = yield this.service.keyUnit.listByKeyid(pageNum, pageSize, key_id);
        total = yield this.service.keyUnit.count('key_id='+key_id);*/
    }else{
        result = yield this.service.keyUnit.list(pageNum, pageSize);
        total = yield this.service.keyUnit.count('1=1');
    }
    
    
    this.body = {
        pageNumber: pageNum,
        pageSize,
        totalRow:total, 
        totalPage: total > pageSize ? (parseInt(total / pageSize) + 1) : 1,
        list: result
    };
}