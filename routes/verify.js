const express = require('express');
const { helperFn_otp } = require('../helpers/emailHelper');
const {
	userExists,
	isEmailValid,
	otpToDb,
	matchOtp,
	getOtp,
	updateOtp,
	clearOtpUserDataIfExists
} = require('../helpers/verifyHelper');
const { sendEmail, sendMail } = require('../services/email');
const router = new express.Router();

router.post('/generateOtp', async (req, res) => {
	if (!req.body.email) {
		return res.status(400).send({ error: 'Mandatory Field: `email` missing' });
	}

	const { email } = req.body;
	if (!isEmailValid(email)) {
		return res.status(400).send({ error: 'Invalid email' });
	}

	await clearOtpUserDataIfExists(email); //Deletes all otp(if-any) wrt email. 
	const otp = await getOtp(); //generates new random otp

	const addToDb = await otpToDb(email, otp); //inserting to DB table_name(otp)
	if (addToDb.error) {
		return res.status(500).send(addToDb);
	}

	const shootMail = await sendMail({
		to: email,
		from: process.env.SENDGRID_SENDER_MAIL,
		templateId: process.env.TEMPLATE_VERIFY_SIGNUP_OTP,
		dynamicTemplateData: {
			otp
		},
	}); //email send using dynamic templates via sendgrid

	if (shootMail.error) {
		return res.status(500).send(shootMail);
	}

	res.send({ addToDB: true, mailSend: true, message: 'Success' });
});

router.post('/userExists', async (req, res) => {
	if (!req.body.email) {
		return res.status(400).send({ error: 'Mandatory Field: `email` missing' });
	}

	const { email } = req.body;
	if (!isEmailValid(email)) {
		return res.status(400).send({ error: 'Invalid email' });
	}

	const data = await userExists(email);

	if (data.error) {
		return res.status(500).send(data);
	}

	res.status(200).send(data);
});

router.post('/matchOtp', async (req, res) => {
	if (!req.body.email || !req.body.otp) {
		return res.status(400).send({ error: 'Mandatory Fields: email, otp' });
	}

	const { otp, email } = req.body;
	if (!isEmailValid(email)) {
		return res.status(400).send({ error: 'Invalid email' });
	}

	const data = await matchOtp(otp, email);
	if (data.error) {
		return res.status(500).send(data);
	}

	res.status(200).send(data);
});

router.post('/resendOtp', async (req, res) => {
	const { email } = req.body;

	const otp = await getOtp();

	const updateOtpData = await updateOtp(email, otp); //find and update the particular entry
	if (updateOtpData.error || updateOtpData.emailWithOtpExists === false) {
		return res.status(200).send(updateOtpData);
	}
	const shootMail = await sendMail({
		to: email,
		from: process.env.SENDGRID_SENDER_MAIL,
		templateId: process.env.TEMPLATE_VERIFY_SIGNUP_OTP,
		dynamicTemplateData: {
			otp
		},
	});
	if (shootMail.error) {
		return res.status(500).send(shootMail);
	}
	res.status(200).send({ updateOtpData, sendgrid: shootMail, "message": "Otp resend success." });
});

module.exports = router;