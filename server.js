const http = require('http');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');
const api = require('./lib/api');
const httpServer = http.createServer((req, res) => {
    let {pathname, query} = url.parse(req.url, true);
    const str = pathname.replace(/\//, '');
    if (req.method !== 'GET') {
        let body = '';
        req.on('data', function (chunk) {
            body += chunk;
        });
        req.on('end', function () {
        // 解析参数
            query = querystring.parse(body);
            console.log(query);
        });
    } 
     
    
    //console.log(url.parse(req.url, true));
    // console.log(query);

    console.log(req.method);
    
    if (api[str]) {
        api[str](req, res, query);
    } else if(/\./.test(pathname)){
        fs.readFile(`www${pathname}`, (err, data) => {
            if (err) {
                res.write(`出错了，${JSON.stringify(err)}`);
            } else {
                res.write(data);
            }
            res.end();
        });
    } else{
        res.write('请求有错误');
        res.end();
    }  
});

httpServer.listen(8099);

