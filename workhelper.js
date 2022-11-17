const pool = require("./dbhelper");
const dayjs = require("dayjs");
const { v4: uuidv4 } = require("uuid");
//const express = require("express");
//const app = express();
//app.use(express.json());

const update_details = (data_to_update, id) =>
  new Promise((resolve, reject) => {
    delete data_to_update.id;
    var update_detail_query = "UPDATE vmsback.users SET ? WHERE id= ?";
    var data = [data_to_update, id];
    pool.query(update_detail_query, data, function (err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve({
          message: "Data Updated",
        });
      }
    });
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return {
        error: error.message,
      };
    });

const update_squad_details = (data_to_update, id) =>
  new Promise((resolve, reject) => {
    delete data_to_update.squad_id;
    var update_squad_detail_query =
      "UPDATE vmsback.squad SET ? WHERE squad_id= ?";
    var data = [data_to_update, id];
    pool.query(update_squad_detail_query, data, function (err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve({
          message: "Data Updated",
        });
      }
    });
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log(error);
      return {
        error: error.message,
      };
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
        //console.log(rows);
      }
    });
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log(error);
    });

const delete_work_data = (work_id) =>
  new Promise((resolve, reject) => {
    var delete_work_data_query =
      "DELETE FROM vmsback.archive_work where work_id=?";
    pool.query(delete_work_data_query, work_id, function (err, rows, fields) {
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

const add_archive_work_data = (data) =>
  new Promise((resolve, reject) => {
    var add_archive_work_data_query = "INSERT INTO vmsback.archive_work SET ?";
    pool.query(add_archive_work_data_query, data, function (err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve({
          message: "data has been archived for " + work_id,
        });
      }
    });
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log(error);
    });

const createSquadWorkClient = (ClientDetails) =>
  new Promise((resolve, reject) => {
    const Work_client_id = (ClientDetails.work_client_id = uuidv4());
    const add_data_query = "INSERT INTO vmsback.squad_work_client SET ?";

    pool.query(add_data_query, ClientDetails, function (err, row, fields) {
      if (err) {
        reject(err);
      } else {
        resolve({
          message: "data added to squadWorkClient table",
          work_client_id: Work_client_id,
        });
      }
    });
  })

    .then((response) => {
      return response;
    })

    .catch((error) => {
      console.log("error from createsquadWorkClient workhelper", error);
      return {
        error: error.message,
      };
    });

const updateSquadWorkClient = (data_to_update, work_client_id) =>
  new Promise((resolve, reject) => {
    delete data_to_update.work_client_id;

    const update_squad_work_client_query =
      "UPDATE vmsback.squad_work_client SET ? WHERE work_client_id=?";

    const parameter = [data_to_update, work_client_id];
    pool.query(
      update_squad_work_client_query,
      parameter,
      function (err, row, fields) {
        if (err) {
          reject(err);
        } else {
          resolve({
            message: "Data updated for Work_Client_id:",
            work_client_id: work_client_id,
          });
        }
      }
    );
  })

    .then((response) => {
      return response;
    })

    .catch((error) => {
      console.log("error from updateSquadWorkClient workhelper", error);
      return {
        error: error.message,
      };
    });

// const viewSquadClientImg = (squad_id) =>
//   new Promise((resolve, reject) => {
//     const profileimg_query = `SELECT s.squad_id,s.squad_name,c.client_id, c.client_name, i.imgid, i.imgname
//       FROM
//   vmsback.squad s
//       INNER JOIN
//   vmsback.squad_client c ON s.squad_id = c.squad_id
//       INNER JOIN
//   vmsback.squad_client_image i ON c.client_id = i.client_id  WHERE s.squad_id=?`;

//     pool.query(profileimg_query, squad_id, function (err, rows, fields) {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(rows);
//       }
//     });
//   })
//     .then((response) => {
//       return response;
//     })
//     .catch((error) => {
//       return error;
//     });

const viewAllProjects = (squad_id) =>
  new Promise((resolve, reject) => {
    
    const viewAllProjectsQuery = 'SELECT work_id, work_title FROM vmsback.work WHERE squad_id=?';

    pool.query(viewAllProjectsQuery, squad_id, function (err, rows, fields) {
      if (err) 
        {
          reject({ error: err.message });
        } 
      else 
        {
          resolve(rows);
        }
    });
  })
    .then((response) => 
      {
        return response;
      })
    .catch((error) => 
      {
        console.log("Error From viewAllProject WorkHelper ==> ",error);
      
        return { error: error.message };
      });


const getAllWorkResources = (work_id) =>
  new Promise((resolve, reject) => {
    
    const getResourcesQuery ="SELECT resource_id,role_name,currency,amount FROM vmsback.work_resource WHERE work_id=?";

    pool.query( getResourcesQuery , work_id,  function (err, rows, fields) {
      if (err)
        {
          reject({ error: err.message });
        } 
      else 
        {
          resolve(rows);
        }
    });
  })
    .then((response) => 
      {
        return response;
      })
    .catch((error) => 
      {
      
        console.log("Error from getAllWorkResources WorkHelper ==> ", error);
      
        return { error : error.message };
      });


  const viewSquadClients = (squad_name) =>
    new Promise((resolve, reject) => {
      
      const viewClientsQuery = `SELECT Client.client_squad_id, Squad.squad_name 
        FROM 
      vmsback.squad Squad
        INNER JOIN 
      vmsback.squad_work_client Client
        ON 
      Client.client_squad_id = Squad.squad_id 
        WHERE 
      Squad.squad_name LIKE ? `

      pool.query(viewClientsQuery, ['%' + squad_name + '%'], function( err, rows, fields ){
        if(err)
          {
            reject(err);
          }
        else
          {
            resolve(rows);
          }
      })
    })

    .then((response)=>
      {
        return response;
      })

    .catch((error)=>
      {
        console.log("Error From viewSquadClients WorkHelper ==> ", error)

        return { error : error.message }
      })

  


  const updateInvoice=()=>new Promise((resolve, reject) => {
    
    const updateInvoiceQuery="UPDATE vmsback.invoice_data SET ? WHERE squad_id= ?"

    pool.query(updateInvoice,)
  })


module.exports = {
  update_details,
  update_squad_details,
  get_squad_request_external_data,
  time_difference,
  read_work_data,
  add_archive_work_data,
  delete_work_data,
  createSquadWorkClient,
  updateSquadWorkClient,
  //viewSquadClientImg,
  viewAllProjects,
  getAllWorkResources,
  viewSquadClients
};
