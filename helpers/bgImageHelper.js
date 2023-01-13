const { v4: uuidv4 } = require('uuid');
const BgImg = require('../models/bgImage');
const db = require("../routes/dbhelper");
let connection = db.getconnection();

const createImage = (profile_id, bgimgname, bgimgurl) =>
	new Promise((resolve, reject) => {
		const image = new BgImg({
			bgimgid: uuidv4(),
			profile_id,
			bgimgname,
			bgimgurl
		});

		const createBgImageQuery = 'INSERT INTO user_background_image SET ?';
		// console.log('createImage: Running Query:', createBgImageQuery, image);

		connection.query(createBgImageQuery, image, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Image entry created in db',
					bgimgid: image.bgimgid
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

const updateImageData = (updateData) =>
	new Promise((resolve, reject) => {
		const { bgimgid } = updateData;
		delete updateData.bgimgid;
		delete updateData.profile_id;
		delete updateData.bgimgname;
		delete updateData.bgimgurl;

		const updateBgImageQuery =
			'UPDATE user_background_image SET ' +
			Object.keys(updateData)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE bgimgid = ?';

		const parameters = [...Object.values(updateData), bgimgid];

		connection.query(updateBgImageQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Profile background image data updated',
					bgimgid
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

const getImageData = (bgimgid) =>
	new Promise((resolve, reject) => {
		if (bgimgid === null) {
			resolve(null);
		}
		const query = `SELECT * FROM user_background_image WHERE bgimgid = ?`;
		connection.query(query, bgimgid, function (err, rows, fields) {
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

const imgDataProfileId = (bgimgid) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_background_image WHERE bgimgid = ?`;
		connection.query(query, bgimgid, function (err, rows, fields) {
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

const getAllBgImages = (profile_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_background_image WHERE profile_id = ?`;
		connection.query(query, profile_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			return { allBackgroundImages: response };
		})
		.catch((error) => {
			return {
				error: error.message
			};
		});
/**
 * toggle
 * 		all images as inactive except image-id of a certain image
 * 		mark that certain image as active
 *
 * another way
 * 		/markActiveImage
 * 			updates bg-image-id field in profile.json
 * 			deletes while sending it out
 */

// const markActiveImage = async (profile_id, bgImgId) => {
// 	// const setAllToInActive
// 	// const setActiveImage - bgImgId
// 	//const updateBgImgId in profile-table
// };

const markActiveImage = (profile_id, bgimgid) =>
	new Promise((resolve, reject) => {
		const updateQuery = `UPDATE user_profile SET default_background_image_id = ? WHERE profile_id = ?`;
		const parameters = [bgimgid, profile_id];

		connection.query(updateQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					success: true,
					message: 'Image set as default profile background-image',
					profile_id,
					bgimgid
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

module.exports = {
	createImage,
	updateImageData,
	getImageData,
	imgDataProfileId,
	getAllBgImages,
	markActiveImage
};