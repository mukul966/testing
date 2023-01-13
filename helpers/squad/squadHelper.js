const { v4: uuidv4 } = require('uuid');
const Squad = require('../../models/squad/squad');
const { addFilledField } = require('../miscHelper');
const db = require('../../routes/dbhelper');
let connection = db.getconnection();

const createSquad = (squad_name, legal_name) =>
	new Promise((resolve, reject) => {
		const squad = new Squad({
			squad_id: uuidv4(),
			squad_name,
			legal_name,
			order: '0,1,2,3,4,5,6',
			squad_completion: 11
		});

		const createSquadQuery = `INSERT INTO squad SET ?`;
		connection.query(createSquadQuery, squad, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Squad Created',
					squad_id: squad.squad_id
				});
			}
		});
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			console.log('err from createSquad() :>> ', err);
			return {
				error: err.message
			};
		});

const getOnlySquadTable = (squad_id) =>
	new Promise((resolve, reject) => {
		const query = 'SELECT * FROM squad WHERE squad_id = ?';
		connection.query(query, squad_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows[0]);
			}
		});
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			console.log('err from getOnlySquadTable() :>> ', err);
			return {
				error: err.message
			};
		});

const checkSquadName = (squad_name) =>
	new Promise((resolve, reject) => {
		const query = 'SELECT * FROM squad WHERE squad_name = ?';

		connection.query(query, squad_name, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((res) => {
			const isAvailable = res.length == 0 ? true : false;
			return { isAvailable };
		})
		.catch((err) => {
			console.log('err from checkSquadName() :>> ', err);
			return {
				error: err.message
			};
		});

const updateSquadDetails = (updateData) =>
	new Promise((resolve, reject) => {
		const { squad_id } = updateData;
		delete updateData.squad_id;

		if (updateData.hasOwnProperty('core_values')) {
			if (updateData.core_values !== null) {
				let core_values = updateData.core_values.join();
				updateData.core_values = core_values;
			}
		}

		if (updateData.hasOwnProperty('order_array')) {
			let orderValues = updateData.order_array.join(',');
			updateData.order_array = orderValues;
		}

		const query =
			'UPDATE squad SET ' +
			Object.keys(updateData)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE squad_id = ?';
		const parameters = [...Object.values(updateData), squad_id];

		connection.query(query, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ success: true, message: 'Squad updated' });
			}
		});
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			console.log('err from checkSquadName() :>> ', err);
			return {
				error: err.message
			};
		});

const deleteSquad = (squad_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM squad WHERE squad_id = ?`;
		connection.query(deleteQuery, squad_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Squad deleted successfully'
				});
			}
		});
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			console.log('err from deleteSquad() :>> ', err);
			return { error: err.message };
		});

async function getSquad(squad_id) {
	try {
		const squad = await getOnlySquadTable(squad_id);
		if (!squad) {
			return {
				error: 'Squad data not found. Please check if squad_id is correct'
			};
		}

		let general = {};
		general.about_us = {
			content: squad.about_us,
			vision: squad.vision,
			core_values: null
		};

		if (squad.core_values === null) {
			general.about_us.core_values = [];
		} else {
			general.about_us.core_values = squad.core_values.split(',');
		}

		general.more_info = {
			established: squad.established,
			speciality: squad.speciality,
			industry: squad.industry,
			website: squad.website
		};

		general.revenue = {
			total_earning: squad.total_earning,
			net_earning: squad.net_earning,
			unreleased: squad.unreleased
		};

		general.linked_account = {
			facebook: squad.facebook,
			twitter: squad.twitter,
			linkedin: squad.linkedin,
			instagram: squad.instagram,
			github: squad.github,
			behance: squad.behance,
			dribble: squad.dribble,
			pinterest: squad.pinterest
		};

		general.contact_detail = {
			city: squad.city,
			state: squad.state,
			country: squad.country,
			country_code: squad.country_code,
			calling_code: squad.calling_code,
			contact_number: squad.contact_number,
			email_id: squad.email_id,
			website: squad.website
		};

		[
			'established',
			'speciality',
			'industry',
			'about_us',
			'vision',
			'core_values',
			'total_earning',
			'net_earning',
			'unreleased',
			'facebook',
			'twitter',
			'linkedin',
			'instagram',
			'github',
			'behance',
			'dribble',
			'pinterest',
			'city',
			'state',
			'country',
			'country_code',
			'calling_code',
			'contact_number',
			'email_id',
			'website',
			'order_array',
			'rejected_array',
			'hidden_array'
		].forEach((e) => delete squad[e]);

		//function to add filled to each object
		await addFilledField(general);
		squad.general = general;
		return squad;
	} catch (error) {
		console.log('error :>> ', error);
		return error;
	}
}

const getUsersSquadHelper = (parameters) =>
	new Promise((resolve, reject) => {
		if (parameters.length === 0) {
			resolve([]);
		}

		let query =
			'SELECT squad_id, squad_name, category, default_profile_image_id FROM squad WHERE squad_id IN ' +
			'(' +
			parameters.map((e) => '?').join(',') +
			')';

		connection.query(query, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			return { squads: response, count: response.length };
		})
		.catch((err) => {
			console.log('err from getUsersSquadHelper() :>> ', err);
			return { error: err.message };
		});

const updateOrderArray = (order, squad_id) =>
	new Promise((resolve, reject) => {
		const orderValues = order.toString();
		const parameters = [orderValues, squad_id];

		const query = 'UPDATE squad SET order_array = ? WHERE squad_id = ?';

		connection.query(query, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Order array updated.'
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((err) => {
			console.log('err from updateOrderArray() :>> ', err);
			return { error: err.message };
		});

const searchSquad = (keyword) =>
	new Promise((resolve, reject) => {
		// Basic data from squad table and profile-image-data from squad_profile_image table
		const imageFields = [
			'profimgid',
			'profimgname',
			'profimgurl',
			'profimgrotation',
			'profimgposition1',
			'profimgposition2',
			'profimgscale',
			'profimgrotationfocuspoint1',
			'profimgrotationfocuspoint2'
		];
		const squadFields = ['squad_id', 'squad_name', 'legal_name', 'default_profile_image_id'];

		const fields = [...squadFields.map((e) => `squad.${e}`), ...imageFields.map((e) => `squad_profile_image.${e}`)];
		//squad owner -> //user details

		const searchQuery = `SELECT 
			${fields}
			FROM squad 
			LEFT JOIN squad_profile_image ON squad.default_profile_image_id = squad_profile_image.profimgid 
			WHERE squad_name LIKE CONCAT('%',?,'%') 
			ORDER BY squad.squad_name;`;

		connection.query(searchQuery, [keyword], function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((res) => {
			return { count: res.length, res };
			// return res;
		})
		.catch((err) => {
			console.log('err from searchSquad() :>> ', err);
			return {
				error: err.message
			};
		});

const getUserSquad = (user_id) =>
	new Promise((resolve, reject) => {
		// Basic data from squad table and profile-image-data from squad_profile_image table
		const imageFields = [
			'profimgid',
			'profimgname',
			'profimgurl',
			'profimgrotation',
			'profimgposition1',
			'profimgposition2',
			'profimgscale',
			'profimgrotationfocuspoint1',
			'profimgrotationfocuspoint2'
		];
		const squadFields = ['squad_name', 'default_profile_image_id'];

		const fields = [
			`squad_member.squad_id`,
			...squadFields.map((e) => `squad.${e}`),
			...imageFields.map((e) => `squad_profile_image.${e}`)
		];

		const query = `SELECT 
			${fields}
			FROM squad_member
			INNER JOIN squad ON squad.squad_id = squad_member.squad_id
			LEFT JOIN squad_profile_image ON squad.default_profile_image_id = squad_profile_image.profimgid 
			WHERE user_id = ? AND squad_member.member_role = 'owner'`;

		connection.query(query, user_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows[0]);
			}
		});
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			console.log('err from getUserSquad() :>> ', err);
			return {
				error: err.message
			};
		});

const squadExistsForUser = (user_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT squad_id FROM squad_member WHERE user_id = ?`;
		connection.query(query, user_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			let squadExists = response.length == 0 ? false : true;
			return { squadExists };
		})
		.catch((err) => {
			console.log('err from squadExistsForUser() :>> ', err);
			return {
				error: err.message
			};
		});

const aux_getSquadData = (user_id) =>
	new Promise((resolve, reject) => {
		const otherUserFields2 = ['squad_name', 'legal_name', 'default_profile_image_id', 'squad_completion'];
		const imageFields = [
			'profimgid',
			'profimgname',
			'profimgurl',
			'profimgrotation',
			'profimgposition1',
			'profimgposition2',
			'profimgscale',
			'profimgrotationfocuspoint1',
			'profimgrotationfocuspoint2'
		];

		const fields = [
			`squad_member.squad_id`,
			`squad_member.member_role`,
			...otherUserFields2.map((e) => `squad.${e}`),
			...imageFields.map((e) => `squad_profile_image.${e}`)
		];

		const query = `SELECT ${fields} FROM squad_member
				LEFT JOIN squad ON squad_member.squad_id = squad.squad_id
				LEFT JOIN squad_profile_image ON squad.default_profile_image_id = squad_profile_image.profimgid
				WHERE user_id = ? AND (member_role = 'owner' OR member_role = 'admin' OR member_role = 'member')`;

		connection.query(query, user_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows.length > 0 ? rows[0] : null);
			}
		});
	})
		.then((res) => {
			if (res === null) {
				//edge case: squad does not exist
				return null;
			}

			if (res.squad_completion < 11 || res.squad_completion === null) {
				//adding default value for new squad. changes dynamically when it is squad data is updated. works only when squad is in mint-new condition.
				res.squad_completion = 11;
			}

			return res;
		})
		.catch((err) => {
			console.log('error from aux_getSquadData :>> ', err);
			return {
				error: err.message
			};
		});

const findHandle = (handle) =>
	new Promise((resolve, reject) => {
		const query = `SELECT squad_id FROM squad WHERE squad_name = ?`;

		connection.query(query, handle, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			let isSquad = response.length == 0 ? false : true;
			return {
				isSquad,
				squadData: isSquad ? { squad_id: response[0].squad_id } : null
			};
		})
		.catch((error) => {
			console.log('error from findHandle() :>> ', error);
			return {
				error: error.message
			};
		});

const searchSquadUsers = (keyword) =>
	new Promise((resolve, reject) => {
		// Basic data from user table and profile-image-data from user_profile_image table
		const userFields = ['id AS user_id', 'displayname AS user_name', 'firstname', 'lastname'];
		const otherUserFields2 = ['default_profile_image_id', 'profile_id', 'profession'];
		const imageFields = [
			'profimgid',
			'profimgname',
			'profimgurl',
			'profimgrotation',
			'profimgposition1',
			'profimgposition2',
			'profimgscale',
			'profimgrotationfocuspoint1',
			'profimgrotationfocuspoint2'
		];

		const fields = [
			...userFields.map((e) => `users.${e}`),
			...otherUserFields2.map((e) => `user_profile.${e}`),
			...imageFields.map((e) => `user_profile_image.${e}`)
		];

		const searchQuery = `SELECT ${fields} FROM users
				INNER JOIN user_profile ON users.id = user_profile.user_id
				LEFT JOIN user_profile_image ON user_profile.default_profile_image_id = user_profile_image.profimgid
				WHERE CONCAT(displayname) OR profession LIKE CONCAT('%',?,'%') 
				ORDER BY users.displayname;`;

		connection.query(searchQuery, [keyword], function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((res) => {
			return { count: res.length, res };
		})
		.catch((err) => {
			console.log('err from searchSquadUsers() :>> ', err);
			return {
				error: err.message
			};
		});

module.exports = {
	createSquad,
	getOnlySquadTable,
	checkSquadName,
	updateSquadDetails,
	deleteSquad,
	getSquad,
	getUsersSquadHelper,
	updateOrderArray,
	searchSquad,
	getUserSquad,
	aux_getSquadData,
	findHandle,
	squadExistsForUser,
	searchSquadUsers
};
