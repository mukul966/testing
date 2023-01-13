const { v4: uuidv4 } = require('uuid');
const Member = require('../models/member');
const db = require("../routes/dbhelper");
let connection = db.getconnection();

async function createMember(update) {
	try {
		delete update.member_id;
		const member = new Member({
			member_id: uuidv4(),
			...update
		});

		const createMemberQuery = 'INSERT INTO squad_member SET ?';
		await connection.query(createMemberQuery, member);
		return {
			message: 'Member Created',
			member_id: member.member_id
		};
	} catch (error) {
		return { error };
	}
}

async function updateMember(update) {
	try {
		const { member_id } = update;
		delete update.member_id;
		delete update.squad_id;
		delete update.user_id;

		const updateMemberQuery =
			'UPDATE squad_member SET ' +
			Object.keys(update)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE member_id = ?';

		const parameters = [...Object.values(update), member_id];
		// console.log('updateMemberDetails: Running Query:', updateMemberQuery, parameters);

		connection.query(updateMemberQuery, parameters);
		return {
			message: 'Member Updated',
			member_id
		};
	} catch (error) {
		console.log('error from updateMember:>> ', error);
		return error;
	}
}

async function getMembers(squad_id) {
	try {
		const members = await getAllMembers(squad_id).then((response) => {
			return response;
		});

		let no_of_items = members.length;
		let filled = no_of_items > 0 ? true : false;

		return {
			filled,
			no_of_items,
			member_list: members
		};
	} catch (error) {
		console.log('error from getMembers-fn :>> ', error);
	}
}

const getAllMembers = (squad_id) =>
	new Promise((resolve, reject) => {
		const query = 'SELECT * FROM squad_member WHERE squad_id = ?';
		connection.query(query, squad_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

const deleteMember = (member_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM squad_member WHERE member_id = ?`;
		connection.query(deleteQuery, member_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function removeOne(data) {
	try {
		const { member_id } = data;
		const members = await deleteMember(member_id).then((response) => {
			return response;
		});

		return { message: 'Member deleted.' };
	} catch (error) {
		console.log('error from dp-fn :>> ', error);
		return error;
	}
}

//get all squad_id(s) of a user
// async function getSquadIds(user_id) {
// 	try {
// 		const ids = await getAllSquadIds(user_id).then((response) => {
// 			return response;
// 		});
// 		return ids;
// 	} catch (error) {
// 		console.log('error from getMembers-fn :>> ', error);
// 	}
// }

const getAllSquadIds = (user_id) =>
	new Promise((resolve, reject) => {
		const query = 'SELECT squad_id FROM squad_member WHERE user_id = ?';
		connection.query(query, user_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	}).then((response) => {
		let parameters = response.map((e) => e.squad_id); //creating array of squad_id(s) for parameterised queries
		return parameters;
	});

const deleteAllMembers = (squad_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM squad_member WHERE squad_id = ?`;
		connection.query(deleteQuery, squad_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			return {
				message: 'Member(s) deleted successfully'
			};
		})
		.catch((e) => {
			console.log('e from deleteAllMembers() :>> ', e);
			return { error: e.message };
		});

module.exports = {
	createMember,
	updateMember,
	getMembers,
	removeOne,
	getAllSquadIds,
	deleteAllMembers
};