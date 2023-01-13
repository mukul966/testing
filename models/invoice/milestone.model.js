const pool = require('../../routes/dbhelper').getconnection();
const { v4: uuidv4 } = require('uuid');

const Milestone = function (milestone) {
	(this.id = milestone.id),
		(this.invoice_id = milestone.invoice_id),
		(this.milestone_id = milestone.milestone_id),
		(this.amount = milestone.amount);
};

//bulk create
Milestone.createMilestone = (invoice_id, milestones) =>
	new Promise((resolve, reject) => {
		//[TODO] could use a check if invoice data is getting added to the correct project type. don't be creating milestones for fixed fee.
		const createMilestoneQuery =
			'INSERT INTO invoice_billing_fixed_fee (id, invoice_id, milestone_id, billable_amount) VALUES ?';

		pool.query(
			createMilestoneQuery,
			[milestones.map((e) => [uuidv4(), invoice_id, e.milestone_id, e.billable_amount])],
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
				message: 'Milestone(s) billing data created.'
			};
		})
		.catch((error) => {
			console.log('error from createMilestone() :>> ', error);
			return { success: false, error: error.message }; //[TODO] remove error message and set this to true
		});

Milestone.getMilestoneBillingData = (invoice_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT 
		invoice_billing_fixed_fee.id,
		invoice_billing_fixed_fee.invoice_id,
        invoice_billing_fixed_fee.milestone_id,
		work_fixedFee_milestone.name,
		work_fixedFee_milestone.amount,
        invoice_billing_fixed_fee.billable_amount
	FROM
		invoice_billing_fixed_fee
			LEFT JOIN work_fixedFee_milestone ON work_fixedFee_milestone.milestone_id = invoice_billing_fixed_fee.milestone_id
	WHERE
		invoice_billing_fixed_fee.invoice_id = ?`;

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
			console.log('error from getMilestoneBillingData() :>> ', error);
			return { success: false, error: error.message }; //[TODO] remove error message and set this to true
		});

module.exports = Milestone;
