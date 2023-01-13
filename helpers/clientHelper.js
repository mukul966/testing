const { v4: uuidv4 } = require('uuid');
const Client = require('../models/client');
const db = require("../routes/dbhelper");
let connection = db.getconnection();

async function createClient(update) {
	try {
		delete update.client_id;
		const client = new Client({
			client_id: uuidv4(),
			...update
		});

		const createClientQuery = 'INSERT INTO squad_client SET ?';
		await connection.query(createClientQuery, client);
		return {
			message: 'Client Created',
			client_id: client.client_id
		};
	} catch (error) {
		return { error };
	}
}

async function updateClient(update) {
	try {
		const { client_id } = update;
		delete update.client_id;
		delete update.squad_id;

		const updateClientQuery =
			'UPDATE squad_client SET ' +
			Object.keys(update)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE client_id = ?';

		const parameters = [...Object.values(update), client_id];
		// console.log('updateClientDetails: Running Query:', updateClientQuery, parameters);

		connection.query(updateClientQuery, parameters);
		return {
			message: 'Client Updated',
			client_id
		};
	} catch (error) {
		console.log('error from updateClient:>> ', error);
		return error;
	}
}

async function getClients(squad_id) {
	try {
		const clients = await getAllClients(squad_id).then((response) => {
			return response;
		});

		let no_of_items = clients.length;
		let filled = no_of_items > 0 ? true : false;

		return {
			filled,
			no_of_items,
			client_list: clients
		};
	} catch (error) {
		console.log('error from getClients-fn :>> ', error);
	}
}

const getAllClients = (squad_id) =>
	new Promise((resolve, reject) => {
		const query = 'SELECT * FROM squad_client WHERE squad_id = ?';
		connection.query(query, squad_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

const deleteClient = (client_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM squad_client WHERE client_id = ?`;
		connection.query(deleteQuery, client_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function removeOne(data) {
	try {
		const { client_id } = data;
		const clients = await deleteClient(client_id).then((response) => {
			return response;
		});

		return { message: 'Client deleted.' };
	} catch (error) {
		console.log('error from removeOne-fn :>> ', error);
		return error;
	}
}

const deleteAllClients = (squad_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM squad_client WHERE squad_id = ?`;
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
				message: 'Client(s) deleted successfully'
			};
		})
		.catch((e) => {
			console.log('e from deleteAllClients() :>> ', e);
			return { error: e.message };
		});

module.exports = {
	createClient,
	updateClient,
	getClients,
	removeOne,
	deleteAllClients
};