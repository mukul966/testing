const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY_V2);

const sendEmail = (recipientEmail, otp) =>
	sgMail
		.send({
			to: recipientEmail,
			from: process.env.SG_SENDER_MAIL,
			subject: 'Email Verification',
			text: `Workwall Registration OTP is ${otp}`
		})
		.then((response) => {
			console.log('Status code from sendgrid', response[0].statusCode);
			return { message: 'SG Success' };
		})
		.catch((error) => {
			console.log('error from sendEmail() :>> ', error);
			return { error: error.message };
		});

const sendEmailExtRequest = (messages, request_id) =>
	sgMail
		.send(messages)
		.then((response) => {
			console.log(`Workwall login page:- https://localhost:6000/api/squad/testRoute/${request_id}`);
			return { email_status: 'SendGrid Success' };
		})
		.catch((error) => {
			console.log('error from sendEmail() :>> ', error);
			return { error: error.message };
		});

//(sendMail)This is the only piece of code that should be here. Other functions would be added if they offer any additional functionalities, any manipulations are reserved for emailHelper functions
const sendMail = (messages) =>
	sgMail
		.send(messages)
		.then((response) => {
			return { email_send_status: true, message: 'SendGrid Success' };
		})
		.catch((error) => {
			console.log('error from sendMail() :>> ', error);
			return { email_send_status: false, message: error.message };
		});

/**
 * 1. Bulk email provision - done
 * 2. Embed data for request_id  - 1.encoding 2.decoding - done
 * 3. Templates - done
 * 4. Re-work email service - [TODO]
 */

module.exports = { sendEmail, sendEmailExtRequest, sendMail };
