const mysql = require("mysql");

const con=() =>{
      var pool;

      pool=mysql.createPool({
      connectionLimit:50,
      host: "localhost",
      user: "root",
      password: "root123",
      database: "vmsback",
    });
    return pool
} 

// rs

//module.exports = con;
// pool.query('select * from work',(err,result,fields)=>{
//       if(err){
//             return console.log(err)
//       }else{
//             return console.log(result)
//       }
// })
module.exports.getconnection=con