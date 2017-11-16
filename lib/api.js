const regs=require('./regs');
function reg( req, res, query){
    const {username, password} = query;
    res.write(JSON.stringify({username, password}));
    res.end();
}
module.exports={
    reg
};