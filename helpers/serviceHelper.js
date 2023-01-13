const { v4: uuidv4 } = require('uuid');
const Service = require('../models/service');
const db = require("../routes/dbhelper");
let connection = db.getconnection();

async function createService(update) {
	try {
		delete update.service_id;
		const service = new Service({
			service_id: uuidv4(),
			...update
		});

		const createServiceQuery = 'INSERT INTO squad_service SET ?';
		// console.log('createService: Running Query:',createServiceQuery,service);
		const details = await connection.query(createServiceQuery, service);
		return {
			message: 'Service Created',
			service_id: service.service_id
		};
	} catch (error) {
		console.log('error from serviceHelper:>> ', error);
		return { error };
	}
}

async function updateService(update) {
	try {
		const { service_id } = update;
		delete update.service_id;

		const updateServiceQuery =
			'UPDATE squad_service SET ' +
			Object.keys(update)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE service_id = ?';

		const parameters = [...Object.values(update), service_id];
		// console.log('updateServiceDetails: Running Query:', updateServiceQuery, parameters);

		const details = await connection.query(updateServiceQuery, parameters);
		return {
			message: 'Service Updated',
			service_id
		};
	} catch (error) {
		console.log('error from updateService:>> ', error);
		return { error };
	}
}

async function getServices(squad_id) {
	try {
		const services = await getAllServices(squad_id).then((response) => {
			return response;
		});

		let no_of_items = services.length;
		let filled = no_of_items > 0 ? true : false;

		//ADD info field outside.
		return {
			filled,
			no_of_items,
			services: services
		};
	} catch (error) {
		console.log('error from getServices-fn :>> ', error);
		return error;
	}
}

const getAllServices = (squad_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM squad_service WHERE squad_id = ?`;
		connection.query(query, squad_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

const deleteService = (service_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM squad_service WHERE service_id = ?`;
		connection.query(deleteQuery, service_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function removeOne(data) {
	try {
		const { service_id } = data;
		const services = await deleteService(service_id).then((response) => {
			return response;
		});

		return { message: 'Service deleted.' };
	} catch (error) {
		console.log('error from removeOne-fn :>> ', error);
		return error;
	}
}

const deleteAllServices = (squad_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM squad_service WHERE squad_id = ?`;
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
				message: 'Service(s) deleted successfully'
			};
		})
		.catch((e) => {
			console.log('e from deleteAllServices() :>> ', e);
			return { error: e.message };
		});

module.exports = {
	createService,
	updateService,
	getServices,
	removeOne,
	deleteAllServices
};