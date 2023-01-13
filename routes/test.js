const express = require('express');
const testHelper = require('../helpers/testHelper');
const router = new express.Router();

router.post('/createData', async (req, res) => {
	if (!req.body.amount || !req.body.email_id || !req.body.success || !req.body.failed || !req.body.pending) {
		return res
			.status(500)
			.send({ message: `Mandatory field(s): 'amount or email_id  or success or failed or pending missing'.` });
	}

	console.log(req.body);

	const create_data = await testHelper.create(req.body);
	if (create_data.hasOwnProperty('error') || create_data === null || create_data === undefined) {
		return res.status(500).send(create_data);
	}

	res.send(create_data);
});

router.post('/getData', async (req, res) => {
	if (!req.body.id) {
		return res.status(500).send({ message: `Mandatory field(s): 'id''.` });
	}
	const { id } = req.body;
	const get_data = await testHelper.get(id);
	if (get_data.hasOwnProperty('error') || get_data === null || get_data === undefined) {
		return res.status(500).send(create_data);
	}

	res.send(get_data);
});

router.post('/createPayment', async (req, res) => {
	if (!req.body.client_squad_id) {
		return res
			.status(500)
			.send({ message: `Mandatory field(s): 'client_squad_id' missing.` });
	}

	const create_data = await testHelper.makePayment(req.body);

	if (create_data.hasOwnProperty('error') || create_data === null || create_data === undefined) {
		return res.status(500).send(create_data);
	}

	res.send(create_data);
});


router.post('/getPayment', async (req, res) => {
	if (!req.body.client_squad_id) {
		return res.status(500).send({ message: `Mandatory field(s): 'client_squad_id'` });
	}

	const { client_squad_id } = req.body;

	const get_data = await testHelper.getPayment(client_squad_id);
	if (get_data.hasOwnProperty('error') || get_data === null || get_data === undefined) {
		return res.status(500).send(create_data);
	}

	res.send(get_data);
});
module.exports = router;
