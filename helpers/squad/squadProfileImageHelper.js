const { v4: uuidv4 } = require('uuid');
const SquadProfileImg = require('../../models/squad/squadProfileImage');
const TempImg = require('../../models/squad/tempImage');
const db = require("../../routes/dbhelper");
let connection = db.getconnection();

const createImage = (squad_id, profimgname, profimgurl) =>
	new Promise((resolve, reject) => {
		const image = new SquadProfileImg({
			profimgid: uuidv4(),
			squad_id,
			profimgname,
			profimgurl
		});

		const createProfImageQuery = 'INSERT INTO squad_profile_image SET ?';
		connection.query(createProfImageQuery, image, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Image Created',
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
		delete updateData.squad_id;
		delete updateData.profimgname;
		delete updateData.profimgurl;

		const updateProfImageQuery =
			'UPDATE squad_profile_image SET ' +
			Object.keys(updateData)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE profimgid = ?';

		const parameters = [...Object.values(updateData), profimgid];

		// console.log('updateImageDetails: Running Query:', updateProfImageQuery, parameters);
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

const markActiveImage = (squad_id, profimgid) =>
	new Promise((resolve, reject) => {
		const updateQuery = `UPDATE squad SET default_profile_image_id = ? WHERE squad_id = ?`;
		const parameters = [profimgid, squad_id];

		console.log('updateImageDetails: Running Query:', updateQuery, parameters);
		connection.query(updateQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					success: true,
					message: 'Image set as default profile-image',
					squad_id,
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
		const query = `SELECT * FROM squad_profile_image WHERE profimgid = ?`;
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

const getAllProfImages = (squad_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM squad_profile_image WHERE squad_id = ?`;
		connection.query(query, squad_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			return { allSquadProfiledImages: response };
		})
		.catch((error) => {
			return {
				error: error.message
			};
		});

//Temp Image
const createTempImage = (user_id, imgname, imgurl) =>
	new Promise((resolve, reject) => {
		const image = new TempImg({
			temp_id: uuidv4(),	//temp image_id
			user_id,
			imgname,
			imgurl
		});

		const createProfImageQuery = 'INSERT INTO squad_temp_image SET ?';
		connection.query(createProfImageQuery, image, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Image Created',
					temp_id: image.temp_id
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from createTempImage() :>> ', error);
			return {
				error: error.message
			};
		});

const updateTempImageData = (updateData) =>
	new Promise((resolve, reject) => {
		const { temp_id } = updateData;
		delete updateData.temp_id;
		delete updateData.user_id;
		delete updateData.imgname;
		delete updateData.imgurl;

		const updateTempImageQuery =
			'UPDATE squad_temp_image SET ' +
			Object.keys(updateData)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE temp_id = ?';

		const parameters = [...Object.values(updateData), temp_id];

		// console.log('updateImageDetails: Running Query:', updateTempImageQuery, parameters);
		connection.query(updateTempImageQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Temp image data updated.',
					temp_id
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log("error from updateTempImageData():- ", error)
			return {
				error: error.message
			};
		});

const getTempImageData = (temp_id) =>
	new Promise((resolve, reject) => {
		if (temp_id === null) {
			resolve(null);
		}

		const query = `SELECT * FROM squad_temp_image WHERE temp_id = ?`;
		connection.query(query, temp_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows[0]);
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

const moveTempToSquad = (squad_id, image) =>
	new Promise((resolve, reject) => {
		const tempImage = new TempImage({
			profimgid: uuidv4(),
			squad_id,
			...image
		});

		const createProfImageQuery = 'INSERT INTO squad_profile_image SET ?';
		connection.query(createProfImageQuery, tempImage, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Image Created',
					success: true,
					imageAddToSquad: true,
					profimgid: tempImage.profimgid,
					squad_id: squad_id
				});
			}
		});
	})
		.then((response) => {
			//[TODO] add provision to delete image from cloud and db
			return response;
		})
		.catch((error) => {
			console.log('error from moveTempToSquad() :>> ', error);
			return {
				error: error.message
			};
		});

function TempImage(image) {
	this.profimgid = image.profimgid,
		this.squad_id = image.squad_id,
		this.profimgname = image.imgname,
		this.profimgurl = image.imgurl,
		this.profimgrotation = image.imgrotation,
		this.profimgposition1 = image.imgposition1,
		this.profimgposition2 = image.imgposition2,
		this.profimgscale = image.imgscale,
		this.profimgrotationfocuspoint1 = image.imgrotationfocuspoint1,
		this.profimgrotationfocuspoint2 = image.imgrotationfocuspoint2
}

module.exports = {
	createImage,
	updateImageData,
	markActiveImage,
	getProfImageData,
	getAllProfImages,
	createTempImage,
	updateTempImageData,
	getTempImageData,
	moveTempToSquad
};
