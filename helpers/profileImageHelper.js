const { v4: uuidv4 } = require('uuid');
const ProfImg = require('../models/profileImage');
const db = require("../routes/dbhelper");
let connection = db.getconnection();

const createImage = (profile_id, profimgname, profimgurl) =>
	new Promise((resolve, reject) => {
		const image = new ProfImg({
			profimgid: uuidv4(),
			profile_id,
			profimgname,
			profimgurl
		});

		const createProfImageQuery = 'INSERT INTO user_profile_image SET ?';
		connection.query(createProfImageQuery, image, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Image entry added to DB.',
					profimgid: image.profimgid
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from createImage() :>> ', error);
			return {
				error: error.message
			};
		});

const updateImageData = (updateData) =>
	new Promise((resolve, reject) => {
		const { profimgid } = updateData;
		delete updateData.profimgid;
		delete updateData.profile_id;
		delete updateData.profimgname;
		delete updateData.profimgurl;

		const updateProfImageQuery =
			'UPDATE user_profile_image SET ' +
			Object.keys(updateData)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE profimgid = ?';

		const parameters = [...Object.values(updateData), profimgid];

		console.log('updateImageDetails: Running Query:', updateProfImageQuery, parameters);
		connection.query(updateProfImageQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Profile Image data updated',
					profimgid
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			return {
				error: error.message
			};
		});

const markActiveImage = (profile_id, profimgid) =>
	new Promise((resolve, reject) => {
		const updateQuery = `UPDATE user_profile SET default_profile_image_id = ? WHERE profile_id = ?`;
		const parameters = [profimgid, profile_id];

		console.log('updateImageDetails: Running Query:', updateQuery, parameters);
		connection.query(updateQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					success: true,
					message: 'Image set as default profile-image',
					profile_id,
					profimgid
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			return {
				error: error.message
			};
		});

const getProfImageData = (profimgid) =>
	new Promise((resolve, reject) => {
		if (profimgid === null) {
			resolve(null);
		}
		const query = `SELECT * FROM user_profile_image WHERE profimgid = ?`;
		connection.query(query, profimgid, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows[0]);
			}
		});
	})
		.then((response) => {
			return { ...response };
		})
		.catch((error) => {
			return {
				error: error.message
			};
		});

const imgDataProfileId = (profimgid) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_profile_image WHERE profimgid = ?`;
		connection.query(query, profimgid, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows[0]);
			}
		});
	})
		.then((response) => {
			return { ...response };
		})
		.catch((error) => {
			return {
				error: error.message
			};
		});

const getAllProfImages = (profile_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_profile_image WHERE profile_id = ?`;
		connection.query(query, profile_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			return { allProfileImages: response };
		})
		.catch((error) => {
			return {
				error: error.message
			};
		});

module.exports = {
	createImage,
	updateImageData,
	getProfImageData,
	imgDataProfileId,
	getAllProfImages,
	markActiveImage
};