const regs=require('./regs');
const succcode = 0;
const errcode = 1;
function reg(sock, db, query){
    const {username, password} = query;
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
}

function login(sock, db, query){
    const {username, password} = query;
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
                        return {ID:data[0].ID, username};
                    }
                });
            }          
        });
    }
}
module.exports={
    reg,
    login
};