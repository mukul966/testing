const router = require("express").Router();
const mysql = require("mysql");
const dotenv = require("dotenv");
const dbhelper = require("./dbhelper");
const middleware = require("./middleware");
var connection = dbhelper.getconnection();

dotenv.config();

//need get user profile router here
router.post("/getuserabout", middleware.checkToken, (req, res) => {
  var userdata = req.body;
  //console.log("getuserprof-  data red " + JSON.stringify(userdata.user_id));
  //console.log("Middlewear user id " + middleware.getUserOrigData().uid);
  var stmt = "select * from userprof_abme a where a.id=?";
  connection.query(
    stmt,
    [userdata.user_id],
    function (err, rows, fields) {
      if (err) {
        console.log("DB Error in /userprof/getuserprof :" + err);
      } else {
        if (rows.length > 0) {
          console.log("getuserprof Returning user " + JSON.stringify(rows));
          res.json({
            user_id: rows[0].id,
            general: {
              about_me: {
                filled: true,
                content: rows[0].abme_content,
              },
            },
          });
        } //end of if
        else {
          res.json({ status: true, msg: "No data to report" });
        }
      } //end of else
    } //end of function
  );
}); //end of  getuserprof

router.post("/updlocation", middleware.checkToken, (req, res) => {
  var userdata = req.body;
  var delstmt = "DELETE FROM user_prof_info WHERE id = ?";

  connection.query(delstmt, [userdata.uid], function (err, result) {
    if (err) {
      console.log("Error in deleting user profile info " + err);
      res.json({
        status: false,
        msg: "Error in updating user profile info " + err,
      });
    } else {
      // console.log("User profile info deleted successfully "+userdata.location.city);
      var insstmt =
        "insert into user_prof_info (id, city,state,country,create_time,update_time,address) values (?,?,?,?,?,?,?)";
      connection.query(
        insstmt,
        [
          userdata.uid,
          userdata.location.city,
          userdata.location.state,
          userdata.location.country,
          new Date(),
          new Date(),
          userdata.location.address,
        ],
        function (err, rows, fields) {
          if (err) {
            console.log("DB Error in /userprof/updlocation :" + err);
            res.json({
              status: false,
              msg: "Error in inserting user profile info " + err,
            });
          } else {
            res.json({ status: true });
          } //end of else
        } //end of function for inststmt query
      ); //end of insert query
    } //end of else
  }); //end of function for delstmt query
}); //end of router post for upd location

router.post("/getlocation", middleware.checkToken, (req, res) => {
  var userdata = req.body;
  var stmt = "select * from user_prof_info a where a.id=?";
  connection.query(
    stmt,
    [userdata.uid],
    function (err, rows, fields) {
      if (err) {
        console.log("DB Error in /userprof/getlocation :" + err);
      } else {
        if (rows.length > 0) {
          console.log("getlocation Returning data " + JSON.stringify(rows));
          res.json({
            user_id: rows[0].id,
            location: {
              city: rows[0].city,
              state: rows[0].state,
              country: rows[0].country,
              address: rows[0].address,
            },
          });
        } //end of if
        else {
          res.json({ status: true, msg: "No data to report" });
        }
      } //end of else
    } //end of function
  );
});

router.post("/updprofile", middleware.checkToken, (req, res) => {
  var userdata = req.body;
  console.log("Received2 user data from front end " + JSON.stringify(userdata));
  //way to parse a json tree
  /*console.log(
    "Received user data from front end " +
      JSON.stringify(userdata.general.skills.skill_list[2])
  );
 */
  updprofile(userdata)
    .then(
      upduserskills(userdata).then((result) => {
        if (result.status) {
          console.log("Replying back to front end");
          res.json({
            success: true,
            usrupd: true,
          });
        }
      })
    )
    .catch((err) => {
      console.log("Error in updating user profile " + err);
      res.json({
        success: true,
        usrupd: false,
      });
    });

  /*
      res.json({
        success: true,
        usrupd: true,
      });
      */
}); //end of router.post

router.post("/updprofabout", middleware.checkToken, (req, res) => {
  var userabdata = req.body;
  console.log(
    "Received user about me data from front end " + JSON.stringify(userabdata)
  );

  updaboutme(userabdata)
    .then((result) => {
      if (result.status) {
        console.log("Replying back to front end");
        res.json({
          success: true,
          usrupd: true,
        });
      }
    }) //end of then
    .catch((err) => {
      console.log("Error in updating user profile " + err);
      res.json({
        success: true,
        usrupdab: false,
      });
    });
}); //end of routerpost updprofabout

const updprofile = (userdata) => {
  //console.log("User first name is " + userdata.name);
  return new Promise((resolve, reject) => {
    var todelid = "";
    if (userdata.user_id) {
      todelid = userdata.user_id;
      console.log("Deleting2 id for " + todelid);
    }
    var delstmt = "DELETE FROM user_prof_info WHERE id = ?";

    connection.query(delstmt, [todelid], function (err, result) {
      if (err) {
        console.log("Error in deleting user profile info " + err);
        reject({
          status: false,
          msg: "Error in deleting user profile info " + err,
        });
      } else {
        console.log("User profile info deleted successfully");
        var insstmt =
          "insert into user_prof_info (id, city,state,country,create_time,update_time) values (?,?,?,?,?,?)";
        connection.query(
          insstmt,
          [
            userdata.user_id,
            userdata.city,
            userdata.state,
            userdata.country,
            new Date(),
            new Date(),
          ],
          function (err, rows, fields) {
            if (err) {
              console.log("DB Error in /userprof/updprofile :" + err);
              reject({
                status: false,
                msg: "Error in inserting user profile info " + err,
              });
            } else {
              resolve({ status: true });
            } //end of else
          } //end of function for inststmt query
        ); //end of insert query
      } //end of else
    }); //end of function for delstmt query
  }); //end of promise
}; //end of function updprofile

//function to store about medetails
const updaboutme = (userdata) => {
  console.log(" About me update section " + userdata.general.about_me);
  return new Promise((resolve, reject) => {
    var delstmt = "DELETE FROM userprof_abme WHERE id = ?";
    connection.query(delstmt, [userdata.user_id], function (err, result) {
      if (err) {
        console.log("Error in deleting about me " + err);
        reject({
          status: false,
          msg: "Error in deleting about" + err,
        });
      } else {
        console.log("about deleted successfully ");
        var insme =
          "insert into userprof_abme (id, abme_content, create_time, update_time) values (?,?,?,?)";
        connection.query(
          insme,
          [
            userdata.user_id,
            userdata.general.about_me.content,
            new Date(),
            new Date(),
          ],
          function (err, rows, fields) {
            if (err) {
              console.log("DB Error in /insert/updaboutme :" + err);
              reject({
                status: false,
                msg: "Error in inserting user about me info " + err,
              });
            } else {
              resolve({ status: true });
            } //end of else
          } //end of function for inststmt query
        ); //end of insert query
      } //end of else
    }); //end of del query
  }); //end of promise
}; //end of updaboutme function

//function to store general section of the user profile

const updcarddtls = (userdata) => {
  //console.log(" card update section " + userdata.general.about_me);
  return new Promise((resolve, reject) => {
    var todelid = "";
    if (userdata.user_id) {
      todelid = userdata.user_id;
      console.log("Deleting id for " + todelid);
    }
    var delstmt = "DELETE FROM card_order WHERE id = " + todelid;

    connection.query(delstmt, function (err, result) {
      if (err) {
        console.log("Error in deleting card order " + err);
        reject({
          status: false,
          msg: "Error in deleting card order" + err,
        });
      } else {
        console.log(
          "Card Order deleted successfully " + userdata.general.corder
        );
        var insstmt =
          "insert into card_order (`id`, `abme_filled`, `abme_content` ,`rejected` ,`corder`, `create_time`,`update_time`) values (?,?,?,?,?,?,?)";
        connection.query(
          insstmt,
          [
            userdata.user_id,
            userdata.general.about_me.filled,
            userdata.general.about_me.content,
            JSON.stringify(userdata.general.rejected),
            JSON.stringify(userdata.general.corder),
            new Date(),
            new Date(),
          ],
          function (err, rows, fields) {
            if (err) {
              console.log("DB Error in /login/updprofile :" + err);
              reject({
                status: false,
                msg: "Error in inserting user profile info " + err,
              });
            } else {
              resolve({ status: true });
            } //end of else
          } //end of function for inststmt query
        ); //end of insert query
      } //end of else
    }); //end of function for delstmt query
  }); //end of promise
}; //end of function updprofile

const upduserskills = (userdata) => {
  return new Promise((resolve, reject) => {
    if (userdata.general.skills) {
      console.log(
        "Skills update section " +
          JSON.stringify(userdata.general.skills.skill_list[0])
      );

      if (userdata.user_id) {
        todelid = userdata.user_id;
        console.log("Deleting id for " + todelid);
      }

      var delstmt = "DELETE FROM user_skills WHERE id = " + todelid;

      connection.query(delstmt, function (err, result) {
        if (err) {
          console.log("Error in deleting user skills" + err);
          reject({
            status: false,
            msg: "Error in deleting user skills" + err,
          });
        } else {
          console.log("User Skills deleted successfully ");

          for (const skill of userdata.general.skills.skill_list) {
            console.log("Skill is " + skill.name);
            var insstmt =
              "insert into user_skills (`id`, `skillid`, `logo` ,`skillname` ,`descrip`, duration,`percentage`,`create_time`,`update_time`) values (?,?,?,?,?,?,?,?,?)";

            connection.query(
              insstmt,
              [
                userdata.user_id,
                skill.id,
                "Image Placeholder",
                skill.name,
                skill.desc,
                skill.duration,
                skill.percentage,
                new Date(),
                new Date(),
              ],
              function (err, rows, fields) {
                if (err) {
                  console.log("DB Error in /login/updprofile :" + err);
                  reject({
                    status: false,
                    msg: "Error in inserting user profile info " + err,
                  });
                } else {
                  resolve({ status: true });
                } //end of else
              } //end of function for inststmt query
            ); //end of insert query
          } //end of iterating over skills
        } //end of else
      }); //end of function for delstmt query
    } //end of if
    else {
      console.log("Skills not provided ");
      resolve({ status: true });
    }
  }); //end of promise
}; //end of function upduserskills

module.exports = router;
