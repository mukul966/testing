const pool = require("./olddbhelper");

const updateDetails = (data_to_update, id) =>
  new Promise((resolve, reject) => 
  {
    delete data_to_update.id;
    
    const updateContactDetailQuery = "UPDATE vmsback.users SET ? WHERE id= ?";
    
    const data = [data_to_update, id];
    
    pool.query( updateContactDetailQuery, data, function (err, rows, fields) {
      if ( err ) 
      {
        reject( err );
      } 
      else 
      {
        resolve(
          {
          message: "Data Updated",
          });
      }
    });
  })
  .then(( response ) => 
    {
      return response;
    })
  .catch(( error ) => 
    {
      console.log(" Error in updateDetails WorkHelper ==>> ", error )
      
      return{
              error: error.message,
            };
    });



module.exports = { updateDetails };
