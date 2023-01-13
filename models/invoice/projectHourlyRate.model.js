const pool = require('../../routes/dbhelper').getconnection();
const { v4: uuidv4 } = require('uuid');

const ProjectHR = function (projectHR) {
	(this.id = projectHR.id),
		(this.invoice_id = projectHR.invoice_id),
		(this.hours = projectHR.hours),
		(this.amount = projectHR.amount);
};

//bulk create
ProjectHR.createProjectHourlyBilling = (invoice_id, projectHR_data) =>
	new Promise((resolve, reject) => {
		//[TODO] could use a check if invoice data is getting added to the correct project type. don't be creating projectHRs for fixed fee.
		const createProjectHRQuery =
			'INSERT INTO invoice_billing_project_hourly (id, invoice_id, hours, amount) VALUES (?,?,?,?)';

		pool.query(
			createProjectHRQuery,
			[uuidv4(), invoice_id, projectHR_data.hours, projectHR_data.amount],
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
				message: 'Project hourly rate billing data created.'
			};
		})
		.catch((error) => {
			console.log('error from createProjectHR() :>> ', error);
			return { success: false, error: error.message }; //[TODO] remove error message and set this to true
		});

module.exports = ProjectHR;
