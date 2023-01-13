const express = require('express');
const router = new express.Router();
const paymentsController = require('../controllers/payments/paymentController');

router
	.post('/addBankDetails', paymentsController.createBankDetails)
	.post('/getBankDetails', paymentsController.getBankDetails)
	.post('/withdrawFunds', paymentsController.withdrawFunds);
// .post('/withdrawLogs', paymentsController); //show withdraw table and data for payment_withdraw_funds
// .post('/setDefaultAC') //set that particular ac as default and turn others to false
module.exports = router;
