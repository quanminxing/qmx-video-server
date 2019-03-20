const nodemailer = require('nodemailer');

exports.sendMail = function(title, text, cb){

    const transporter = nodemailer.createTransport({
        host: "smtp.163.com",
        secureConnection: true, // use SSL
        port: 465, // port
        auth: {
            user: 'qmx_alert@163.com',
            pass: 'helloworld1234'
        }
    });
    const mailOptions = {
        from: 'qmx_alert@163.com', // sender address
        //to: 'jtyjty99999@126.com', // list of receivers
        //to:'bd@qmxpower.com',
        to: '742624033@qq.com',
        subject: title, // Subject line
        text: text, // plaintext body
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            cb(error)
        }else{
            cb(info);
        }
    });
}