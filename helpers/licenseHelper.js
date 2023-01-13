const { v4: uuidv4 } = require('uuid');
const License = require('../models/license');
const db = require("../routes/dbhelper");
let connection = db.getconnection();

const createLicense = (update) =>
	new Promise((resolve, reject) => {
		delete update.license_id; //remove license_id:0
		const license = new License({
			license_id: uuidv4(),
			...update
		});

		const createLicenseQuery = 'INSERT INTO user_license SET ?';
		connection.query(createLicenseQuery, license, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ rows, license_id: license.license_id });
			}
		});
	})
		.then((res) => {
			return {
				message: 'License Created',
				license_id: res.license_id
			};
		})
		.catch((err) => {
			console.log('err from createLicense() :>> ', err);
			return {
				error: err.message
			};
		});

const getOneLicense = (license_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_license WHERE license_id = ?`;
		connection.query(query, license_id, function (err, rows, fields) {
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
			console.log('err from getOneLicense() :>> ', err);
			return {
				error: err.message
			};
		});

const updateLicense = (update) =>
	new Promise((resolve, reject) => {
		const { license_id } = update;
		delete update.license_id;
		delete update.user_id;

		const updateLicenseQuery =
			'UPDATE user_license SET ' +
			Object.keys(update)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE license_id = ?';

		const parameters = [...Object.values(update), license_id];
		console.log('updateLicenseDetails: Running Query:', updateLicenseQuery, parameters);

		connection.query(updateLicenseQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ message: 'License updated' });
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

const getAllLicense = (user_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_license WHERE user_id = ?`;
		connection.query(query, user_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function getLicenseList(user_id) {
	try {
		const licenses = await getAllLicense(user_id);
		let no_of_items = licenses.length;
		let filled = no_of_items > 0 ? true : false;

		return {
			filled,
			no_of_items,
			license_list: licenses
		};
	} catch (error) {
		console.log('error from getLicenses-fn :>> ', error);
		return error;
	}
}

const deleteLicense = (license_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM user_license WHERE license_id = ?`;
		connection.query(deleteQuery, license_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function removeOne(data) {
	try {
		const { license_id } = data;
		const licenses = await deleteLicense(license_id).then((response) => {
			return response;
		});

		return { message: 'License deleted.' };
	} catch (error) {
		console.log('error from dp-fn :>> ', error);
		return error;
	}
}

module.exports = {
	createLicense,
	getLicenseList,
	updateLicense,
	removeOne,
	getOneLicense
};