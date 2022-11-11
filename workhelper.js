const pool = require("./dbhelper");
const dayjs = require("dayjs");
const { v4: uuidv4 } = require("uuid");
//const express = require("express");
//const app = express();
//app.use(express.json());

const update_details = (data_to_update, id) =>
  new Promise((resolve, reject) => {
    var update_detail_query = "UPDATE student.users SET ? WHERE id= ?";
    var data = [data_to_update, id];
    pool.query(update_detail_query, data, function (err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log(error);
});

const get_squad_request_external_data = (user_id) =>
  new Promise((resolve, reject) => {
    var get_squad_request_external_query =
      "select * from vmsback.squad_request_external where user_id=?";
    pool.query(
      get_squad_request_external_query,
      user_id,
      function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0].created_at);
        }
      }
    );
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log(error);
});



const time_difference = (date) => {
  const date1 = dayjs(date).format("YYYY/MM/DD HH:MM:ss");
  console.log(date1);
  let diff = dayjs().diff(date1, "day");
  console.log(diff);
};

/*const insertdatain_archivework = (work_id) =>
  new Promise((resolve, reject) => {
    var insertdata_archive_work_query =
      "INSERT INTO vmsback.archive_work SELECT * from vmsback.work where work_id=?;";
    pool.query(
      insertdata_archive_work_query,
      work_id,
      function (err, rows, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log(error);
});*/



const read_work_data = (work_id) =>
  new Promise((resolve, reject) => {
    var read_work_data_query = "SELECT * FROM vmsback.work WHERE work_id=?";
    pool.query(read_work_data_query, work_id, function (err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
})
.then((response) => {
      return response;
})
.catch((error) => {
      console.log(error);
});

const delete_work_data=(work_id)=>new Promise((resolve, reject) => {
  var delete_work_data_query='DELETE FROM vmsback.archive_work where work_id=?'
  pool.query(delete_work_data_query,work_id,function(err,rows,fields){
    if(err){
      reject(err)
    }else{
      resolve(rows)
    }
  })
})
.then((response)=>{
  return response;
}).catch((error)=>{
  console.log(error)
})

const add_archive_work_data = (data) =>
  new Promise((resolve, reject) => {
    var add_archive_work_data_query = "INSERT INTO vmsback.archive_work SET ?";
    pool.query(add_archive_work_data_query, data, function (err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log(error);
    });

module.exports = {
  update_details,
  get_squad_request_external_data,
  time_difference,
  insertdatain_archivework,
  read_work_data,
  add_archive_work_data,
  delete_work_data
};
