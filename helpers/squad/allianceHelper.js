const { v4: uuidv4 } = require("uuid");
const Alliance = require("../../models/squad/alliance");
const db = require("../../routes/dbhelper");
let connection = db.getconnection();

const createAlliance = (update) =>
	new Promise((resolve, reject) => {
		delete update.alliance_id;
		const alliance = new Alliance({
			alliance_id: uuidv4(),
			...update
		});

		const createAllianceQuery = 'INSERT INTO squad_alliance SET ?';
		connection.query(createAllianceQuery, alliance, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(alliance);
			}
		});
	})
		.then((res) => {
			return {
				message: 'Alliance Created',
				alliance_id: res.alliance_id
			};
		})
		.catch((err) => {
			console.log('err from createAlliance() :>> ', err);
			return { error: err.message };
		});

const updateAlliance = (update, alliance_id) =>
	new Promise((resolve, reject) => {
		const { alliance_id } = update
		delete update.alliance_id;

		const updateAllianceQuery =
			'UPDATE squad_alliance SET ' +
			Object.keys(update)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE alliance_id = ?';

		const parameters = [...Object.values(update), alliance_id];
		connection.query(updateAllianceQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Alliance Updated',
					alliance_id
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((err) => {
			console.log('error from updateAlliance:>> ', error);
			return { error: err.message };
		});

const getAlliances = (squad_id) =>
	new Promise((resolve, reject) => {
		const query = 'SELECT * FROM squad_alliance WHERE squad_id = ?';
		connection.query(query, squad_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((alliances) => {
			let no_of_items = alliances.length;
			let filled = no_of_items > 0 ? true : false;

			return {
				filled,
				no_of_items,
				alliance_list: alliances
			};
		})
		.catch((err) => {
			console.log('error from getAlliances-fn :>> ', error);
			return { error: err.message };
		});

const deleteAlliance = (alliance_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM squad_alliance WHERE alliance_id = ?`;
		connection.query(deleteQuery, alliance_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function removeOne(data) {
	try {
		const { alliance_id } = data;
		const alliances = await deleteAlliance(alliance_id).then((response) => {
			return response;
		});

		return { message: 'Alliance deleted.' };
	} catch (error) {
		console.log('error from removeOne-fn :>> ', error);
		return error;
	}
}

const deleteAllAlliances = (squad_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM squad_alliance WHERE squad_id = ?`;
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
				message: 'Alliance(s) deleted successfully'
			};
		})
		.catch((e) => {
			console.log('e from deleteAllAlliances() :>> ', e);
			return { error: e.message };
		});

const getOneAlliance = (alliance_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM squad_alliance WHERE alliance_id = ?`;
		connection.query(query, alliance_id, function (err, rows, fields) {
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
			console.log('err from getOneAlliance() :>> ', err);
			return {
				error: err.message
			};
		});

module.exports = {
	createAlliance,
	updateAlliance,
	getAlliances,
	removeOne,
	deleteAllAlliances,
	getOneAlliance
};
