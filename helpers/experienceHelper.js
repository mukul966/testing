const { v4: uuidv4 } = require('uuid');
const Experience = require('../models/experience');
const db = require("../routes/dbhelper");
let connection = db.getconnection();

const createExperience = (update) =>
	new Promise((resolve, reject) => {
		delete update.experience_id; //remove experience_id:0
		const experience = new Experience({
			experience_id: uuidv4(),
			...update
		});

		const createExperienceQuery = 'INSERT INTO user_experience SET ?';
		connection.query(createExperienceQuery, experience, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ rows, experience_id: experience.experience_id });
			}
		});
	})
		.then((res) => {
			return {
				message: 'Experience Created',
				experience_id: res.experience_id
			};
		})
		.catch((err) => {
			console.log('err from createExperience() :>> ', err);
			return {
				error: err.message
			};
		});

const updateExperience = (update) =>
	new Promise((resolve, reject) => {
		const { experience_id } = update;
		delete update.experience_id;
		delete update.user_id;

		const updateExperienceQuery =
			'UPDATE user_experience SET ' +
			Object.keys(update)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE experience_id = ?';

		const parameters = [...Object.values(update), experience_id];
		console.log('updateExperienceDetails: Running Query:', updateExperienceQuery, parameters);

		connection.query(updateExperienceQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ message: 'Experience updated' });
			}
		});
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			console.log('error from updateExperience-fn:>> ', error);
			return {
				error: err.message
			};
		});

const getOneExperience = (experience_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_experience WHERE experience_id = ?`;
		connection.query(query, experience_id, function (err, rows, fields) {
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
			console.log('err from getOneExperience() :>> ', err);
			return {
				error: err.message
			};
		});

const getAllExperience = (user_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_experience WHERE user_id = ?`;
		connection.query(query, user_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function getExperienceList(user_id) {
	try {
		const experiences = await getAllExperience(user_id);

		let no_of_items = experiences.length;
		let filled = no_of_items > 0 ? true : false;

		return {
			filled,
			no_of_items,
			experience_list: experiences
		};
	} catch (error) {
		console.log('error from getExperiences-fn :>> ', error);
		return error;
	}
}

const deleteExperience = (experience_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM user_experience WHERE experience_id = ?`;
		connection.query(deleteQuery, experience_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function removeOne(data) {
	try {
		const { experience_id } = data;
		const experiences = await deleteExperience(experience_id).then((response) => {
			return response;
		});

		return { message: 'Experience deleted.' };
	} catch (error) {
		console.log('error from dp-fn :>> ', error);
		return error;
	}
}

module.exports = {
	createExperience,
	getExperienceList,
	updateExperience,
	removeOne,
	getOneExperience
};