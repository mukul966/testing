const pool = require('../../routes/dbhelper').getconnection();
const { v4: uuidv4 } = require('uuid');

const Dispute = function (dispute) {
	(this.dispute_id = dispute.dispute_id),
		(this.invoice_id = dispute.invoice_id),
		(this.reason = dispute.reason),
		(this.description = dispute.description);
};

Dispute.createInvoiceDispute = (dispute) =>
	new Promise((resolve, reject) => {
		const newDispute = new Dispute(dispute);

		const query = 'INSERT INTO invoice_dispute SET ?';

		pool.query(query, newDispute, function (err, rows, fields) {
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
				message: 'Dispute created.'
			};
		})
		.catch((error) => {
			console.log('error from createInvoiceDispute() :>> ', error);
			return { success: false, error: error.message }; //[TODO] remove error message and set this to true
		});

Dispute.setInvoiceStatusReturned = (invoice_id) =>
	new Promise((resolve, reject) => {
		const query = `
    UPDATE invoice
    SET invoice_status='Returned'
    WHERE invoice_id=?;`;

		pool.query(query, [invoice_id], function (err, rows, fields) {
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
				response
			};
		})
		.catch((error) => {
			console.log('error from setInvoicestatus() :>> ', error);
			return { success: false, error: error.message }; //[TODO] remove error message and set this to true
		});

Dispute.getInvoiceDispute = (invoice_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT *	FROM invoice_dispute WHERE invoice_id = ?`;
		pool.query(query, [invoice_id], function (err, rows, fields) {
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
				data: response[0]
			};
		})
		.catch((error) => {
			console.log('error from getInvoiceDispute() :>> ', error);
			return { success: false, error: error.message }; //[TODO] remove error message and set this to true
		});

module.exports = Dispute;
