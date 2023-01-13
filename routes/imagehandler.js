const router = require("express").Router();
const mysql = require("mysql");
const dotenv = require("dotenv");
const dbhelper = require("./dbhelper");
const middleware = require("./middleware");
const { v4: uuidv4 } = require("uuid");
var connection = dbhelper.getconnection();
var multer = require("multer");
var upload = multer({ dest: "./uploads/", limits: { fileSize: 10000000 } });
const { Storage } = require("@google-cloud/storage");

//this will accept incoming image in either raw format or image url and upload it to server
// or will store in table to retrieve later this will return imageid

router.post("/imgupload", upload.single("resume_file"), function (req, res) {
  //console.log("Source file name is " + req.file.originalname);

  console.log("Form data is " + JSON.stringify(req.body));

  const insuuid = uuidv4();
  let destFileName = insuuid;
  let filePath = "./uploads/" + req.file.originalname;

  const storage = new Storage();

  async function uploadFile() {
    bucketName = "workxyz-001"; //001 will store resume's
    await storage.bucket(bucketName).upload(filePath, {
      destination: destFileName,
    });

    console.log(`${filePath} uploaded to ${bucketName}`);
  } //end of upload file

  uploadFile(res)
    .then((res1) => {
      //save data in db over here
      var stmt =
        "insert into user_image (imageid, id ,img_stored, image_name ,purpose, image_url, create_time,update_time,comments) values(?,?,?,?,?,?,?,?,?)";
      //need to change destination file name otherwise files might get mixed up
      //or a user might upload two different files with same name
      connection.query(
        stmt,
        [
          insuuid,
          req.body.id,
          "0",
          req.file.originalname,
          "0",
          "",
          new Date(),
          new Date(),
          "",
        ],
        function (err, rows, fields) {
          if (err) {
            console.log("DB Error in /updresume :" + err);
            response = { success: false, upload: true };
          } else {
            response = { success: true, upload: true, imageid: insuuid };
          } //end of else
          res.json(response);
        }
      ); //end of update query
    })
    .catch((err) => {
      console.log("Error Upload " + err);
      res.json({ success: false, upload: false });
    });
}); //end of router post imgupload

module.exports = router;
