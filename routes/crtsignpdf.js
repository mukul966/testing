const router = require('express').Router();
const mysql = require('mysql');
const dotenv = require('dotenv');
const dbhelper = require('./dbhelper');
const middleware = require('./middleware');
var connection = dbhelper.getconnection();
const request = require('request');
const pdf = require("pdf-creator-node");
const fs = require("fs");
var dayjs = require('dayjs');
const { Console } = require('console');
const { resolve } = require('path');

dotenv.config();

const adobeurloptions = {
    client_id: process.env.adobeclientid,
    client_secret: process.env.adobeclientsecret,
    grant_type: 'refresh_token',
    refresh_token: process.env.refresh_token,
};


router.post('/signandpost', middleware.checkToken, (req, res) => {

    console.log("Incoming data is " + JSON.stringify(req.body));
    //var html = fs.readFileSync("routes/assets/formtemp.html", "utf8");
    //var genfilename = req.body.empid1 + "" + dayjs().format('DDMMYYHHmmss') + ".pdf";

});



const sendAdobeSign = (genfilename, reqbody) => {
        return new Promise((resolve, reject) => {
            try {
                console.log("Starting sendadobesign");
               
                let urlid = "https://api.in1.adobesign.com/oauth/refresh"
                var r = request.post({
                    uri: urlid,
                    headers: {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    qs: adobeurloptions,
                }, (error, response, body) => {
                    //recievied token now we will generate transient document
                    console.log("Refresh token generated - " + body);
                    genTransDocID(body,genfilename,reqbody);

                }); //end of request post
            } catch (e) {
                reject({ status: "notdone" });
                console.log("Problem with sendAdobeSign " + e);
            }
        }); //end of promise
    } //end of function fetchpsoft


const genTransDocID = async(inbody, genfilename, reqbody) => {
        return new Promise((resolve, reject) => {
            let myfile = fs.createReadStream("./outputpdf/" + genfilename);
            //console.log("File is " + myfile);
            try {
                let formdata = {
                    "File": fs.createReadStream("./outputpdf/"+genfilename),
                    "Mime-Type": "application/pdf",
                    "File-Name": ""+genfilename,
                }; //end of formdata

                let urlid = 'https://api.in1.adobesign.com/api/rest/v6/transientDocuments';
                // console.log("New access token is " + JSON.parse(inbody).access_token);
                request.post({
                        uri: urlid,
                        headers: {
                            "content-type": "multipart/form-data",
                            "Authorization": "Bearer " + JSON.parse(inbody).access_token,
                            "x-api-user": "email:vivek.sharma@1218inc.com"
                        },
                        formData: formdata
                    },
                    async(error, response, transbody) => {
                        //recievied token now we will generate transient document
                        //console.log("parsed value genTransDocID " + JSON.parse(transbody).transientDocumentId);
                        //call function to enter data in database
                        //await insertinDB(reqbody,transbody).then((res)=>{
                           // console.log("Res after insert is "+res);
                           sendAgreement(inbody,reqbody,transbody,genfilename);
                        //});
                    }); //end of request posts

            } catch (e) {
                reject({ status: "notdone" });
                console.log("Problem with sendAdobeSign " + e);
            }
        }); //end of promise

    } //end of genTransDocID

const insertinDB=async(reqbody,transidbody)=>{
    return new Promise((resolve, reject) => {
        try {
            console.log("Trans body is "+ transidbody.id);
            var inpdata=[reqbody.empid1,reqbody.empname1,reqbody.empemailid1,reqbody.approverid1,reqbody.approvername1,reqbody.approveremail1,reqbody.itemdescr1,reqbody.itemvalue1,transidbody.id,'0',dayjs().format('DD-MM-YYYY HH:mm:ss'),dayjs().format('DD-MM-YYYY HH:mm:ss')];
            var stmt = "insert into formdata (emplid,emplname,emplemailid,apprvid,apprvname,apprvemailid,itemdescr,itemvalue,transid,completests,create_time,update_time) values (?,?,?,?,?,?,?,?,?,?,STR_TO_DATE(?,'%d-%m-%Y %H:%i:%s'),STR_TO_DATE(?,'%d-%m-%Y %H:%i:%s'))";
            //console.log("Stmt is " + stmt);
            connection.query(stmt, inpdata, function(err, rows, fields) {
                if (err) {
                    console.log("DB Error insertinDB " + err);
                } else {
                    resolve({ status: true });
                } //end of else
            });
        } catch (e) {
            reject(e);
            console.log("Problem with insertinDB " + e);
        } //end of catch
    }); //end of promise
}//end of insertindb

const sendAgreement = (inbody, reqbody, transbody,genfilename) => {
        return new Promise((resolve, reject) => {
            let myfile = fs.createReadStream("./outputpdf/"+genfilename);
            //console.log("File is " + myfile);
            try {
                let formdata = {
                    "fileInfos": [{
                        "transientDocumentId": JSON.parse(transbody).transientDocumentId,
                    }],
                    "name": "Procurement Form Approval",
                    "participantSetsInfo": [{
                        "memberInfos": [{
                            "email": reqbody.approveremail1,
                        }],
                        "order": 1,
                        "role": "APPROVER"
                    }],
                    "signatureType": "ESIGN",
                    "state": "IN_PROCESS"
                }; //end of formdata

                let urlid = 'https://api.in1.adobesign.com/api/rest/v6/agreements';
                // console.log("New access token is " + JSON.parse(inbody).access_token);
                request.post({
                        uri: urlid,
                        headers: {
                            "content-type": "application/json",
                            "Authorization": "Bearer " + JSON.parse(inbody).access_token,
                        },
                        json: formdata,

                    },
                    async(error, response, agreementbody) => {
                        //recievied token now we will generate transient document
                        await insertinDB(reqbody,agreementbody).then((res)=>{
                         // console.log("parsed value sendAgreement " + JSON.stringify(body));
                        resolve({ status: "done" })
                        });
                    }); //end of request posts
            } catch (e) {
                reject({ status: "notdone" });
                console.log("Problem with sendAgreement " + e);
            }
        }); //end of promise

    } //end of sendAgreement

    router.get('/getdocstatus', middleware.checkToken,(req, res) => {
        (async()=>{
        var getsqldata=await getSqlFormData();
        //console.log("Getsql datais -"+getsqldata);
       res.send(getsqldata);  
        })();
    }); //end of router getprojteam


getSqlFormData=async()=>{
    return new Promise((resolve, reject) => {
        try {
    const userData = middleware.getUserData();
    var stmt;
    stmt = "SELECT * FROM formdata where emplemailid=? and completests='0' order by create_time desc LIMIT 20";
    connection.query(stmt, [userData.email], function(err, rows, fields) {
        if (err) {
            console.log("DB Error " + err);
        } else {
            var obj1 = { success: true, message: 'result fetched' };
            var object3 = Object.assign(obj1, rows);
             //console.log("Result fetched is "+JSON.stringify(rows));
            //res.json(object3);
            let count=0;
        (async()=>{
         var prcsFormret=await nProcessForms(rows);
          //console.log("Process return is "+JSON.stringify(prcsFormret));
         resolve(prcsFormret);
          }//async end
        )();
        
    }//end of else
}); //end of query execution
} catch (e) {
    reject({ status: "notdone" });
    console.log("Problem with getformsts " + e);
}//end of catch
});//end of promise
}//end of getSqlFormData

nProcessForms=async(rows)=>{

    let count=0;
    let outdata=[];
    const urlid="https://api.in1.adobesign.com/api/rest/v6/agreements/";
     for(var formno  in rows ){
        //console.log("Formdata "+formno + " formid-"+rows[formno].id);
        var ngetToken=await getToken();
        //console.log("Token is "+ngetToken);
        let tokenrec= JSON.parse(ngetToken).access_token;
        let urlstr= urlid+ rows[formno].transid;
        let getFormsts=await getformsts(formno,urlstr,tokenrec);
        let content={
            formid:rows[formno].id,
            apprvname: rows[formno].apprvname,
            apprvemailid: rows[formno].apprvemailid,
            itemdescr: rows[formno].itemdescr,
            itemvalue:rows[formno].itemvalue,
            requestdttm: rows[formno].create_time,
            formsts: JSON.parse(getFormsts).status,
        };
        //console.log("got content for "+ rows[formno].id + " -"+JSON.parse(getFormsts).status);
        outdata.push(content);
     }//end of for
     //console.log("Returning "+ outdata);
     return({content:outdata});
}//end of nprocessofrms

getformsts=async(formno,urlstr,tokenrec)=>{
    return new Promise((resolve, reject) => {
        try {
       request.get({
        uri: urlstr,
        headers: {
            "Authorization": "Bearer " + tokenrec,
        },
    },
    async(error, response, docstatusres) => {
       // console.log("Docstatus is "+docstatusres);
    resolve(docstatusres);
    });
} catch (e) {
    reject({ status: "notdone" });
    console.log("Problem with getformsts " + e);
}//end of catch
});//end of promise
}//end of getformsts


getToken=async()=>{
    //console.log("for getformsts-"+transid);
    return new Promise((resolve, reject) => {
        try {
            let urlid = "https://api.in1.adobesign.com/oauth/refresh"
                var r = request.post({
                    uri: urlid,
                    headers: {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    qs: adobeurloptions,
                }, (error, response, body) => {
                    //recievied token now we will generate transient document
                     //console.log("Refresh token generated - " + body);
                     resolve(body);
                }); //end of request post

        } catch (e) {
            reject({ status: "notdone" });
            console.log("Problem with getToken " + e);
        }//end of catch
    });//end of promise
}//end of func getToken

module.exports = router;