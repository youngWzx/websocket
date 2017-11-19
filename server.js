const http = require('http');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');
const io = require('socket.io');
const mysql = require('mysql');
const api = require('./lib/api');
const regs=require('./lib/regs');
const succcode = 0;
const errcode = 1;
const db = mysql.createPool({host:'localhost', user:'root', password:'', database:'test'});

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
            handleReq(req, res, str, pathname, query);
        });
    }else{
        handleReq(req, res, str, pathname, query);
    }

    function handleReq(req, res, str, pathname, query){  
        if (api[str]) {
            return;
            //api[str](req, res, query);
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
    }
});

httpServer.listen(8099);

const ws = io.listen(httpServer);
const aSock = [];
ws.on('connection', (sock) => {
    console.log('来人了');
    aSock.push(sock);
    let current_user = '';
    let current_ID = '';
    sock.on('reg', (username, password) => {
        //const user = username;
        //const pass = password;
        //api['reg'](sock, db, {username, password});
        //sock.emit('reg_ret', 'hello');
        if (!regs.name.test(username)) {
            sock.emit('reg_ret', errcode, '用户名格式不正确');
        } else if(!regs.password.test(password)) {
            sock.emit('reg_ret', errcode, '密码格式不正确');
        } else {
            db.query(`SELECT ID from user_table WHERE username='${username}'`, (err, data) => {
                if (err) {
                    sock.emit('reg_ret', errcode, '数据库有错');
                } else {
                    if (data.length) {
                        sock.emit('reg_ret', errcode, '用户名已存在');        
                    } else{
                        db.query(`INSERT INTO user_table (username, password, online) VALUES ('${username}', '${password}', 0)`, err => {                       
                            if (err) {
                                sock.emit('reg_ret', errcode, '数据库有错');
                            } else {
                                sock.emit('reg_ret', succcode, '注册成功');
                            }
                        });
                    }
                }
            });
        }
    });

    sock.on('login', (username, password) => {
        //const user =username;
        //const pass = password;
        //const info = api['login'](sock, db, {username, password});
        //console.log(info);
        if (!regs.name.test(username)) {
            sock.emit('login_ret', errcode, '用户名格式不正确');
        } else if(!regs.password.test(password)) {
            sock.emit('login_ret', errcode, '密码格式不正确');
        } else {
            db.query(`SELECT ID, password from user_table WHERE username = '${username}'`, (err, data) => {
                if (err) {
                    sock.emit('login_ret', errcode, '数据库有错');
                } else if (data.length === 0) {
                    sock.emit('login_ret', errcode, '用户不存在');        
                } else if(password !== data[0].password){
                    sock.emit('login_ret', errcode, '密码不正确');
                }else{
                    db.query(`UPDATE user_table SET online = 1 WHERE ID = ${data[0].ID}`, err => {                       
                        if (err) {
                            sock.emit('login_ret', errcode, '数据库有错');
                        } else {
                            sock.emit('login_ret', succcode, '登录成功');
                            current_user = username;
                            current_ID= data[0].ID;
                        }
                    });
                }          
            });
        }
    });

    sock.on('msg', text => {
        console.log(aSock.length);
        aSock.forEach(item => {
            if (item==sock) {
                return;
            }
            item.emit('msg', current_user, text);
        });
        sock.emit('msg_ret', succcode, '发送成功');
    });

    sock.on('disconnect', () => {
        db.query(`UPDATE user_table SET online = 0 WHERE ID = ${current_ID}`, err => {
            if (err) {
                console.log('数据库有错');
            }
            current_ID = '';
            current_user = '';
        });
    });
});
