const { v4: uuidv4 } = require('uuid');
const Visa = require('../models/visa');
const db = require("../routes/dbhelper");
let connection = db.getconnection();

const createVisa = (update) =>
	new Promise((resolve, reject) => {
		delete update.visa_id; //remove visa_id:0
		const visa = new Visa({
			visa_id: uuidv4(),
			...update
		});

		const createVisaQuery = 'INSERT INTO user_visa SET ?';
		connection.query(createVisaQuery, visa, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ rows, visa_id: visa.visa_id });
			}
		});
	})
		.then((res) => {
			return {
				message: 'Visa Created',
				visa_id: res.visa_id
			};
		})
		.catch((err) => {
			console.log('err from createVisa() :>> ', err);
			return {
				error: err.message
			};
		});

const updateVisa = (update) =>
	new Promise((resolve, reject) => {
		const { visa_id } = update;
		delete update.visa_id;
		delete update.user_id;

		const updateVisaQuery =
			'UPDATE user_visa SET ' +
			Object.keys(update)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE visa_id = ?';

		const parameters = [...Object.values(update), visa_id];
		console.log('updateVisaDetails: Running Query:', updateVisaQuery, parameters);

		connection.query(updateVisaQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ message: 'Visa updated' });
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

const getOneVisa = (visa_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_visa WHERE visa_id = ?`;
		connection.query(query, visa_id, function (err, rows, fields) {
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
			console.log('err from getOneVisa() :>> ', err);
			return {
				error: err.message
			};
		});

const getAllVisas = (user_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_visa WHERE user_id = ?`;
		connection.query(query, user_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function getVisaList(user_id) {
	try {
		const visas = await getAllVisas(user_id);

		let no_of_items = visas.length;
		let filled = no_of_items > 0 ? true : false;

		return {
			filled,
			no_of_items,
			visa_list: visas
		};
	} catch (error) {
		console.log('error from getVisas-fn :>> ', error);
		return error;
	}
}

const deleteVisa = (visa_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM user_visa WHERE visa_id = ?`;
		connection.query(deleteQuery, visa_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function removeOne(data) {
	try {
		const { visa_id } = data;
		const visas = await deleteVisa(visa_id).then((response) => {
			return response;
		});

		return { message: 'Visa deleted.' };
	} catch (error) {
		console.log('error from dp-fn :>> ', error);
		return error;
	}
}

module.exports = {
	createVisa,
	getVisaList,
	updateVisa,
	removeOne,
	getOneVisa
};