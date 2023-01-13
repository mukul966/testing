const pool = require('../../routes/dbhelper').getconnection();
const { v4: uuidv4 } = require('uuid');

const Billing = function (billing) {
	(this.invoice_billing_id = billing.invoice_billing_id),
		(this.invoice_id = billing.invoice_id),
		(this.billing_frequency = billing.billing_frequency),
		(this.billing_start_date = billing.billing_start_date),
		(this.billing_end_date = billing.billing_end_date),
		(this.payment_terms = billing.payment_terms),
		(this.date_of_issue = billing.date_of_issue),
		(this.due_date = billing.due_date);
};

Billing.createBilling = (billing) =>
	new Promise((resolve, reject) => {
		const newBilling = new Billing(billing);

		const query = `INSERT INTO invoice_billing SET ?`;
		pool.query(query, newBilling, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((res) => {
			return {
				success: true,
				message: 'Billing created.',
				billing
			};
		})
		.catch((error) => {
			console.log('error from createBilling() :>> ', error);
			return { success: false, billing: {}, error: error.message }; //[TODO] remove error message and set this to true
		});

Billing.createAddOn = (invoice_id, addOnData) =>
	new Promise((resolve, reject) => {
		//[TODO] could use a check if invoice data is getting added to the correct project type. don't be creating addOnData for fixed fee.
		const createResourceQuery =
			'INSERT INTO invoice_billing_add_on (add_on_id, invoice_id, category, name, percentage, operation, amount) VALUES ?';

		pool.query(
			createResourceQuery,
			[addOnData.map((e) => [uuidv4(), invoice_id, e.category, e.name, e.percentage, e.operation, e.amount])],
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
				message: 'addOn(s) billing data created.'
			};
		})
		.catch((error) => {
			console.log('error from createAddOn() :>> ', error);
			return { success: false, error: error.message }; //[TODO] remove error message and set this to true
		});

Billing.createGrandTotal = (invoice_id, grand_total) =>
	new Promise((resolve, reject) => {
		//[TODO] could use a check if invoice data is getting added to the correct project type. don't be creating projectHRs for fixed fee.
		const query = 'INSERT INTO invoice_grand_total (grand_total_id, invoice_id, grand_total) VALUES (?,?,?)';

		pool.query(query, [uuidv4(), invoice_id, grand_total], function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			return {
				success: true,
				message: 'Grand total billing data created.'
			};
		})
		.catch((error) => {
			console.log('error from createGrandTotal() :>> ', error);
			return { success: false, error: error.message }; //[TODO] remove error message and set this to true
		});

module.exports = Billing;
