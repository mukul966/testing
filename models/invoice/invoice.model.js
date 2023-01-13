const pool = require('../../routes/dbhelper').getconnection();
const { getWorkListBySquad, getProjectsWithClient, getMilestones } = require('../../helpers/work/workHelper');
const { getSquadData } = require('../../helpers/work/applicationHelper');
const { getAllResourcesInWorkApplicationForInvoice } = require('../../helpers/work/resourceHelper');
const { payment_terms_map, project_type_response_map } = require('../../maps/create-work');

const Invoice = function (invoice) {
	(this.invoice_id = invoice.invoice_id),
		(this.invoice_number = invoice.invoice_number),
		(this.invoice_status = invoice.invoice_status),
		(this.vendor_squad_id = invoice.vendor_squad_id);
};

Invoice.createInvoice = (invoice) =>
	new Promise((resolve, reject) => {
		const newInvoice = new Invoice(invoice);

		const createInvoiceQuery = `INSERT INTO invoice SET ?`;
		pool.query(createInvoiceQuery, newInvoice, function (err, rows, fields) {
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
				message: 'Invoice Created',
				invoice
			};
		})
		.catch((error) => {
			console.log('error from createInvoice() :>> ', error);
			return { success: false, invoice: {}, error: error.message }; //[TODO] remove error message and set this to true
		});

Invoice.getClientsList = async (vendor_squad_id) => {
	try {
		const listOfWorkByVendor = await getWorkListBySquad(vendor_squad_id);
		if (listOfWorkByVendor.length === 0 || listOfWorkByVendor.hasOwnProperty('error')) {
			return { success: false, clients: [], message: 'No work found related to squad_id.' };
		}

		const squadData = await getSquadData(listOfWorkByVendor);

		return {
			success: true,
			count: squadData.length,
			clients: squadData.length === 0 || squadData.hasOwnProperty('error') ? [] : squadData
		};
	} catch (error) {
		console.log('error from getClientsList() :>> ', error);
		return { success: false, clients: [], error: error.message }; //[TODO] remove error message and set this to true
	}
};

Invoice.getProjectList = async (vendor_squad_id, client_squad_id) => {
	try {
		const listOfWorkByVendor = await getWorkListBySquad(vendor_squad_id);
		if (listOfWorkByVendor.length === 0 || listOfWorkByVendor.hasOwnProperty('error')) {
			return { success: false, projects: [], message: 'No work found related to squad_id.' };
		}

		const projects = await getProjectsWithClient(listOfWorkByVendor, client_squad_id); //filter work_id and join name of client-and-vendor

		return {
			success: true,
			count: projects.length,
			projects: projects.length === 0 || projects.hasOwnProperty('error') ? [] : projects
		};
	} catch (error) {
		console.log('error from getProjectList() :>> ', error);
		return { success: false, projects: [], error: error.message }; //[TODO] remove error message and set this to true
	}
};

Invoice.getProjectBillingTerms = (work_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT 
        work.billing_currency,
        work.project_payment_frequency,
        work.payment_terms,
        work.start_date as work_start_date,
        work.end_date as work_end_date
    FROM
        work
    WHERE
        work_id = ?`;

		pool.query(query, work_id, function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			if (response.length === 0 || response === undefined || response === null) {
				return {
					success: true,
					data: {},
					message: 'No records found'
				};
			}

			response.map((e) => {
				let billing = {
					billing_currency: e.billing_currency,
					billing_frequency: e.project_payment_frequency,
					payment_terms: payment_terms_map[e.payment_terms]
				};

				e.billing = billing;

				['billing_currency', 'billing_frequency', 'payment_terms', 'project_payment_frequency'].forEach(
					(x) => delete e[x]
				);
			});

			return {
				success: true,
				data: response[0]
			};
		})
		.catch((error) => {
			console.log('error from getProjectBillingTerms() :>> ', error);
			return { success: false, data: {}, error: error.message }; //[TODO] remove error message and set this to true
		});

Invoice.updateInvoice = (invoice_data, invoice_id) =>
	new Promise((resolve, reject) => {
		delete invoice_data.invoice_id; //remove invoice_id from update routes.

		const query =
			'UPDATE invoice SET ' +
			Object.keys(invoice_data)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE invoice_id = ?';

		const parameters = [...Object.values(invoice_data), invoice_id];
		pool.query(query, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					success: true,
					message: 'Invoice data updated.',
					invoice_id
				});
			}
		});
	})
		.then((response) => response)
		.catch((error) => {
			console.log('error from updateInvoice() :>> ', error);
			return { success: false, data: {}, error: error.message }; //[TODO] remove error message and set this to true
		});

Invoice.getAuxInvoiceData = (invoice_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT 
        invoice.invoice_id,
        invoice.work_id,
        invoice.invoice_type,
        invoice.invoice_status,
        work.work_title,
        work.project_type,
        work.projectHR_currency,
		work.projectHR_amount,
		work.fixedHR_currency,
		work.fixedHR_amount,
        invoice.invoice_number,
        invoice.client_squad_id,
        squad.squad_name,
        invoice_billing.billing_frequency,
        invoice_billing.billing_start_date,
        invoice_billing.billing_end_date,
        invoice_billing.due_date,
        invoice_billing.date_of_issue
    FROM
        invoice
            INNER JOIN work ON work.work_id = invoice.work_id
            INNER JOIN squad ON squad.squad_id = invoice.client_squad_id
            LEFT JOIN invoice_billing ON invoice_billing.invoice_id = invoice.invoice_id
    WHERE
        invoice.invoice_id = ?`;

		pool.query(query, invoice_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			if (response.length === 0) {
				return {
					success: true,
					message: 'Data does not exist.',
					data: {}
				};
			}

			let project_hourly_rate =
				response[0].project_type === 1
					? {
							currency: response[0].projectHR_currency,
							amount: response[0].projectHR_amount
					  }
					: null;

			let fixed_fee =
				response[0].project_type === 2
					? {
							currency: response[0].fixedHR_currency,
							amount: response[0].fixedHR_amount
					  }
					: null;

			response[0].project_hourly_rate = project_hourly_rate;
			response[0].fixed_fee = fixed_fee;

			['projectHR_currency', 'projectHR_amount', 'fixedHR_currency', 'fixedHR_amount'].forEach(
				(e) => delete response[0][e]
			);

			let project_type_aux = project_type_response_map[response[0].project_type];
			response[0].project_type = project_type_aux;

			return {
				success: true,
				data: response.length === 0 ? {} : response[0]
			};
		})
		.catch((error) => {
			console.log('error from getAuxData1() :>> ', error);
			return { success: false, invoice_data: {}, error: error.message }; //[TODO] remove error message and set this to true
		});

Invoice.getInvoiceSecondScreenData = async (invoice_id) => {
	const invoice_data = await Invoice.getAuxInvoiceData(invoice_id);
	let resources = null,
		milestones = null;

	if (invoice_data.data.project_type === 'Resource hourly rate') {
		resources = await getAllResourcesInWorkApplicationForInvoice(invoice_data.data.work_id); //for resource hourly rate
	}

	if (invoice_data.data.project_type === 'Fixed fee') {
		milestones = await getMilestones(invoice_data.data.work_id); //for fixed fee get all the milestone
	}

	return {
		invoice_data,
		resources: invoice_data.data.project_type === 'Resource hourly rate' ? resources : null,
		milestones: invoice_data.data.project_type === 'Fixed fee' ? milestones : null
	};
};

Invoice.getInvoiceDataPartOne = (invoice_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT 
		invoice.invoice_id,
		invoice.invoice_number,
		invoice.invoice_type,
		invoice.vendor_squad_id,
		invoice.client_squad_id,
		sv.squad_name AS vendor_squad_name,
		sv.email_id AS vendor_email,
		cs.squad_name AS client_squad_name,
		cs.email_id AS client_email,
		invoice_billing.billing_start_date,
		invoice_billing.billing_end_date,
		invoice_billing.date_of_issue,
		invoice_billing.due_date,
		work.project_type,
		work.projectHR_currency,
		work.projectHR_amount
	FROM
		invoice
			INNER JOIN work ON work.work_id = invoice.work_id
			LEFT JOIN squad sv ON sv.squad_id = invoice.vendor_squad_id
			LEFT JOIN squad cs ON cs.squad_id = invoice.client_squad_id
			LEFT JOIN invoice_billing ON invoice_billing.invoice_id = invoice.invoice_id
	WHERE
		invoice.invoice_id = ?`;

		pool.query(query, invoice_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			let project_hourly_rate =
				response[0].project_type === 1
					? {
							currency: response[0].projectHR_currency,
							amount: response[0].projectHR_amount
					  }
					: null;

			response[0].project_hourly_rate = project_hourly_rate;
			['projectHR_currency', 'projectHR_amount'].forEach((e) => delete response[0][e]);

			let project_type_aux = project_type_response_map[response[0].project_type];
			response[0].project_type = project_type_aux;

			return {
				success: true,
				data: response.length === 0 ? {} : response[0]
			};
		})
		.catch((error) => {
			console.log('error from getInvoiceDataPartOne() :>> ', error);
			return { success: false, invoice_data: {}, error: error.message }; //[TODO] remove error message and set this to true
		});

//changed to left-joins at the moment for development purposes.
Invoice.getGeneratedInvoices = (vendor_squad_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT 
            invoice.invoice_id,
            invoice.invoice_number,
            invoice.invoice_status,
            invoice.created_at AS date,
            invoice_grand_total.grand_total,
            squad.squad_id,
            squad.squad_name,
            work.work_title,
            work.work_id
        FROM
            invoice
                LEFT JOIN
            squad ON invoice.vendor_squad_id = squad.squad_id
                LEFT JOIN
            invoice_grand_total ON invoice.invoice_id = invoice_grand_total.invoice_id
                LEFT JOIN
            work ON work.work_id = invoice.work_id
        WHERE
            invoice.vendor_squad_id = ?`;

		pool.query(query, [vendor_squad_id], function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			if (response.length === 0 || response === undefined || response === null) {
				return {
					success: true,
					data: [],
					message: 'No invoices found'
				};
			}

			let d = response[0].date;
			let text = d.toISOString().slice(0, 10).replace('T', ' ');

			response[0].date = text;

			return {
				success: true,
				count: response.length,
				data: response
			};
		})
		.catch((error) => {
			console.log('error from getGeneratedInvoices() :>> ', error);
			return { success: false, data: [], error: error.message };
		});

Invoice.getReceivedInvoices = (client_squad_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT 
          invoice.invoice_id,
          invoice.invoice_number,
          invoice.invoice_status,
          invoice.created_at AS date,
          invoice_grand_total.grand_total,
          squad.squad_id,
          squad.squad_name,
          work.work_title,
          work.work_id
      FROM
          invoice
              LEFT JOIN
          squad ON invoice.client_squad_id = squad.squad_id
              LEFT JOIN
          invoice_grand_total ON invoice.invoice_id = invoice_grand_total.invoice_id
              LEFT JOIN
          work ON work.work_id = invoice.work_id
      WHERE
          invoice.client_squad_id = ?`;

		pool.query(query, [client_squad_id], function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			if (response.length === 0 || response === undefined || response === null) {
				return {
					success: true,
					data: [],
					message: 'No invoices found'
				};
			}

			let d = response[0].date;
			let text = d.toISOString().slice(0, 10).replace('T', ' ');

			response[0].date = text;

			return {
				success: true,
				count: response.length,
				data: response
			};
		})
		.catch((error) => {
			console.log('error from getReceivedInvoices() :>> ', error);
			return { success: false, data: [], error: error.message };
		});

module.exports = Invoice;
