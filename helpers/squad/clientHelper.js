const { v4: uuidv4 } = require("uuid");
const Client = require("../../models/squad/client");
const ClientImage = require('../../models/squad/clientImage');
const db = require("../../routes/dbhelper");
let connection = db.getconnection();

const createClient = (update) =>
	new Promise((resolve, reject) => {
		delete update.client_id; //remove client_id:0
		const client = new Client({
			client_id: uuidv4(),
			...update
		});

		const createClientQuery = 'INSERT INTO squad_client SET ?';
		connection.query(createClientQuery, client, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Client Created',
					client_id: client.client_id
				});
			}
		});
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			console.log('err from createClient() :>> ', err);
			return {
				error: err.message
			};
		});

const updateClient = (update) =>
	new Promise((resolve, reject) => {
		const { client_id } = update;
		delete update.client_id;
		delete update.squad_id;

		const updateClientQuery =
			'UPDATE squad_client SET ' +
			Object.keys(update)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE client_id = ?';

		const parameters = [...Object.values(update), client_id];
		connection.query(updateClientQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Client Updated',
					client_id
				});
			}
		});
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			return {
				error: err.message
			};
		});

const getClients = (squad_id) =>
	new Promise((resolve, reject) => {
		const imageFields = ['imgid', 'imgurl', 'imgrotation', 'imgposition1', 'imgposition2', 'imgscale', 'imgrotationfocuspoint1', 'imgrotationfocuspoint2'];
		const clientFields = ['client_id', 'client_name', 'created_at', 'updated_at'];

		const fields = [...clientFields.map(e => `squad_client.${e}`), ...imageFields.map(e => `squad_client_image.${e}`)];

		const query =
			`SELECT 
			${fields}
			FROM squad_client 
			LEFT JOIN squad_client_image ON squad_client.imgid = squad_client_image.imgid 
			WHERE squad_id = ?`;

		connection.query(query, squad_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((clients) => {
			let no_of_items = clients.length;
			let filled = no_of_items > 0 ? true : false;

			return {
				filled,
				no_of_items,
				client_list: clients
			};
		})
		.catch((err) => {
			console.log('error from getClients-fn :>> ', error);
			return {
				error: err.message
			};
		});

const deleteClient = (client_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM squad_client WHERE client_id = ?`;
		connection.query(deleteQuery, client_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function removeOne(data) {
	try {
		const { client_id } = data;
		const clients = await deleteClient(client_id).then((response) => {
			return response;
		});

		return { message: 'Client deleted.' };
	} catch (error) {
		console.log('error from removeOne-fn :>> ', error);
		return error;
	}
}

const deleteAllClients = (squad_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM squad_client WHERE squad_id = ?`;
		connection.query(deleteQuery, squad_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			return {
				message: 'Client(s) deleted successfully'
			};
		})
		.catch((e) => {
			console.log('e from deleteAllClients() :>> ', e);
			return { error: e.message };
		});

const getOneClient = (client_id) =>
	new Promise((resolve, reject) => {
		const imageFields = ['imgid', 'imgurl', 'imgrotation', 'imgposition1', 'imgposition2', 'imgscale', 'imgrotationfocuspoint1', 'imgrotationfocuspoint2'];
		const clientFields = ['client_id', 'client_name', 'created_at', 'updated_at'];

		const fields = [...clientFields.map(e => `squad_client.${e}`), ...imageFields.map(e => `squad_client_image.${e}`)];

		const query =
			`SELECT 
			${fields}
			FROM squad_client 
			LEFT JOIN squad_client_image ON squad_client.imgid = squad_client_image.imgid 
			WHERE squad_client.client_id = ?`;

		connection.query(query, client_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			console.log('err from getOneClient() :>> ', err);
			return {
				error: err.message
			};
		});

const createImage = (client_id, imgname, imgurl) =>
	new Promise((resolve, reject) => {
		const image = new ClientImage({
			imgid: uuidv4(),
			client_id,
			imgname,
			imgurl
		});

		const query = 'INSERT INTO squad_client_image SET ?';
		connection.query(query, image, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Image Created',
					imgid: image.imgid,
					imgurl: image.imgurl
				});
			}
		});
	})
		.then((response) => {
			//add id to client - like setting it as defualt
			return response;
		})
		.catch((error) => {
			console.log('error from createImage() :>> ', error);
			return {
				error: error.message
			};
		});

const updateImageData = (updateData) =>
	new Promise((resolve, reject) => {
		const { imgid } = updateData;
		delete updateData.imgid;
		delete updateData.client_id;
		delete updateData.imgname;
		delete updateData.imgurl;

		const query =
			'UPDATE squad_client_image SET ' +
			Object.keys(updateData)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE imgid = ?';

		const parameters = [...Object.values(updateData), imgid];

		// console.log('updateImageDetails: Running Query:', updateProfImageQuery, parameters);
		connection.query(query, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Client image data updated',
					imgid
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from updateImageData:>> ', error);
			return {
				error: error.message
			};
		});

module.exports = {
	createClient,
	updateClient,
	getClients,
	removeOne,
	deleteAllClients,
	getOneClient,
	createImage,
	updateImageData
};
