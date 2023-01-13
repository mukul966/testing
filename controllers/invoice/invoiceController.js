const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');
const Invoice = require('../../models/invoice/invoice.model');
const Billing = require('../../models/invoice/billing.model');
const Resource = require('../../models/invoice/resource.model');
const Milestone = require('../../models/invoice/milestone.model');
const ProjectHourlyBilling = require('../../models/invoice/projectHourlyRate.model');
const CustomBilling = require('../../models/invoice/custom.model');
const Dispute = require('../../models/invoice/dispute.model');

const createInvoice = async (req, res) => {
	if (!req.body.vendor_squad_id) {
		return res.status(400).send({ message: `Mandatory field(s): 'vendor_squad_id` });
	}

	const invoice = {
		invoice_id: uuidv4(),
		invoice_number: uuidv4(),
		invoice_status: 'drafts', //will be converted to 'completed' only after checks
		vendor_squad_id: req.body.vendor_squad_id
	};

	const createInvoice = await Invoice.createInvoice(invoice);
	if (createInvoice.success === false) {
		return res.status(500).send(createInvoice);
	}

	res.send(createInvoice);
};

const getClientsList = async (req, res) => {
	if (!req.body.vendor_squad_id) {
		return res.status(400).send({ message: `Mandatory field(s): 'vendor_squad_id` });
	}

	const clients = await Invoice.getClientsList(req.body.vendor_squad_id);
	if (clients.success === false) {
		return res.status(500).send(clients);
	}

	res.send(clients);
};

const getProjectList = async (req, res) => {
	if (!req.body.vendor_squad_id || !req.body.client_squad_id) {
		return res.status(400).send({
			message: `Mandatory field(s): 'vendor_squad_id', 'client_squad_id' `
		});
	}

	const { vendor_squad_id, client_squad_id } = req.body;

	const projects = await Invoice.getProjectList(vendor_squad_id, client_squad_id);
	if (projects.success === false) {
		return res.status(500).send(projects);
	}

	res.send(projects);
};

const getProjectBillingTerms = async (req, res) => {
	if (!req.body.work_id) {
		return res.status(400).send({
			message: `Mandatory field(s): 'work_id'`
		});
	}

	const { work_id } = req.body;

	const billing = await Invoice.getProjectBillingTerms(work_id);

	res.send(billing);
};

const getGeneratedInvoices = async (req, res) => {
	if (!req.body.vendor_squad_id) {
		return res.status(400).send({
			message: `Mandatory field(s): 'vendor_sqaud_id'`
		});
	}

	const { vendor_squad_id } = req.body;

	const generatedInvoices = await Invoice.getGeneratedInvoices(vendor_squad_id);

	res.send(generatedInvoices);
};

const getReceivedInvoices = async (req, res) => {
	if (!req.body.client_squad_id) {
		return res.status(400).send({
			message: `Mandatory field(s): 'client_squad_id'`
		});
	}

	const { client_squad_id } = req.body;

	const receivedInvoices = await Invoice.getReceivedInvoices(client_squad_id);

	res.send(receivedInvoices);
};

const updateInvoice = async (req, res) => {
	if (!req.body.invoice) {
		return res.status(400).send({
			message: `Incorrect request body.`
		});
	}

	if (!req.body.invoice.invoice_id) {
		return res.status(400).send({
			message: `Mandatory field(s): 'invoice_id'`
		});
	}

	const { invoice_id, vendor_squad_id } = req.body.invoice;
	const invoice_data = req.body.invoice;

	['invoice_id', 'vendor_squad_id', 'invoice_number'].forEach((x) => delete req.body.invoice[x]); //removing keys which should not be updated at any point.
	let response_data = {};

	//create billing data if it exists. if not, then update invoice data
	if (invoice_data.hasOwnProperty('billing') && invoice_data.billing.invoice_billing_id === 0) {
		delete invoice_data.billing.invoice_billing_id;

		if (invoice_data.start_date) {
			let formatted_start_date = dayjs(invoice_data.billing_start_date).format('YYYY-MM-DD');
			invoice_data.start_date = formatted_start_date;
		}

		if (invoice_data.end_date) {
			let formatted_end_date = dayjs(invoice_data.billing_start_date).format('YYYY-MM-DD');
			invoice_data.end_date = formatted_end_date;
		}

		if (invoice_data.date_of_issue) {
			let formatted_date_of_issue = dayjs(invoice_data.billing_date_of_issue).format('YYYY-MM-DD');
			invoice_data.date_of_issue = formatted_date_of_issue;
		}

		if (invoice_data.due_date) {
			let formatted_due_date = dayjs(invoice_data.billing_start_date).format('YYYY-MM-DD');
			invoice_data.due_date = formatted_due_date;
		}

		const newBilling = {
			invoice_billing_id: uuidv4(),
			invoice_id,
			...invoice_data.billing
		};

		const createBillingResponse = await Billing.createBilling(newBilling);
		response_data.billing = createBillingResponse;

		//delete billing from invoice_data. update values in invoice data.
	}

	delete invoice_data.billing;

	if (Object.keys(invoice_data).length >= 1) {
		const updateInvoiceResponse = await Invoice.updateInvoice(invoice_data, invoice_id);
		response_data.invoice = updateInvoiceResponse;
	}

	res.send(response_data);
};

const updateInvoice2 = async (req, res) => {
	const table = Object.keys(req.body)[0];
	let details, message;

	if (table === 'resource') {
		details = await Resource.updateResourceBilling({
			...req.body[`${table}`]
		});
	} else if (table === 'custom_billing') {
		//To-update: item, desc, rate, unit, amount
		details = await CustomBilling.updateCustomBilling({
			...req.body[`${table}`]
		});
	} else if (table === 'fixedFee') {
		//To-update: billable_amount
		details = await Milestone.updateFixedFee({
			...req.body[`${table}`]
		});
	} else if (table === 'project_hourly_rate') {
		// To-update: hours, amount
		details = await ProjectHourlyBilling.updateProjectHourlyRate({
			...req.body[`${table}`]
		});
	} else if (table === 'grand_total') {
		//To-update: total, total_tax, grand_total
		details = await Billing.updateGrandTotal({
			...req.body[`${table}`]
		});
	} else if (table === 'billing_add_ons') {
		//To-update: category, name, percentage, amount
		details = await Billing.updateBillingAddOn({
			...req.body[`${table}`]
		});
	}

	return res.status(200).send(details);
};

const getInvoiceAux = async (req, res) => {
	if (!req.body.invoice_id) {
		return res.status(400).send({
			message: `Mandatory field(s): 'invoice_id'`
		});
	}

	const { invoice_id } = req.body;

	const billing = await Invoice.getInvoiceSecondScreenData(invoice_id);

	res.send(billing);
};

const getInvoice = async (req, res) => {
	if (!req.body.invoice_id) {
		return res.status(400).send({
			message: `Mandatory field(s): 'invoice_id'`
		});
	}

	const { invoice_id } = req.body;
	let data = {};
	const basicInvoiceData = await Invoice.getInvoiceDataPartOne(invoice_id);

	//check basicInvoiceData for errors. If present, return from here
	if (basicInvoiceData.success === false) {
		return res.send({
			invoice: {},
			...basicInvoiceData
		});
	}

	if (basicInvoiceData.invoice_data.invoice_type === 'Custom Invoice') {
		data.custom_billing = await CustomBilling.getCustomBillingData(invoice_id);
	} else if (basicInvoiceData.invoice_data.project_type === 'Resource hourly rate') {
		data.resources = await Resource.getResourceBillingData(invoice_id); //add role_name
	} else if (basicInvoiceData.invoice_data.project_type === 'Fixed fee') {
		data.fixed_fee = await Milestone.getMilestoneBillingData(invoice_id);
	} //case: 'project hourly rate' data is handled in getInvoiceDataPartOne()

	if (basicInvoiceData.invoice_data.invoice_status === 'Returned') {
		data.dispute = await Dispute.getInvoiceDispute(invoice_id);
	}

	data.billing_add_ons = await Billing.getAddOnsData(invoice_id);
	data.grand_total = await Billing.getGrandTotalData(invoice_id);

	res.send({ invoice: { ...basicInvoiceData, ...data } });
};

const createInvoiceScreenTwoData = async (req, res) => {
	if (!req.body.invoice.invoice_id) {
		return res.status(400).send({
			message: `Mandatory field(s): 'invoice_id'`
		});
	}

	let invoice = req.body.invoice;
	let responseBody = {};

	const { invoice_id, resources, milestones, project_hourly_rate, custom_billing, billing_add_ons, grand_total } =
		invoice;

	if (invoice.hasOwnProperty('custom_billing')) {
		responseBody.custom_billing = await CustomBilling.createCustomBilling(invoice_id, custom_billing);
	} else if (invoice.hasOwnProperty('resources')) {
		responseBody.resource = await Resource.createResource(invoice_id, resources);
	} else if (invoice.hasOwnProperty('milestones')) {
		responseBody.milestones = await Milestone.createMilestone(invoice_id, milestones);
	} else if (invoice.hasOwnProperty('project_hourly_rate')) {
		responseBody.project_hourly_rate = await ProjectHourlyBilling.createProjectHourlyBilling(
			invoice_id,
			project_hourly_rate
		);
	}

	if (invoice.hasOwnProperty('billing_add_ons')) {
		responseBody.add_ons = await Billing.createAddOn(invoice_id, billing_add_ons);
	}

	if (invoice.hasOwnProperty('grand_total')) {
		responseBody.grand_total = await Billing.createGrandTotal(invoice_id, grand_total);
	}

	res.status(201).send(responseBody);
};

const createDispute = async (req, res) => {
	if (!req.body.invoice_id) {
		return res.status(400).send({
			message: `Mandatory field(s): 'invoice_id `
		});
	}

	const dispute = {
		dispute_id: uuidv4(),
		invoice_id: req.body.invoice_id,
		reason: req.body.reason,
		description: req.body.description
	};

	const createInvoiceDispute = await Dispute.createInvoiceDispute(dispute);
	if (createInvoiceDispute.success === false) {
		return res.status(500).send(createInvoiceDispute);
	}

	await Dispute.setInvoiceStatusReturned(dispute.invoice_id);

	res.send(createInvoiceDispute);
};

const getDispute = async (req, res) => {
	if (!req.body.dispute_id) {
		return res.status(400).send({
			message: `Mandatory field(s): 'dispute_id `
		});
	}

	const { dispute_id } = req.body;

	const getInvoiceDisputeData = await Dispute.getInvoiceDispute(dispute_id);

	res.send(getInvoiceDisputeData);
};

module.exports = {
	createInvoice,
	getClientsList,
	getProjectList,
	getProjectBillingTerms,
	updateInvoice,
	updateInvoice2,
	getInvoiceAux,
	getGeneratedInvoices,
	getReceivedInvoices,
	createInvoiceScreenTwoData,
	getInvoice,
	createDispute,
	getDispute
};
