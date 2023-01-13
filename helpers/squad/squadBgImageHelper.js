const { v4: uuidv4 } = require('uuid');
const squadBgImg = require('../../models/squad/squadBgImage');
const db = require("../../routes/dbhelper");
let connection = db.getconnection();

const createImage = (squad_id, bgimgname, bgimgurl) =>
	new Promise((resolve, reject) => {
		const image = new squadBgImg({
			bgimgid: uuidv4(),
			squad_id,
			bgimgname,
			bgimgurl
		});

		const createBgImageQuery = 'INSERT INTO squad_background_image SET ?';
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
		delete updateData.squad_id;
		delete updateData.bgimgname;
		delete updateData.bgimgurl;

		const updateBgImageQuery =
			'UPDATE squad_background_image SET ' +
			Object.keys(updateData)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE bgimgid = ?';

		const parameters = [...Object.values(updateData), bgimgid];

		// console.log('updateImageDetails: Running Query:', updateBgImageQuery, parameters);
		connection.query(updateBgImageQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Image Updated',
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
		const query = `SELECT * FROM squad_background_image WHERE bgimgid = ?`;
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

const getAllBgImages = (squad_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM squad_background_image WHERE squad_id = ?`;
		connection.query(query, squad_id, function (err, rows, fields) {
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

// const markActiveImage = async (squad_id, bgImgId) => {
// 	// const setAllToInActive
// 	// const setActiveImage - bgImgId
// 	//const updatesquadBgImgId in profile-table
// };

const markActiveImage = (squad_id, bgimgid) =>
	new Promise((resolve, reject) => {
		const updateQuery = `UPDATE squad SET default_background_image_id = ? WHERE squad_id = ?`;
		const parameters = [bgimgid, squad_id];

		connection.query(updateQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					success: true,
					message: 'Image set as default profile background-image',
					squad_id,
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
	markActiveImage,
	getImageData,
	getAllBgImages
};
