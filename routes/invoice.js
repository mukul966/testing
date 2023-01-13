const express = require('express');
const router = new express.Router();
const invoiceController = require('../controllers/invoice/invoiceController');
//BillingController
//ResourceController

router
	.post('/createInvoice', invoiceController.createInvoice)
	.post('/getClients', invoiceController.getClientsList)
	.post('/getProjects', invoiceController.getProjectList)
	.post('/getBillingTerms', invoiceController.getProjectBillingTerms)
	.post('/updateInvoice', invoiceController.updateInvoice)
	.post('/getInvoiceAux', invoiceController.getInvoiceAux)
	.post('/createInvoiceS2', invoiceController.createInvoiceScreenTwoData)
	.post('/getGeneratedInvoices', invoiceController.getGeneratedInvoices)
	.post('/getReceivedInvoices', invoiceController.getReceivedInvoices)
	.post('/getInvoice', invoiceController.getInvoice);

module.exports = router;
