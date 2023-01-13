const { v4: uuidv4 } = require('uuid');
const Education = require('../models/education');
const db = require("../routes/dbhelper");
let connection = db.getconnection();

const createEducation = (update) =>
	new Promise((resolve, reject) => {
		delete update.education_id; //remove education_id:0
		const education = new Education({
			education_id: uuidv4(),
			...update
		});

		const createEducationQuery = 'INSERT INTO user_education SET ?';
		connection.query(createEducationQuery, education, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ rows, education_id: education.education_id });
			}
		});
	})
		.then((res) => {
			return {
				message: 'Education Created',
				education_id: res.education_id
			};
		})
		.catch((err) => {
			console.log('err from createEducation() :>> ', err);
			return {
				error: err.message
			};
		});

const updateEducation = (update) =>
	new Promise((resolve, reject) => {
		const { education_id } = update;
		delete update.education_id;
		delete update.user_id;

		const updateEducationQuery =
			'UPDATE user_education SET ' +
			Object.keys(update)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE education_id = ?';

		const parameters = [...Object.values(update), education_id];
		console.log('updateEducationDetails: Running Query:', updateEducationQuery, parameters);

		connection.query(updateEducationQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ message: 'Education updated' });
			}
		});
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			return {
				error: err.message
			};
		});

const getOneEducation = (education_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_education WHERE education_id = ?`;
		connection.query(query, education_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			console.log('err from getOneEducation() :>> ', err);
			return {
				error: err.message
			};
		});

const getAllEducation = (user_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_education WHERE user_id = ?`;
		connection.query(query, user_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function getEducationList(user_id) {
	try {
		const educations = await getAllEducation(user_id);

		let no_of_items = educations.length;
		let filled = no_of_items > 0 ? true : false;

		return {
			filled,
			no_of_items,
			education_list: educations
		};
	} catch (error) {
		console.log('error from getEducations-fn :>> ', error);
		return error;
	}
}

const deleteEducation = (education_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM user_education WHERE education_id = ?`;
		connection.query(deleteQuery, education_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function removeOne(data) {
	try {
		const { education_id } = data;
		const educations = await deleteEducation(education_id).then((response) => {
			return response;
		});

		return { message: 'Education deleted.' };
	} catch (error) {
		console.log('error from dp-fn :>> ', error);
		return error;
	}
}

module.exports = {
	createEducation,
	getEducationList,
	updateEducation,
	removeOne,
	getOneEducation
};