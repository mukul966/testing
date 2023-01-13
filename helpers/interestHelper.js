const { v4: uuidv4 } = require('uuid');
const Interest = require('../models/interest');
const db = require("../routes/dbhelper");
let connection = db.getconnection();

const createInterest = (update) =>
	new Promise((resolve, reject) => {
		delete update.interest_id; //remove interest_id:0
		const interest = new Interest({
			interest_id: uuidv4(),
			...update
		});

		const createInterestQuery = 'INSERT INTO user_interest SET ?';
		connection.query(createInterestQuery, interest, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ rows, interest_id: interest.interest_id });
			}
		});
	})
		.then((res) => {
			return {
				message: 'Interest Created',
				interest_id: res.interest_id
			};
		})
		.catch((err) => {
			console.log('err from createInterest() :>> ', err);
			return {
				error: err.message
			};
		});

const updateInterest = (update) =>
	new Promise((resolve, reject) => {
		const { interest_id } = update;
		delete update.interest_id;
		delete update.user_id;

		const updateInterestQuery =
			'UPDATE user_interest SET ' +
			Object.keys(update)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE interest_id = ?';

		const parameters = [...Object.values(update), interest_id];
		console.log('updateInterestDetails: Running Query:', updateInterestQuery, parameters);

		connection.query(updateInterestQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ message: 'Interest updated' });
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

const getOneInterest = (interest_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_interest WHERE interest_id = ?`;
		connection.query(query, interest_id, function (err, rows, fields) {
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
			console.log('err from getOneInterest() :>> ', err);
			return {
				error: err.message
			};
		});

const getAllInterest = (user_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_interest WHERE user_id = ?`;
		connection.query(query, user_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function getInterestList(user_id) {
	try {
		const interests = await getAllInterest(user_id);

		let no_of_items = interests.length;
		let filled = no_of_items > 0 ? true : false;

		return {
			filled,
			no_of_items,
			interest_list: interests
		};
	} catch (error) {
		console.log('error from getInterests-fn :>> ', error);
		return error;
	}
}

const deleteInterest = (interest_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM user_interest WHERE interest_id = ?`;
		connection.query(deleteQuery, interest_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function removeOne(data) {
	try {
		const { interest_id } = data;
		const interests = await deleteInterest(interest_id).then((response) => {
			return response;
		});

		return { message: 'Interest deleted.' };
	} catch (error) {
		console.log('error from dp-fn :>> ', error);
		return error;
	}
}

module.exports = {
	createInterest,
	getInterestList,
	updateInterest,
	removeOne,
	getOneInterest
};