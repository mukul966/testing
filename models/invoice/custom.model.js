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

Milestone.getMilestoneBillingData = () => new Promise((resolve, reject));

module.exports = Milestone;
