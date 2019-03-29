
function putvideo(stsurl, filename, file, callback) {
    $.get(stsurl, function (response) {
        console.log(response)
        let stskey = response.sts
        try {
            let client = new OSS(stskey);
            let urls;
            client.multipartUpload('video/' + filename, file).then(function (res) {
                urls = res.res.requestUrls;
                for(let i = 0; i < urls.length; i++) {
                    urls[i] = urls[i].replace('qmx-video.oss-cn-hangzhou.aliyuncs.com', 'file.qmxpower.com')
                }
                let result = {
                    urls: urls,
                    status: 200
                }
                callback(result);
            })
        } catch (e) {
            errmsg = 'parse sts response info error: ' + e.message;
            callback(errmsg);
        }
    })
}
function putimage(stsurl, filename, file, callback) {
    $.get(stsurl, function (response) {
        console.log(response)
        let stskey = response.sts
        try {
            let client = new OSS(stskey);
            client.multipartUpload('image/' + filename, file).then(function (res) {
                urls = res.res.requestUrls;
                for(let i = 0; i < urls.length; i++) {
                    urls[i] = urls[i].replace('qmx-video.oss-cn-hangzhou.aliyuncs.com', 'file.qmxpower.com')
                }
                let result = {
                    urls: urls,
                    status: 200
                }
                callback(result);
            })
        } catch (e) {
            errmsg = e.message;
            callback(errmsg);
        }
    })
}
    // var progress = function (p) {
    //     return function (done) {
    //       var bar = document.getElementById('progress-bar');
    //       bar.style.width = Math.floor(p * 100) + '%';
    //       bar.innerHTML = Math.floor(p * 100) + '%';
    //       done();
    //     }
    //   };
    var script = document.createElement("script")
    script.type = "text/javascript";
    if (script.readyState) { //IE
        script.onreadystatechange = function () {
            if (script.readyState == "loaded" || script.readyState == "complete") {
                script.onreadystatechange = null;
                console.log('加载oss文件')
            }
        };
    } else {
        script.onload = function () {
            console.log('加载oss文件')
        };
    }
    script.src = 'http://file.qmxpower.com/scripts/aliyun-oss-sdk.min.js';
    document.getElementsByTagName("head")[0].appendChild(script);
