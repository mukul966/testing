const db = require("../routes/dbhelper");
const { v4: uuidv4 } = require('uuid');
let connection = db.getconnection();

const userExists = (email) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM users WHERE email = ?`;
		connection.query(query, email, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((user) => {
			const userExists = user.length === 1 ? true : false;
			return {
				userExists,
				loginType: userExists === false ? null : user[0].signinprov
			};
		})
		.catch((err) => {
			console.log('err from userExists() :>> ', err);
			return {
				error: err.message
			};
		});

const isEmailValid = (email) => {
	const emailRegex =
		/^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

	if (!email) return false;

	if (email.length > 254) return false;

	const valid = emailRegex.test(email);
	if (!valid) return false;

	// Further checking of some things regex can't handle
	const parts = email.split('@');
	if (parts[0].length > 64) return false;

	const domainParts = parts[1].split('.');
	if (
		domainParts.some(function (part) {
			return part.length > 63;
		})
	)
		return false;

	return true;
};

const otpToDb = (email, otp) =>
	new Promise((resolve, reject) => {
		const createQuery = 'INSERT INTO otp SET ? ';
		const parameters = new Otp(uuidv4(), email, otp);

		connection.query(createQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((res) => {
			return { message: 'Added to db' };
		})
		.catch((err) => {
			console.log('err from otpToDb() :>> ', err);
			return {
				error: err.message
			};
		});

const matchOtp = (otp, email) =>
	new Promise((resolve, reject) => {
		const query = 'SELECT * FROM otp WHERE email = ?';
		connection.query(query, email, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows[0]);
			}
		});
	})
		.then(async (data) => {
			if (!data) {
				return { otpMatch: false, otpExists: false, message: 'otp for email does not exist. Use send-otp.' };
			}

			const expiry = await isExpired(email);
			if (expiry) {
				return { otpExpired: true, otpMatch: false, otpExists: true, message: 'OTP expired. Use resend-otp.' };
			}

			let result = (otp === data.otp) ? true : false;
			if (result === true) {
				await clearOtpUserDataIfExists(data.email);
			}

			return { otpMatch: result, otpExpired: false, otpExists: true, message: 'OTP matched.' };
		})
		.catch((err) => {
			console.log('err from matchOtp() :>> ', err);
			return {
				error: err.message
			};
		});

const removeOtp = (id) =>
	new Promise((resolve, reject) => {
		const query = 'DELETE FROM otp WHERE id = ?';
		connection.query(query, id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows[0]);
			}
		});
	})
		.then((data) => {
			console.log('Otp removed from db');
			return { message: 'Removed from db' };
		})
		.catch((err) => {
			console.log('err from removeOtp() :>> ', err);
			return {
				error: err.message
			};
		});

const getOtp = async () => Math.floor(Math.random() * 899999 + 100000);

const updateOtp = (email, otp) =>
	new Promise(async (resolve, reject) => {
		const emailExists = await otpTableUserExists(email);
		if (emailExists === false) {
			resolve({
				emailWithOtpExists: false,
				otpUpdated: false,
				message: 'OTP for user does not exist. Please generate otp first.'
			});

		}

		const updateQuery = 'UPDATE otp SET otp = ? WHERE email = ?';
		const parameters = [otp, email];

		connection.query(updateQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					emailWithOtpExists: true,
					otpUpdated: true,
					message: 'otp db entry updated'
				});
			}
		});
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			console.log('err from updateOtp() :>> ', err);
			return {
				error: err.message
			};
		});

const otpTableUserExists = (email) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM otp WHERE email = ?`;
		connection.query(query, email, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((user) => {
			return user.length === 1 ? true : false;
		})
		.catch((err) => {
			console.log('err from otpTableUserExists() :>> ', err);
			return {
				error: err.message
			};
		});

const clearOtpUserDataIfExists = (email) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM otp WHERE email = ?`;
		connection.query(query, email, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((user) => {
			if (user.length === 0) {
				return { userExists: false, removeAllFromDB: false };
			}

			return deleteUserDataFromDB(user);
		}).then((res) => {
			if (res.removeAllFromDB === false) {
				return {}
			} else {
				return true;
			}
		})
		.catch((err) => {
			console.log('err from clearOtpUserDataIfExists() :>> ', err);
			return {
				error: err.message
			};
		});

const otpExpiry = (email) =>
	new Promise((resolve, reject) => {
		const query =
			'SELECT TIMESTAMPDIFF(MINUTE, updated_at, CURRENT_TIMESTAMP) AS timeDifference FROM otp WHERE email = ?';
		connection.query(query, email, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows[0]);
			}
		});
	})
		.then((data) => {
			return data.timeDifference > 15 ? true : false; //set to 15 minutes in email template
		})
		.catch((err) => {
			console.log('err from otpExpiry() :>> ', err);
			return {
				error: err.message
			};
		});

const isExpired = async (email) => {
	return await otpExpiry(email);
};

const deleteUserDataFromDB = (user) =>
	new Promise(async (resolve, reject) => {
		const query = `DELETE FROM otp WHERE id IN (` + user.map((e) => `'${e.id}'`).join(',') + `)`;
		connection.query(query, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((res) => {
			return { userExistsBefore: true, removeAllFromDB: true }
		})
		.catch((err) => {
			console.log('err from deleteUserDataFromDB() :>> ', err);
			return {
				error: err.message
			};
		});

function Otp(id, email, otp) {
	(this.otp = otp), (this.email = email), (this.id = id);
}

module.exports = {
	userExists,
	isEmailValid,
	otpToDb,
	matchOtp,
	getOtp,
	updateOtp,
	otpExpiry,
	clearOtpUserDataIfExists
};