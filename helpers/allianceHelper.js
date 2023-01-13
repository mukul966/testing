const { v4: uuidv4 } = require('uuid');
const Alliance = require('../models/alliance');
const db = require("../routes/dbhelper");
let connection = db.getconnection();

async function createAlliance(update) {
	try {
		delete update.alliances_and_partnership_id;
		const create = await cap(update).then((response) => {
			return response;
		});
		return create;
	} catch (error) {
		return { error };
	}
}

const cap = (update) =>
	new Promise((resolve, reject) => {
		console.log('update :>> ', update);
		const alliance = new Alliance({
			alliance_id: uuidv4(),
			...update
		});

		const createAllianceQuery = 'INSERT INTO squad_alliance SET ?';
		connection.query(createAllianceQuery, alliance, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Alliance Created',
					alliance_id: alliance.alliance_id
				});
			}
		});
	});

async function updateAlliance(update) {
	try {
		const { alliances_and_partnership_id: alliance_id } = update;
		delete update.alliances_and_partnership_id;

		const data = await updateHelper(update, alliance_id).then((response) => {
			return response;
		});
		console.log('data :>> ', data);
		return data;
	} catch (error) {
		console.log('error from updateAlliance:>> ', error);
		return error;
	}
}

const updateHelper = (update, alliance_id) =>
	new Promise((resolve, reject) => {
		const updateAllianceQuery =
			'UPDATE squad_alliance SET ' +
			Object.keys(update)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE alliance_id = ?';

		const parameters = [...Object.values(update), alliance_id];
		console.log('updateAllianceDetails: Running Query:', updateAllianceQuery, parameters);
		// connection.query(updateAllianceQuery, parameters);
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
	});

async function getAlliances(squad_id) {
	try {
		const alliances = await getAllAlliances(squad_id).then((response) => {
			return response;
		});

		let no_of_items = alliances.length;
		let filled = no_of_items > 0 ? true : false;

		return {
			filled,
			no_of_items,
			alliance_list: alliances
		};
	} catch (error) {
		console.log('error from getAlliances-fn :>> ', error);
	}
}

const getAllAlliances = (squad_id) =>
	new Promise((resolve, reject) => {
		const query = 'SELECT * FROM squad_alliance WHERE squad_id = ?';
		connection.query(query, squad_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
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

module.exports = {
	createAlliance,
	updateAlliance,
	getAlliances,
	removeOne,
	deleteAllAlliances
};