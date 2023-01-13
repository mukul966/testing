 let admin = require('firebase-admin');
 let auth;
let userdata='';
let initapp=admin.initializeApp({
     credential: admin.credential.applicationDefault(),
});

let checkToken = (req, res, next) => {
    //console.log("Req headers " + JSON.stringify(req.headers));
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (token) {
        //written by vivek start
         
         admin.auth()
            .verifyIdToken(token)
            .then((decodedToken) => {
                userdata = decodedToken;
                next();
            })
            .catch((error) => {
                console.log("Not able to decode the token ALERT-" + error);
            });
        //end of token by vivek end
        //console.log("Token is present " + token);
     
 
    } else {
        return res.json({
            success: false,
            message: 'Auth token is not supplied'
        });
    }
};

let getUserOrigData = () => {
    return userdata;
}

let getUserData = (req) => {
    if(req){
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (token) {
        //written by vivek start
       return  admin.auth().verifyIdToken(token);
    }
}
 }

module.exports = {
    checkToken: checkToken,
    getUserData: getUserData,
    getUserOrigData: getUserOrigData
}