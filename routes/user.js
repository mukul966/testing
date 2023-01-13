const router = require('express').Router();
const mysql = require('mysql');
const dotenv = require('dotenv');
const dbhelper = require('./dbhelper');
const middleware = require('./middleware');
var connection = dbhelper.getconnection();
var multer = require('multer');
var upload = multer({ dest: './uploads/', limits: { fileSize: 10000000 } });
const { Storage } = require('@google-cloud/storage');
const userHelper = require('../helpers/userHelper');
const profileHelper = require('../helpers/profileHelper');
const squadHelper = require('../helpers/squad/squadHelper');
const { decodeString } = require('../helpers/emailHelper');
const { addExtUserToSquadAuto } = require('../helpers/squad/memberHelper');

dotenv.config();

router.post('/login', middleware.checkToken, (req, res) => {
	const userData = middleware.getUserOrigData();
	console.log('Received user data from front end ' + JSON.stringify(userData));
	isUserExist(userData.uid).then((result) => {
		if (result.exists) {
			console.log('User already exists');
			res.json({
				success: true,
				usrexist: true,
				usrcreated: false,
				userid: userdata.uid
			});
		} else {
			//insert user in table
			createUser(userData).then((result) => {
				if (result.status) {
					console.log('User Created successfully');
					res.json({
						success: true,
						usrexist: false,
						usrcreated: true,
						userid: userData.uid
					});
				} else {
					console.log('User creation error return false');
					res.json({
						success: true,
						usrexist: false,
						usrcreated: false
					});
				}
			}); //end of create user
		} //end of else for user exists
	}); //end of isUserExists
}); //end of login hyperlink

router.post('/newLogin', middleware.checkToken, async (req, res) => {
	const userData = middleware.getUserOrigData();
	console.log('Received user data from front end ' + JSON.stringify(userData));

	const res1 = await isUserExist(userData.uid)
		.then((result) => result)
		.catch((e) => {
			console.log('error from isUserExist() :>> ', error);
			return { error: e.message };
		});
	if (res1.exists) {
		console.log('User already exists');
		return res.status(200).send({
			success: true,
			usrexist: true,
			usrcreated: false,
			userid: userData.uid
		});
	}

	const res2 = await createUser(userData)
		.then((result) => result)
		.catch((e) => {
			console.log('error from createUser() :>> ', error);
			return { error: e.message };
		});
	if (res2.hasOwnProperty('error')) {
		console.log('User creation error return false');
		return res.status(500).send({
			success: true,
			usrexist: false,
			usrcreated: false,
			error: res2.error
		});
	}

	//check request if request_status === "Accepted", then add to squad
	const res3 = await addExtUserToSquadAuto(userData);
	if (res3.hasOwnProperty('error')) {
		console.log('User add-to-squad error return false');
		return res.status(500).send({
			success: true,
			usrexist: false,
			usrcreated: true,
			addUserToSquad: res3.addUserToSquad,
			error: res3.error
		});
	}

	return res.status(201).send({
		success: true,
		usrexist: false,
		usrcreated: true,
		addUserToSquad: res3.addUserToSquad,
		userid: userData.uid
	});
});

router.get('/getuser', middleware.checkToken, (req, res) => {
	var stmt = 'select * from users where id=?';
	connection.query(stmt, [middleware.getUserOrigData().uid], function (err, rows, fields) {
		if (err) {
			console.log('DB Error in /login/isuserexists :' + err);
			return res.status(500).send(error);
		} else {
			if (rows.length > 0) {
				//console.log("Returning user "+JSON.stringify(rows));
				res.json(rows);
			} //end of if
		} //end of else
	}); //end of connection
}); //end of getuser

router.post('/checkhandle', middleware.checkToken, (req, res) => {
	const query = 'SELECT * FROM user_handle WHERE handle = ?';
	connection.query(query, [req.body.user_handle], (error, result) => {
		if (error) {
			return res.status(500).send(error);
		}
		let isAvailable = result.length == 0 ? true : false;
		res.status(200).send({
			isAvailable
		});
	});
});
//end of router for check handle

router.post('/gethandle', middleware.checkToken, (req, res) => {
	const query = 'select handle from user_handle where id=?';
	connection.query(query, [req.body.uid], function (err, rows, fields) {
		if (err) {
			console.log('DB Error in /user/gethandle :' + err);
			return res.status(500).send(error);
		} else {
			//query executed successfully
			if (rows.length > 0) {
				//data present
				var handlename = rows[0].handle;
				const nmquery = 'select firstname,lastname from users where id=?';
				connection.query(
					nmquery,
					[req.body.uid],
					function (err, rows, fields) {
						if (err) {
							console.log('DB Error in /user/gethandle :' + err);
							return res.status(500).send(error);
						} else {
							res.json({
								success: true,
								handle_name: handlename,
								name: {
									firstname: rows[0].firstname,
									lastname: rows[0].lastname
								}
							});
						} //end of else
					} //end of function
				); //end of query
			} else {
				res.json({
					success: true,
					handle: ''
				});
			}
		} //end of else
	}); //end of func
});
//end of router for gethandle

router.post('/updatehandle', middleware.checkToken, (req, res, next) => {
	//console.log("Updating handle to " + req.body.user_handle);
	try {
		const query = 'insert into user_handle (`id`,`handle`,`create_time`,`update_time`) values (?,?,?,?)';
		connection.query(
			query,
			[req.body.uid, req.body.handle_name, new Date(), new Date()],
			function (err, rows, fields) {
				if (err) {
					next(err);
					console.log('DB Error1 in /user/updhandle :' + err);
					res.status(500).send(err);
				} else {
					const nmquery = 'update  users set firstname=? , lastname=? where id= ?';
					connection.query(
						nmquery,
						[req.body.name.first_name, req.body.name.last_name, req.body.uid],
						function (err, rows, fields) {
							if (err) {
								console.log('DB Error in /user/updhandle/updname :' + err);
								res.status(500).send(err);
							} else {
								res.json({
									success: true,
									handleupd: true
								});
							} //end of else
						} //end of function err/rows
					); //end of connection query
				} //end of else
			} //end of func
		); //end of connection
	} catch (e) {
		console.log('DB Error in /user/updhandle :' + e);
		res.status(500).send(e);
		next(e);
	}
});
//end of router for update handle

//function to show user resume's
router.get('/getresumelist', middleware.checkToken, (req, res) => {
	console.log('user id is ' + middleware.getUserOrigData().uid);

	var stmt = 'select * from user_resume where user_id=?';
	connection.query(stmt, [middleware.getUserOrigData().uid], function (err, rows, fields) {
		if (err) {
			console.log('DB Error in /user/getresumelist -' + err);
		} else {
			if (rows.length > 0) {
				console.log('Returning user resume rows -' + JSON.stringify(rows));
				res.json(rows);
			} //end of if
		} //end of else
	}); //end of connection
}); //end of getuser

router.get('/isuserexists', middleware.checkToken, (req, res) => {
	const userData = middleware.getUserOrigData();
	isUserExist(userData.uid).then((result) => {
		if (result.exists) {
			console.log('User already exists');
			res.json({
				success: true,
				usrexist: true,
				uid: result.userid
			});
		} else {
			res.json({
				success: true,
				usrexist: false
			});
		} //end of lese
	}); //end of isuserexist
});

const isUserExist = (userid) => {
	return new Promise((resolve, reject) => {
		//run a query in user and figure out whether user exists or not
		var stmt = 'select id from users where  id=?';
		connection.query(stmt, [userid], function (err, rows, fields) {
			if (err) {
				console.log('DB Error in /login/isuserexists :' + err);
			} else {
				if (rows.length > 0) {
					//data already present
					resolve({ exists: true, userid: rows[0].id });
				} else {
					resolve({ exists: false });
				} //end of else
			} //end of else
		}); //end of query execution
	}); //end of promise
}; //end of function isuserecxists

const createUser = (userdata) => {
	return new Promise((resolve, reject) => {
		var stmt =
			'insert into `users` (`id`, `email`, `displayname`, `firstname`, `lastname`, `photourl`, `signinprov`) values (?,?,?,?,?,?,?)';
		connection.query(
			stmt,
			[
				userdata.uid,
				userdata.email,
				userdata.name,
				userdata.firstname,
				userdata.lastname,
				userdata.picture,
				userdata.firebase.sign_in_provider
			],
			function (err, rows, fields) {
				if (err) {
					console.log('DB Error in insert /login/createuser :' + err);
				} else {
					resolve({ status: true });
				} //end of else
			}
		); //end of insert query
	}); //end of promise
}; //end of function createUser

router.post('/updresume', upload.single('resume_file'), (req, res) => {
	//  console.log("File is " + JSON.stringify(req.file));
	console.log('Source file name is ' + req.file.originalname);
	console.log('destination file name is ' + req.file.filename);
	console.log('Form data is ' + JSON.stringify(req.body));

	let destFileName = req.file.filename;
	let filePath = req.file.path;
	//upload file to google storage
	//create a folder first then upload resume need to study what is faster
	// folder is not required as gcs store it in flat file format only
	const storage = new Storage();
	async function uploadFile() {
		bucketName = 'workxyz-001'; //001 will store resume's
		await storage.bucket(bucketName).upload(filePath, {
			destination: destFileName
		});

		console.log(`${filePath} uploaded to ${bucketName}`);
	}

	uploadFile(res)
		.then((res1) => {
			//save data in db over here
			middleware.getUserData(req).then((userout) => {
				//console.log("user out is "+ JSON.stringify(res));

				var stmt =
					'insert into user_resume (job_profile,descr,resume_name,dest_filename,create_time,update_time,user_id) values(?,?,?,?,?,?,?)';
				connection.query(
					stmt,
					[
						req.body.job_profile,
						req.body.descr,
						req.file.originalname,
						req.file.filename,
						new Date(),
						new Date(),
						userout.uid
					],
					function (err, rows, fields) {
						if (err) {
							console.log('DB Error in /updresume :' + err);
							response = { success: false, upload: true };
						} else {
							response = { success: true, upload: true };
						} //end of else
						res.json(response);
					}
				); //end of update query
			});
		})
		.catch((err) => {
			console.log('Error Upload ' + err);
			res.json({ success: false, upload: false });
		});
}); //end of router.post

const updprofile = (userdata) => {
	console.log('User first name is ' + userdata.firstname);
	return new Promise((resolve, reject) => {
		var stmt =
			'update `users` set `firstname`=?,`lastname`=?,`companyname`=?,`linkedinurl`=? ,`phone`=?,`update_time`=? where `id`=?';
		connection.query(
			stmt,
			[
				userdata.firstname,
				userdata.lastname,
				userdata.companyName,
				userdata.linkedinurl,
				userdata.phone,
				new Date(),
				userdata.id
			],
			function (err, rows, fields) {
				if (err) {
					console.log('DB Error in /login/updprofile :' + err);
				} else {
					resolve({ status: true });
				} //end of else
			}
		); //end of update query
	}); //end of promise
}; //end of function updprofile

router.post('/searchUser', async (req, res) => {
	if (!req.body.keyword) {
		return res.status(400).send({ error: `Missing field: 'keyword'` });
	}

	const { keyword } = req.body;
	const searchData = await userHelper.searchUser(keyword);

	if (searchData.hasOwnProperty('error')) {
		return res.send(searchData);
	}

	return res.status(200).send(searchData);
});

router.post('/userDataExt', async (req, res) => {
	if (!req.body.user_id) {
		return res.status(400).send({ error: `Missing field: 'user_id'` });
	}

	const { user_id } = req.body;
	const userData = await userHelper.aux_getUserDataExtended(user_id);
	const profileData = await profileHelper.aux_getProfileData(user_id);
	const squadData = await squadHelper.aux_getSquadData(user_id);

	return res.status(200).send({ ...userData, profile: profileData, squad: squadData });
});

router.post('/extUserInfo', async (req, res) => {
	if (!req.body.encodedID) {
		return res.status(400).send({ error: `Missing field: 'request_id'` });
	}

	const { encodedID } = req.body;
	const request_id = await decodeString(encodedID);
	const data = await userHelper.getExtUserDataFromRequestTable(request_id);

	if (data === undefined || data === null) {
		return res.status(200).send({ success: false, message: 'ID not valid.' });
	}

	if (data.hasOwnProperty('error')) {
		return res.send(data);
	}

	return res.status(200).send(data);
});

router.post('/checkHandle2', async (req, res) => {
	if (!req.body.handle) {
		return res.status(400).send({ error: `Missing field: 'handle'` });
	}

	const { handle } = req.body;

	const userData = await userHelper.checkHandle(handle); //checks user_handle table
	const squadData = await squadHelper.checkSquadName(handle); //ADD check for squad table. squad.squad_name

	if (userData.hasOwnProperty('error')) {
		return res.status(500).send({ error: userData });
	} else if (squadData.hasOwnProperty('error')) {
		return res.status(500).send({ error: squadData });
	}

	const isAvailable = squadData.isAvailable === true && userData.isAvailable === true ? true : false;

	return res.status(200).send({ isAvailable });
});

router.post('/findHandle', async (req, res) => {
	if (!req.body.handle) {
		return res.status(400).send({ error: `Missing field: 'handle'` });
	}

	const { handle } = req.body;

	const userData = await userHelper.findHandle(handle); //checks user_handle table
	const squadData = await squadHelper.findHandle(handle); //ADD check for squad table. squad.squad_name

	if (userData.hasOwnProperty('error')) {
		return res.status(500).send({ error: userData.error });
	} else if (squadData.hasOwnProperty('error')) {
		return res.status(500).send({ error: squadData.error });
	}

	const response = await getResponseData({ ...userData, ...squadData });

	return res.status(200).send(response);
});

router.post('/updatePhone', async (req, res) => {
	if (!req.body.id) {
		return res.status(200).send({ message: `id missing` });
	}

	const { phone, id } = req.body;
	const Updatedetail = await userHelper.updateDetails(phone, id);

	if (Updatedetail.hasOwnProperty('error')) {
		return res.status(500).send({ message: `Error in Update` });
	}

	return res.send(Updatedetail);
});

async function getResponseData(data) {
	let response = {};

	if (data.isSquad === true && data.isUser === true) {
		(response.match = true),
			(response.isSquad = true),
			(response.isUser = true),
			(response.message = 'Duplicates found');
	} else if (data.isUser) {
		response.match = true;
		response.isUser = true;
		response.isSquad = false;
		response.user_id = data.userData.user_id;
		response.profile_id = data.userData.profile_id;
	} else if (data.isSquad) {
		response.match = true;
		response.isUser = false;
		response.isSquad = true;
		response.squad_id = data.squadData.squad_id;
	} else {
		response.match = false;
		(response.isSquad = false), (response.isUser = false), (response.message = 'Data not found. Invalid handle.');
	}

	return response;
}

module.exports = router;
