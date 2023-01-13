const { v4: uuidv4 } = require('uuid');
const db = require('../../routes/dbhelper');
var pool = db.getconnection();

const createResourceBulk = (resourceData, work_id) =>
	new Promise((resolve, reject) => {
		const createResourceQuery =
			'INSERT INTO work_resource (resource_id, work_id, role_name, currency, amount) VALUES ?';

		pool.query(
			createResourceQuery,
			[resourceData.map((e) => [uuidv4(), work_id, e.role_name, e.currency, e.amount])],
			function (err, rows, fields) {
				if (err) {
					reject({ error: err.message });
				} else {
					resolve({
						message: 'Resource(s) Created'
					});
				}
			}
		);
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from createResourceBulk() :>> ', error);
			return { error: error.message };
		});

const createResources = (resources, application_id) =>
	new Promise((resolve, reject) => {
		const query = `INSERT INTO work_application_resource (resource_id, application_id, user_id, role_name, currency, amount, counter) VALUES ?`;
		pool.query(
			query,
			[resources.map((e) => [uuidv4(), application_id, e.user_id, e.role_name, e.currency, e.amount, 'false'])],
			function (err, rows, fields) {
				if (err) {
					reject(err);
				} else {
					resolve({
						success_create_resource: true,
						message: 'Resources created.'
					});
				}
			}
		);
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from createResources() :>> ', error);
			return { error: error.message };
		});

const createdByMe_viewWorkResourceData = (work_id) =>
	new Promise((resolve, reject) => {
		const getAllResourcesQuery = 'SELECT role_name, currency, amount FROM work_resource WHERE work_id = ?';
		pool.query(getAllResourcesQuery, work_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from createdByMe_viewWorkResourceData() :>> ', error);
			return { error: error.message };
		});

const getAllResources = (work_id) =>
	new Promise((resolve, reject) => {
		const getAllResourcesQuery = 'SELECT * FROM work_resource WHERE work_id = ?';
		pool.query(getAllResourcesQuery, work_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from getAllResources() :>> ', error);
			return { error: error.message };
		});

const getAllResourcesFromArray = (workIds) =>
	new Promise((resolve, reject) => {
		const getAllResourcesQuery =
			`SELECT * FROM work_resource WHERE work_id IN (` + connection.escape(workIds) + `)`;
		pool.query(getAllResourcesQuery, [workIds], function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from getAllResourcesFromArray() :>> ', error);
			return { error: error.message };
		});
const deleteResource = (resourceData) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM work_resource WHERE resource_id = ?`;
		pool.query(deleteQuery, resourceData.resource_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					success: true,
					message: 'Resource deleted'
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from deleteResource():>> ', error);
			return { error: error.message };
		});

const updateResource = (resourceData) =>
	new Promise((resolve, reject) => {
		const { resource_id } = resourceData;
		delete resourceData.resource_id;

		const updateResourceQuery =
			'UPDATE work_resource SET ' +
			Object.keys(resourceData)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE resource_id = ?';

		const parameters = [...Object.values(resourceData), resource_id];

		pool.query(updateResourceQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Resource updated.',
					resource_id
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from updateResource():>> ', error);
			return {
				error: error.message
			};
		});

const getAllResourcesInWorkApplication = (application_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT 
		work_application_resource.resource_id,
		work_application_resource.user_id,
		work_application_resource.role_name,
		work_application_resource.currency,
		work_application_resource.amount,
		work_application_resource.counter,
		work_application_counter.counter_id,
		work_application_counter.new_rate,
		work_application_counter.new_currency,
		work_application_counter.resource_change,
		work_application_counter.rate_change,
		user_profile.default_profile_image_id,
		user_profile_image.profimgid,
		user_profile_image.profimgname,
		user_profile_image.profimgurl,
		user_profile_image.profimgrotation,
		user_profile_image.profimgposition1,
		user_profile_image.profimgposition2,
		user_profile_image.profimgscale,
		user_profile_image.profimgrotationfocuspoint1,
		user_profile_image.profimgrotationfocuspoint2

	FROM
		work_application_resource
			LEFT JOIN user_profile ON user_profile.user_id = work_application_resource.user_id
			LEFT JOIN user_profile_image ON user_profile_image.profimgid = user_profile.default_profile_image_id
			LEFT JOIN work_application_counter ON work_application_resource.resource_id = work_application_counter.resource_id
	WHERE
		work_application_resource.application_id = ?`;

		pool.query(query, application_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			response.forEach((e) => {
				e.counter_data = {
					counter_id: e.counter_id,
					new_rate: e.new_rate,
					new_currency: e.new_currency,
					resource_change: e.resource_change,
					rate_change: e.rate_change
				};

				e.default_profile_image = {
					profimgid: e.profimgid,
					profimgname: e.profimgname,
					profimgurl: e.profimgurl,
					profimgrotation: e.profimgrotation,
					profimgposition1: e.profimgposition1,
					profimgposition2: e.profimgposition2,
					profimgscale: e.profimgscale,
					profimgrotationfocuspoint1: e.profimgrotationfocuspoint1,
					profimgrotationfocuspoint2: e.profimgrotationfocuspoint2
				};

				[
					'default_profile_image_id',
					'profimgid',
					'profimgname',
					'profimgurl',
					'profimgrotation',
					'profimgposition1',
					'profimgposition2',
					'profimgscale',
					'profimgrotationfocuspoint1',
					'profimgrotationfocuspoint2',
					'counter_id',
					'new_rate',
					'new_currency',
					'resource_change',
					'rate_change'
				].forEach((y) => delete e[y]);
			});

			return response;
		})
		.catch((error) => {
			console.log('error from getAllResourcesInWorkApplication() :>> ', error);
			return { error: error.message };
		});

const getAllResourcesInWorkApplicationForInvoice = (work_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT 
		work_application.application_id,
		work_application_resource.resource_id,
		work_application_resource.user_id,
		work_application_resource.role_name,
		work_application_resource.currency,
		work_application_resource.amount AS hourly_rate,
		CONCAT(users.firstname, ' ', users.lastname) AS username
	FROM
		work_application
			LEFT JOIN work_application_resource ON work_application_resource.application_id = work_application.application_id
			LEFT JOIN users ON users.id = work_application_resource.user_id
	WHERE
		work_application.application_status = 'Accepted' AND work_application.work_id = ?`;

		pool.query(query, work_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			return {
				success: true,
				data: (response.length === 0) ? [] : response
			}
		})
		.catch((error) => {
			console.log('error from getAllResourcesInWorkApplication() :>> ', error);
			return { error: error.message };
		});



const deleteResourceByWork_id = (work_id) =>
      new Promise((resolve, reject) => {
      const deleteQuery = `DELETE FROM work_resource WHERE work_id = ?`;
      pool.query(deleteQuery, work_id, function (err, rows, fields) {
      if (err) {
            reject(err);
      } else {
            resolve({
                  success: true,
                  message: "Resource deleted",
            });
      }
      });
      })
      .then((response) => {
            return response;
      })
      .catch((error) => {
            console.log("error from deleteResourceByWork_id():>> ", error);
            return { error: error.message };
      });


module.exports = {
	createResourceBulk,
	createResources,
	createdByMe_viewWorkResourceData,
	getAllResourcesInWorkApplication, //check all functions down below
	getAllResources,
	deleteResource,
	updateResource,
	getAllResourcesFromArray,
	getAllResourcesInWorkApplicationForInvoice,
      deleteResourceByWork_id
};
