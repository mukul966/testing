const { v4: uuidv4 } = require('uuid');
const Language = require('../models/language');
const db = require("../routes/dbhelper");
let connection = db.getconnection();

const createLanguage = (update) =>
	new Promise((resolve, reject) => {
		delete update.language_id; //remove language_id:0
		const language = new Language({
			language_id: uuidv4(),
			...update
		});

		const createLanguageQuery = 'INSERT INTO user_language SET ?';
		connection.query(createLanguageQuery, language, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ rows, language_id: language.language_id });
			}
		});
	})
		.then((res) => {
			return {
				message: 'Language Created',
				language_id: res.language_id
			};
		})
		.catch((err) => {
			console.log('err from createLanguage() :>> ', err);
			return {
				error: err.message
			};
		});

const updateLanguage = (update) =>
	new Promise((resolve, reject) => {
		const { language_id } = update;
		delete update.language_id;
		delete update.user_id;

		const updateLanguageQuery =
			'UPDATE user_language SET ' +
			Object.keys(update)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE language_id = ?';

		const parameters = [...Object.values(update), language_id];
		console.log('updateLanguageDetails: Running Query:', updateLanguageQuery, parameters);

		connection.query(updateLanguageQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ message: 'Language updated' });
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

const getOneLanguage = (language_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_language WHERE language_id = ?`;
		connection.query(query, language_id, function (err, rows, fields) {
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
			console.log('err from getOneLanguage() :>> ', err);
			return {
				error: err.message
			};
		});

const getAllLanguage = (user_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM user_language WHERE user_id = ?`;
		connection.query(query, user_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function getLanguageList(user_id) {
	try {
		const languages = await getAllLanguage(user_id);

		let no_of_items = languages.length;
		let filled = no_of_items > 0 ? true : false;

		return {
			filled,
			no_of_items,
			language_list: languages
		};
	} catch (error) {
		console.log('error from getLanguages-fn :>> ', error);
		return error;
	}
}

const deleteLanguage = (language_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM user_language WHERE language_id = ?`;
		connection.query(deleteQuery, language_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function removeOne(data) {
	try {
		const { language_id } = data;
		const languages = await deleteLanguage(language_id).then((response) => {
			return response;
		});

		return { message: 'Language deleted.' };
	} catch (error) {
		console.log('error from dp-fn :>> ', error);
		return error;
	}
}

module.exports = {
	createLanguage,
	getLanguageList,
	updateLanguage,
	removeOne,
	getOneLanguage
};