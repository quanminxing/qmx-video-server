const nodemailer = require('nodemailer');

exports.sendMail = function(title, htmlText, address, cb){
    console.log(this)
    const transporter = nodemailer.createTransport({
        host: "smtp.163.com",
        secureConnection: true, // use SSL
        port: 465, // port
        auth: {
            user: 'qmx_alert@163.com',
            pass: 'helloworld1234'
        }
    });
    // const mailOption = {
    //     from: 'qmx_alert@163.com', // sender address
    //     //to: 'jtyjty99999@126.com', // list of receivers
    //     //to:'bd@qmxpower.com',
    //     to: ['742624033@qq.com'],
    //     //cc: 'lisong2721@dingtalk.com',
    //     subject: title, // Subject line
    //     html: htmlText, // plaintext body
    // };
    const mailOptions = {
        from: 'qmx_alert@163.com', // sender address
        //to: 'jtyjty99999@126.com', // list of receivers
        to:address,
        //to: '742624033@qq.com',
        //测试邮箱
        //to:'13253314257@163.com',
        //bcc: 'lisong2721@dingtalk.com',
        subject: title, // Subject line
        html: htmlText, // plaintext body
    }
    transporter.sendMail(mailOptions, function(error, info){
        if(error) {
            cb(error)
        } else {
            cb(info);
        }
    });
}