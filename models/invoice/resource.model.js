const pool = require('../../routes/dbhelper').getconnection();
const { v4: uuidv4 } = require('uuid');

const Resource = function (resource) {
	(this.id = resource.id),
		(this.invoice_id = resource.invoice_id),
		(this.resource_id = resource.resource_id),
		(this.amount = resource.amount);
};

//bulk create
Resource.createResource = (invoice_id, resources) =>
	new Promise((resolve, reject) => {
		//[TODO] could use a check if invoice data is getting added to the correct project type. don't be creating resources for fixed fee.
		const createResourceQuery =
			'INSERT INTO invoice_billing_resource_hourly (id, invoice_id, resource_id, hours, amount) VALUES ?';

		pool.query(
			createResourceQuery,
			[resources.map((e) => [uuidv4(), invoice_id, e.resource_id, e.hours, e.amount])],
			function (err, rows, fields) {
				if (err) {
					reject({ error: err.message });
				} else {
					resolve(rows);
				}
			}
		);
	})
		.then((response) => {
			return {
				success: true,
				message: 'Resource(s) billing data created.'
			};
		})
		.catch((error) => {
			console.log('error from createResource() :>> ', error);
			return { success: false, error: error.message }; //[TODO] remove error message and set this to true
		});

Resource.getResourceBillingData = (invoice_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT 
		invoice_billing_resource_hourly.id,
		invoice_billing_resource_hourly.invoice_id,
        invoice_billing_resource_hourly.resource_id,
		work_application_resource.user_id,
		CONCAT(users.firstname, ' ',users.lastname) AS displayname,
		work_application_resource.amount AS hourly_rate,
        invoice_billing_resource_hourly.hours,
        invoice_billing_resource_hourly.amount
	FROM
		invoice_billing_resource_hourly
			LEFT JOIN work_application_resource ON work_application_resource.resource_id = invoice_billing_resource_hourly.resource_id
			LEFT JOIN users ON users.id = work_application_resource.user_id
	WHERE
		invoice_billing_resource_hourly.invoice_id = ?`;

		pool.query(query, invoice_id, function (err, rows, fields) {
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
				count: response.length,
				resources: response.length === 0 || response.hasOwnProperty('error') ? [] : response
			};
		})
		.catch((error) => {
			console.log('error from getResourceBillingData() :>> ', error);
			return { success: false, error: error.message, resources: [] }; //[TODO] remove error message and set this to true
		});

module.exports = Resource;
