const Bank = require('../../models/payments/bank.model');
// const Payments = require('../../models/payments/payments.model');

const createBankDetails = async (req, res) => {
	if (!req.body.user_id) {
		return res.status(400).send({ message: `Mandatory field(s): 'user_id'` });
	}

	//local bank details
	const bankDetailsIND = {
		user_id: req.body.user_id,
		default: req.body.default ? req.body.default : false,
		account_number: req.body.account_number,
		account_type: req.body.account_type,
		pan_number: req.body.pan_number,
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		name_on_account: req.body.name_on_account,
		country: req.body.billing_address.country,
		address_line_1: req.body.billing_address.address_line_1,
		address_line_2: req.body.billing_address.address_line_2,
		city: req.body.billing_address.city,
		pincode: req.body.billing_address.pincode,
		phone_number: req.body.phone_number
	};

	//if default is set to true, turn other entries to default: false
	const data = await Bank.createIndianBankDetails(bankDetailsIND);

	if (data.success === false) {
		return res.status(500).send(data);
	}

	res.status(201).send(data);
};

const getBankDetails = async (req, res) => {
	if (!req.body.user_id) {
		return res.status(400).send({ message: `Mandatory field(s): 'user_id` });
	}

	const data = await Bank.getBankDetails(req.body.user_id); //[TODO] in accordance with design. need to mask bank a/c number.
	if (data.success === false) {
		return res.status(500).send(data);
	}

	res.send(data);
};

const withdrawFunds = async (req, res) => {
	if (!req.body.user_id) {
		return res.status(400).send({ message: `Mandatory field(s): 'user_id` });
	}

	const funds = {
		user_id: req.body.user_id,
		amount: req.body.amount
	};

	const data = await Payments.withdrawFunds(funds);
	if (data.success === false) {
		return res.status(500).send(data);
	}

	res.send(data);
};

module.exports = {
	createBankDetails,
	getBankDetails,
	withdrawFunds
};
