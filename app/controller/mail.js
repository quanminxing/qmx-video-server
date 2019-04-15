const mm = require('../lib/mail');

const Controller = require('egg').Controller;

exports.sendMail = function () {

    const title = this.query.title;
    const text = this.query.text;
    const ctx = this;
    ctx.body = 'success';
    mm.sendMail(title, text, function (a) {
        console.log(a);
    });

}
