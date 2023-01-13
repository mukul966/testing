const mysql = require("mysql");

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "mysql",
});

con.connect((err) => {
  if (err) 
    console.log(err);
//console.log("App is connected to DataBase !!!");

});

module.exports = con;
