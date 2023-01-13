const db = require('../routes/dbhelper');
let connection = db.getconnection();
// const User = require('../models/user');
// const { v4: uuidv4 } = require('uuid');

const getUserDetails = (user_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT b.handle AS user_handle, a.displayname AS user_name, a.firstname AS first_name, a.lastname as last_name, a.email as registered_email_id FROM users a,user_handle b WHERE a.id=b.id and a.id = ?`;
		const user = connection.query(query, [user_id], function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows[0]);
			}
		});
	})
		.then((response) => response)
		.catch((error) => {
			console.log('error from getUserDetails :>> ', error);
			return {
				error: error.message
			};
		});

const searchUser = (keyword) =>
	new Promise((resolve, reject) => {
		// Basic data from user table and profile-image-data from user_profile_image table
		const userFields = ['id AS user_id', 'displayname AS user_name'];
		const otherUserFields = ['handle AS user_handle'];
		const otherUserFields2 = ['default_profile_image_id', 'profile_id'];
		const imageFields = [
			'profimgid',
			'profimgname',
			'profimgurl',
			'profimgrotation',
			'profimgposition1',
			'profimgposition2',
			'profimgscale',
			'profimgrotationfocuspoint1',
			'profimgrotationfocuspoint2'
		];

		const fields = [
			...userFields.map((e) => `users.${e}`),
			...otherUserFields.map((e) => `user_handle.${e}`),
			...otherUserFields2.map((e) => `user_profile.${e}`),
			...imageFields.map((e) => `user_profile_image.${e}`)
		];

		const searchQuery = `SELECT ${fields} FROM users
				INNER JOIN user_handle ON users.id = user_handle.id
				INNER JOIN user_profile ON users.id = user_profile.user_id
				LEFT JOIN user_profile_image ON user_profile.default_profile_image_id = user_profile_image.profimgid
				WHERE CONCAT(firstname, ' ', lastname) OR handle LIKE CONCAT('%',?,'%') 
				ORDER BY users.displayname;`;

		connection.query(searchQuery, [keyword], function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((res) => {
			return { count: res.length, res };
		})
		.catch((err) => {
			console.log('err from searchUser() :>> ', err);
			return {
				error: err.message
			};
		});

const aux_getUserDataExtended = (user_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT users.id AS user_id, user_handle.handle AS user_handle , users.firstname, users.lastname
		FROM users 
		INNER JOIN user_handle ON users.id = user_handle.id 
		WHERE users.id = ?`;
		connection.query(query, user_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows[0]);
			}
		});
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			console.log('error from aux_getUserDataExtended :>> ', err);
			return {
				error: err.message
			};
		});

const getExtUserDataFromRequestTable = (request_id) =>
	new Promise((resolve, reject) => {
		//ADD check for valid request
		const query = `SELECT first_name, last_name, email, squad_id FROM squad_request_external WHERE request_id = ?`;
		connection.query(query, request_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				console.log('rows :>> ', rows);
				resolve(rows.length === 0 ? null : rows[0]);
			}
		});
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			console.log('error from getExtUserDataFromRequestTable :>> ', err);
			return {
				error: err.message
			};
		});

const checkHandle = (handle) =>
	new Promise((resolve, reject) => {
		const query = 'SELECT * FROM user_handle WHERE handle = ?';
		connection.query(query, handle, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			let isAvailable = response.length == 0 ? true : false;
			return { isAvailable };
		})
		.catch((error) => {
			console.log('error from checkHandle() :>> ', error);
			return {
				error: error.message
			};
		});

const findHandle = (handle) =>
	new Promise((resolve, reject) => {
		const query = `SELECT user_handle.id, user_profile.profile_id
		FROM user_handle
		INNER JOIN user_profile ON user_handle.id = user_profile.user_id
		WHERE user_handle.handle = ?`;

		connection.query(query, handle, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			let isUser = response.length == 0 ? false : true;
			return {
				isUser,
				userData: isUser
					? {
							user_id: response[0].id,
							profile_id: response[0].profile_id
					  }
					: null
			};
		})
		.catch((error) => {
			console.log('error from findHandle() :>> ', error);
			return {
				error: error.message
			};
		});

const getUserTableOnly = (user_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM users WHERE id = ?`;
		connection.query(query, user_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows[0]);
			}
		});
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			console.log('err from getUserTableOnly() :>> ', err);
			return {
				error: err.message
			};
		});

const updateDetails = (phone, id) =>
	new Promise((resolve, reject) => {
		const updateContactDetailQuery = `UPDATE vmsback.users SET phone = ? WHERE id= ?`;

		const data = [phone, id];
		connection.query(updateContactDetailQuery, data, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Data updated',
					success: true,
					id
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log(' Error in updateDetails WorkHelper ==>> ', error);

			return {
				error: error.message
			};
		});

module.exports = {
	getUserDetails,
	searchUser,
	aux_getUserDataExtended,
	getExtUserDataFromRequestTable,
	checkHandle,
	findHandle,
	getUserTableOnly,
	updateDetails
};
