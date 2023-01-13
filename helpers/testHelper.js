const { v4: uuidv4 } = require('uuid');
const db = require('../routes/dbhelper');
var pool = db.getconnection();

const create = (create_data) =>
	new Promise((resolve, reject) => {
		const table_id = uuidv4();

		const query =
			'INSERT INTO table1(table_id, id,amount,email_id,createdTime,success,failed,pending) VALUES(?,?,?,?,?,?,?,?)';

		pool.query(
			query,
			[
				table_id,
				create_data.id,
				create_data.amount,
				create_data.email_id,
				create_data.createdTime,
				create_data.success,
				create_data.failed,
				create_data.pending
			],
			function (err, rows, result) {
				if (err) {
					reject({ error: err.message });
				} else {
					resolve({
						message: 'Work Created',
						table_id: table_id,
						id: create_data.id
					});
				}
			}
		);
	})
		.then((rows) => {
			return rows;
		})
		.catch((error) => {
			return error;
		});

const get = (id) =>
	new Promise((resolve, reject) => {
		const query = 'SELECT * FROM table1 where id=? ORDER BY updated_at DESC';
		pool.query(query, id, function (err, rows, result) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows[0]);
			}
		});
	})
		.then((rows) => {
			return rows;
		})
		.catch((error) => {
			return error;
		});

const makePayment = (create_data) =>
	new Promise((resolve, reject) => {
		const payment_id = uuidv4();

		const query =
			'INSERT INTO table2(payment_id, client_squad_id, vendor_squad_id, amount, currency) VALUES(?,?,?,?,?)';

		pool.query(
			query,
			[
				payment_id,
				create_data.client_squad_id,
				create_data.vendor_squad_id,
				create_data.amount,
				create_data.currency
			],
			function (err, rows, result) {
				if (err) {
					reject({ error: err.message });
				} else {
					resolve({
						message: 'Payment Created',
						payment_id
					});
				}
			}
		);
	})
		.then((rows) => {
			return rows;
		})
		.catch((error) => {
			console.log('error from makePayment() :>> ', error);
			return { error: error.message };
		});

const getPayment = (client_squad_id) =>
	new Promise((resolve, reject) => {
		const query =
			'SELECT vendor_squad_id, client_squad_id, amount, currency FROM table2 where client_squad_id=? ORDER BY updated_at DESC';
		pool.query(query, client_squad_id, function (err, rows, result) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then((rows) => {
			return rows;
		})
		.catch((error) => {
			console.log('error from getPayment() :>> ', error);
			return { error: error.message };
		});

module.exports = {
	create,
	get,
	makePayment,
	getPayment
};
