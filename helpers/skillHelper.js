const { v4: uuidv4 } = require('uuid');
const Skill = require('../models/skill');
const db = require("../routes/dbhelper");
let connection = db.getconnection();

const createSkillBulk = (skillData, user_id) =>
	new Promise((resolve, reject) => {
		const createSkillQuery = 'INSERT INTO user_skill (skill_id, user_id, question, answer) VALUES ?';
		connection.query(createSkillQuery, [skillData.map((e) => [uuidv4(), user_id, e.question, e.answer])], function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve({
					message: 'Skill(s) Created'
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			return { error: error.message };
		});

const createSkill = (update) =>
	new Promise((resolve, reject) => {
		delete update.skill_id; //remove skill_id:0
		const skill = new Skill({
			skill_id: uuidv4(),
			...update
		});

		const createSkillQuery = 'INSERT INTO user_skill SET ?';
		connection.query(createSkillQuery, skill, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ rows, skill_id: skill.skill_id });
			}
		});
	})
		.then((res) => {
			return {
				message: 'Skill Created',
				skill_id: res.skill_id
			};
		})
		.catch((err) => {
			console.log('err from createSkill() :>> ', err);
			return {
				error: err.message
			};
		});

const updateSkill = (update) =>
	new Promise((resolve, reject) => {
		const { skill_id } = update;
		delete update.skill_id;
		delete update.user_id;

		const updateSkillQuery =
			'UPDATE user_skill SET ' +
			Object.keys(update)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE skill_id = ?';

		const parameters = [...Object.values(update), skill_id];
		console.log('updateSkillDetails: Running Query:', updateSkillQuery, parameters);

		connection.query(updateSkillQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ message: 'Skill updated' });
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

const getOneSkill = (skill_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_skill WHERE skill_id = ?`;
		connection.query(query, skill_id, function (err, rows, fields) {
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
			console.log('err from getOneSkill() :>> ', err);
			return {
				error: err.message
			};
		});

const getAllSkills = (user_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_skill WHERE user_id = ?`;
		connection.query(query, user_id, function (err, rows, fields) {
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
			console.log('err from getOneSkill() :>> ', err);
			return {
				error: err.message
			};
		});

async function getSkills(user_id) {
	try {
		const skills = await getAllSkills(user_id);
		let no_of_items = skills.length;
		let filled = no_of_items > 0 ? true : false;

		return {
			filled,
			no_of_items,
			skill_list: skills
		};
	} catch (error) {
		console.log('error from getSkills-fn :>> ', error);
		return error;
	}
}

const deleteSkill = (skill_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM user_skill WHERE skill_id = ?`;
		connection.query(deleteQuery, skill_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function removeOne(data) {
	try {
		const { skill_id } = data;
		const skills = await deleteSkill(skill_id).then((response) => {
			return response;
		});

		return { message: 'Skill deleted.' };
	} catch (error) {
		console.log('error from dp-fn :>> ', error);
		return error;
	}
}

//returns user_id(s) of users which have a particular skill
const getAllUserIds = (skill_name) =>
	new Promise((resolve, reject) => {
		const query = 'SELECT user_id, name AS skill_name FROM user_skill WHERE name = ?';
		connection.query(query, skill_name, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	}).then((response) => {
		// let parameters = response.map((e) => e.user_id); //creating array of user_id(s) for parameterised queries
		return response;
	});

//returns user_id(s) and all skills of user(user_id[])
const otherSkills = (users) =>
	new Promise((resolve, reject) => {
		const query = 'SELECT user_id, name AS skill_name FROM user_skill WHERE user_id IN (' + connection.escape(users) + ')';
		connection.query(query, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	}).then((response) => {
		// let parameters = response.map((e) => e.user_id); //creating array of user_id(s) for parameterised queries
		return response;
	});




module.exports = {
	createSkill,
	getSkills,
	updateSkill,
	removeOne,
	getAllUserIds,
	otherSkills,
	getOneSkill,
};