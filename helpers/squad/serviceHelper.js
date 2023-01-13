const { v4: uuidv4 } = require("uuid");
const Service = require("../../models/squad/service");
const db = require("../../routes/dbhelper");
let connection = db.getconnection();

const createService = (update) =>
	new Promise((resolve, reject) => {
		delete update.service_id; //remove service_id:0
		const service = new Service({
			service_id: uuidv4(),
			...update
		});

		const createServiceQuery = 'INSERT INTO squad_service SET ?';
		connection.query(createServiceQuery, service, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ rows, service_id: service.service_id });
			}
		});
	})
		.then((res) => {
			return {
				message: 'Service Created',
				service_id: res.service_id
			};
		})
		.catch((err) => {
			console.log('err from createService() :>> ', err);
			return {
				error: err.message
			};
		});

const updateService = (update) =>
	new Promise((resolve, reject) => {
		const { service_id } = update;
		delete update.service_id;

		const updateServiceQuery =
			'UPDATE squad_service SET ' +
			Object.keys(update)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE service_id = ?';

		const parameters = [...Object.values(update), service_id];
		console.log('updateServiceDetails: Running Query:', updateServiceQuery, parameters);

		connection.query(updateServiceQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((res) => {
			return { message: 'Service updated' };
		})
		.catch((err) => {
			return {
				error: err.message
			};
		});

const getServices = (squad_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM squad_service WHERE squad_id = ?`;
		connection.query(query, squad_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((services) => {
			let no_of_items = services.length;
			let filled = no_of_items > 0 ? true : false;

			for (let i = 0; i < services.length; i++) {
				//hotfix
				let iterator = services[i];
				if (iterator.software !== null) {
					let softwareValue = iterator.software.split(',')
					iterator.software = softwareValue
				} else {
					iterator.software = []
				}
			}

			//ADD info field outside.
			return {
				filled,
				no_of_items,
				services: services
			};
		})
		.catch((err) => {
			console.log('error from getServices-fn :>> ', error);
			return {
				error: err.message
			};
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

const getOneService = (service_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM squad_service WHERE service_id = ?`;
		connection.query(query, service_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows[0]);
			}
		});
	})
		.then((service) => {
			//hotfix
			if (service.software !== null) {
				let softwareValue = service.software.split(',')
				service.software = softwareValue
			} else {
				service.software = []
			}
			return service
		})
		.catch((err) => {
			console.log('err from getOneService() :>> ', err);
			return {
				error: err.message
			};
		});

module.exports = {
	createService,
	updateService,
	getServices,
	removeOne,
	deleteAllServices,
	getOneService
};
