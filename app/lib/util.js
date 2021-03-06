const crypto = require('crypto');

let access_token = '';
let expire_time = '';
exports.getAccessToken = async function(appid, secret, app) {
    
    let token_url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appid + '&secret=' + secret;
    if (access_token === '' || expire_time || (parseInt(new Date().getTime() / 1000) - expire_time < 300)) {
        access_token = await app.curl(token_url);
        if (access_token) {
          const result = JSON.parse(access_token.data.toString());
          access_token = result.access_token;
          expire_time = parseInt(new Date().getTime() / 1000);
          return access_token;
        }
      } else {
        return  access_token ;
      }
}

exports.getDate = function () {
    const date = new Date();
    let Year = date.getFullYear() - 2000;
    let Month = ('0' + (date.getMonth() + 1)).slice(-2);
    let day = ('0' + date.getDate()).slice(-2)
    let hours = ('0' + date.getHours()).slice(-2)
    let minutes = ('0' + date.getMinutes()).slice(-2)
    let seconds = ('0' + date.getSeconds()).slice(-2)

    let res = '' + Year + Month + day + hours + minutes + seconds
    return res
}
exports.getSixRandom = function () {
    const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let res = '';
    res += parseInt((Math.random() * 1000000));
    return res;
}

exports.getNonceStr = function () {
    const chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    let min = Math.ceil(0);
    let max = Math.floor(chars.length);
    let nonceStr = '';
    for (let round = 0; round < 20; round++) {
        nonceStr += chars[Math.floor(Math.random()) * (max - min + 1) + min]
    }
    return nonceStr;
}

exports.queryToXML = function (params, key) {
    let paramsArray = params.replace(' ', '').split('&').sort();

    let stringSign = (paramsArray.join('&') + key).replace(' ', '')

    let md5 = crypto.createHash('md5');
    let sign = md5.update(stringSign).digest('hex').toUpperCase();
    paramsArray.push('sign=' + sign)
    let dataXml = '<xml>\n'
    for (var i = 0; i < paramsArray.length; i++) {
        dataXml += '<' + paramsArray[i].split("=")[0] + '>' + paramsArray[i].split("=")[1] + '</' + paramsArray[i].split("=")[0] + '>\n'
    }
    dataXml += '</xml>'
    return dataXml;
}

exports.getSign = function (params, key) {
    console.log(key);
    let paramsArray = params.replace(' ', '').split('&').sort();

    let stringSign = (paramsArray.join('&') + key).replace(' ', '')

    console.log(stringSign)
    let md5 = crypto.createHash('md5');
    let sign = md5.update(stringSign).digest('hex').toUpperCase();
    console.log(sign)
    return sign;
}
