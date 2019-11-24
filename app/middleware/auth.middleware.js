const jwt = require('jsonwebtoken');

module.exports = function(req,res,next){
    const token = req.header('auth-token');
    if(!token) return res.status(401).send('Access Denied');
    try{
        const secret_key = "abccd"//process.env.app_jwt_secret_key;
        const decoded = jwt.verify(token,secret_key);
        req.user = decoded;
        next();
    }
    catch(ex){
        res.status(400).send('Invalid Token!');
    }
}