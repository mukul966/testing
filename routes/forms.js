const router = require('express').Router();
const mysql = require('mysql');
const dotenv = require('dotenv');
const dbhelper = require('./dbhelper');
const middleware = require('./middleware');
var connection = dbhelper.getconnection();
const request = require('request');

dotenv.config();

router.get('/getpsoftdata', middleware.checkToken, (req, res) => {
    const userData = middleware.getUserData();
    console.log("Fetch user data for user " + userData.email);
    //create a function to fetch data from peoplesoft now
    fetchpsoft(userData).then(result => {
        res.json(result);
    });
});
//end of router post for getpsoftdata

const fetchpsoft = (userdata) => {
        return new Promise((resolve, reject) => {
            try {

                let urlid = "http://pshcm38-lnxft-1.app.psftcm12.oraclevcn.com:8000/PSIGW/RESTListeningConnector/PSFT_HR/CIRT_Z_DOCUPOC_CI2_G_GET.V1//" + userdata.email;
                urlid = encodeURI(urlid);
                //console.log("Url id is " + urlid);
                request.get({
                    uri: urlid,
                    headers: {
                        "content-type": "application/json",
                        "Authorization": "Basic MTIxOF9TVVBQT1JUOjEyMThfU1VQUE9SVA==",
                    }
                }, (error, response, body) => {
                    //let jsonparse = JSON.parse(body);
                    console.log("parsed value is " + body + " ,error-" + error);
                    resolve({ status: "done", psoftdata: body });
                }); //end of request post
            } catch (e) {
                reject({ status: "notdone" });
                console.log("Problem with formjs.fetchpsoft " + e);
            }
        }); //end of promise
    } //end of function fetchpsoft

module.exports = router;