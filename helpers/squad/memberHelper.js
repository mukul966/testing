const { v4: uuidv4 } = require("uuid");
const Member = require("../../models/squad/member");
const db = require("../../routes/dbhelper");
let connection = db.getconnection();

const createMember = (update) =>
	new Promise(async (resolve, reject) => {
		delete update.member_id;
		const member = new Member({
			member_id: uuidv4(),
			...update
		});

		const createMemberQuery = 'INSERT INTO squad_member SET ?';
		connection.query(createMemberQuery, member, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Member Created',
					member_id: member.member_id
				});
			}
		});
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			console.log('err from createMember() :>> ', err);
			return {
				error: err.message
			};
		});

const updateMember = (update) =>
	new Promise((resolve, reject) => {
		const { member_id } = update;
		delete update.member_id;
		delete update.squad_id;
		delete update.user_id;

		const updateMemberQuery =
			'UPDATE squad_member SET ' +
			Object.keys(update)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE member_id = ?';

		const parameters = [...Object.values(update), member_id];
		console.log('updateMemberDetails: Running Query:', updateMemberQuery, parameters);

		connection.query(updateMemberQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Member Updated',
					member_id
				});
			}
		});
	})
		.then((res) => {
			return res;
		})
		.catch((err) => {
			console.log('error from updateMember:>> ', error);
			return {
				error: err.message
			};
		});

const getMembers = (squad_id) =>
	new Promise((resolve, reject) => {
		const imageFields = ['profimgid', 'profimgname', 'profimgurl', 'profimgrotation', 'profimgposition1', 'profimgposition2', 'profimgscale', 'profimgrotationfocuspoint1', 'profimgrotationfocuspoint2'];

		const usersFields = ['firstname AS first_name', 'lastname AS last_name', 'email']
		const fields = [`squad_member.user_id`, `user_profile.profile_id`, `squad_member.member_role`, `user_handle.handle AS user_handle`, `user_profile.profession`, `user_profile.default_profile_image_id`, ...usersFields.map(e => `users.${e}`), ...imageFields.map(e => `user_profile_image.${e}`)];

		const query = `SELECT  ${fields} 
		FROM squad_member
		INNER JOIN users ON users.id = squad_member.user_id
		INNER JOIN user_handle ON user_handle.id = squad_member.user_id
		LEFT JOIN user_profile ON user_profile.user_id = squad_member.user_id
		LEFT JOIN user_profile_image ON user_profile_image.profimgid = user_profile.default_profile_image_id
		WHERE squad_member.squad_id = ?`;

		connection.query(query, squad_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((members) => {
			let no_of_items = members.length;
			let filled = no_of_items > 0 ? true : false;

			return {
				filled,
				no_of_items,
				member_list: members
			};
		})
		.catch((err) => {
			console.log('error from getMembers-fn :>> ', err);

			return {
				error: err.message
			};
		});

const deleteMember = (member_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM squad_member WHERE member_id = ?`;
		connection.query(deleteQuery, member_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

async function removeOne(data) {
	try {
		const { member_id } = data;
		const members = await deleteMember(member_id).then((response) => {
			return response;
		});

		return { message: 'Member deleted.' };
	} catch (error) {
		console.log('error from dp-fn :>> ', error);
		return error;
	}
}

const getAllSquadIds = (user_id) =>
	new Promise((resolve, reject) => {
		const query = 'SELECT squad_id FROM squad_member WHERE user_id = ?';
		connection.query(query, user_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			let parameters = response.map((e) => e.squad_id); //creating array of squad_id(s) for parameterised queries
			return parameters;
		})
		.catch((err) => {
			console.log('err from getAllSquadIds() :>> ', err);
			return {
				error: err.message
			};
		});

const deleteAllMembers = (squad_id) =>
	new Promise((resolve, reject) => {
		const deleteQuery = `DELETE FROM squad_member WHERE squad_id = ?`;
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
				message: 'Member(s) deleted successfully'
			};
		})
		.catch((e) => {
			console.log('e from deleteAllMembers() :>> ', e);
			return { error: e.message };
		});

const getOneMember = (member_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM squad_member WHERE member_id = ?`;
		connection.query(query, member_id, function (err, rows, fields) {
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
			console.log('err from getOneMember() :>> ', err);
			return {
				error: err.message
			};
		});

const createSquadRequest = (squad_id, user_id) => new Promise((resolve, reject) => {
	const createQuery = 'INSERT INTO squad_member_request SET ? ';
	const parameters = new Request(uuidv4(), squad_id, user_id);
	//status: Received, Accepted, 

	connection.query(createQuery, parameters, function (err, rows, fields) {
		if (err) {
			reject(err);
		} else {
			resolve(rows);
		}
	});
})
	.then((res) => {
		return { success: true, message: 'Request data added to db' };
	})
	.catch((err) => {
		console.log('err from createSquadRequest() :>> ', err);
		return {
			error: err.message
		};
	});

const updateSquadRequest = ({ request_status, squad_id, user_id } = data) =>
	new Promise((resolve, reject) => {
		const updateWorkQuery = `UPDATE squad_member_request SET request_status = ? WHERE squad_id = ? AND user_id = ?`
		const parameters = [request_status, squad_id, user_id];

		connection.query(updateWorkQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					success: true,
					message: `Member 'request_status' updated to '${request_status}'`,
				});
			}
		});
	})
		.then((response) => response)
		.catch((error) => {
			console.log('error from updateWorkRequestStatus() :>> ', error);
			return {
				error: error.message
			};
		});

const createMemberRequestBulk = (squad_id, users) =>
	new Promise((resolve, reject) => {
		const createMemberRequestQuery = 'INSERT INTO squad_member_request (request_id, squad_id, user_id, request_status) VALUES ?';
		connection.query(
			createMemberRequestQuery,
			[users.map((user) => [uuidv4(), squad_id, user, 'Received'])],
			function (err, rows, fields) {
				if (err) {
					reject({ error: err.message });
				} else {
					resolve({
						message: 'Member request(s) created'
					});
				}
			}
		);
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from createMemberRequestBulk() :>> ', error);
			return {
				error: error.message
			};
		});

const getMemberRequestList = (user_id) => new Promise((resolve, reject) => {
	const squadFields = ['squad_name', 'default_profile_image_id'];
	const imageFields = ['profimgid', 'profimgname', 'profimgurl', 'profimgrotation', 'profimgposition1', 'profimgposition2', 'profimgscale', 'profimgrotationfocuspoint1', 'profimgrotationfocuspoint2'];

	const fields = [...squadFields.map(e => `squad.${e}`), ...imageFields.map(e => `squad_profile_image.${e}`)];

	const query = `SELECT squad_member_request.squad_id, ${fields} FROM squad_member_request 
	INNER JOIN squad ON squad.squad_id = squad_member_request.squad_id 
	LEFT JOIN squad_profile_image ON squad_profile_image.profimgid = squad.default_profile_image_id 
	WHERE squad_member_request.request_status = "Received" AND user_id = ?`

	connection.query(query, user_id, function (err, rows, fields) {
		if (err) {
			reject(err);
		} else {
			resolve(rows);
		}
	});
})
	.then((res) => {
		console.log('res :>> ', res);
		return res;
	})
	.catch((err) => {
		console.log('err from getMemberRequestList() :>> ', err);
		return {
			error: err.message
		};
	});

const getRequestStatus = ({ squad_id, user_id } = data) => new Promise((resolve, reject) => {
	const query = `SELECT * FROM squad_member_request WHERE squad_id = ? AND user_id = ?`;
	connection.query(query, [squad_id, user_id], function (err, rows, fields) {
		if (err) {
			reject(err);
		} else {
			resolve(rows[0]);
		}
	});
})
	.then((res) => {
		return res.request_status;
	})
	.catch((err) => {
		console.log('err from getRequestStatus() :>> ', err);
		return {
			error: err.message
		};
	})

const getSquadOwnerData = (squad_id) =>
	new Promise((resolve, reject) => {
		const memberFields = ['member_id', 'squad_id', 'user_id', 'member_role'];
		const userFields = ['firstname', 'lastname', 'email'];
		const profileFields = ['profession', 'default_profile_image_id']
		const imageFields = ['profimgid', 'profimgname', 'profimgurl', 'profimgrotation', 'profimgposition1', 'profimgposition2', 'profimgscale', 'profimgrotationfocuspoint1', 'profimgrotationfocuspoint2'];

		const fields = [...memberFields.map(e => `squad_member.${e}`), ...userFields.map(e => `users.${e}`), ...profileFields.map(e => `user_profile.${e}`), ...imageFields.map((e) => `user_profile_image.${e}`, `squad.tag_line`)]

		const dataQuery = `SELECT ${fields} FROM squad_member
		INNER JOIN users ON squad_member.user_id = users.id
		INNER JOIN user_profile ON users.id = user_profile.user_id
		LEFT JOIN user_profile_image ON user_profile.default_profile_image_id = user_profile_image.profimgid
		WHERE squad_id = ? AND member_role = 'owner'`;

		connection.query(dataQuery, [squad_id], function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((e) => {
			console.log('e from getSquadOwnerData() :>> ', e);
			return { error: e.message };
		});

const checkRequest = (email) => new Promise((resolve, reject) => {
	const query = `SELECT * FROM squad_request_external WHERE email = ?`

	connection.query(query, email, function (err, rows, fields) {
		if (err) {
			reject(err);
		} else {
			resolve(rows.length === 0 ? null : rows[0]);
		}
	});
})
	.then((response) => {
		let match = false;

		if (response !== null) {
			if (response.isValid === "true") {
				match = true;
			}
		}

		return { match, details: response }
	})
	.catch((err) => {
		console.log('err from checkRequest() :>> ', err);
		return { error: err.message };
	});

const createRequestExternal = (data) => new Promise((resolve, reject) => {
	const createQuery = 'INSERT INTO squad_request_external SET ? ';
	const parameters = new RequestExt({ request_id: uuidv4(), ...data });
	//type: employee, contractor
	connection.query(createQuery, parameters, function (err, rows, fields) {
		if (err) {
			reject(err);
		} else {
			console.log('rows :>> ', rows);
			resolve({ rows, request_id: parameters.request_id });
		}
	});
})
	.then((res) => {
		return { success: true, request_id: res.request_id };
	})
	.catch((err) => {
		console.log('err from createRequestExternal() :>> ', err);
		return {
			error: err.message
		};
	});

const createRequestExternalBulk = ({ squad_id, user_id, invites } = req.body) => new Promise((resolve, reject) => {
	const createQuery = 'INSERT INTO squad_request_external (request_id, user_id, squad_id, email, first_name, last_name, type, isValid) VALUES ?';
	//type: employee, contractor

	//adding request_id for each invite
	invites.forEach((invite) => {
		invite.request_id = uuidv4()
	})

	connection.query(createQuery,
		[invites.map((invite) => [invite.request_id, user_id, squad_id, invite.email, invite.first_name, invite.last_name, invite.type, "true"])],
		function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ invites });

			}
		});
})
	.then((res) => {
		return { success: true, invites: res.invites };
	})
	.catch((err) => {
		console.log('err from createRequestExternalBulk() :>> ', err);
		return {
			error: err.message
		};
	});

const updateExtRequestStatus = ({ request_id, request_status } = data) => new Promise((resolve, reject) => {
	const query = `UPDATE squad_request_external SET request_status = ? WHERE request_id = ?`

	connection.query(query, [request_status, request_id], function (err, rows, fields) {
		if (err) {
			reject(err);
		} else {
			resolve({ message: "request_status updated." });

		}
	});
})
	.then((res) => {
		return { success: true, message: res.message };
	})
	.catch((err) => {
		console.log('err from updateExtRequestStatus() :>> ', err);
		return {
			error: err.message
		};
	});

async function addExtUserToSquadAuto(userData) {
	const requestData = await checkRequest(userData.email);
	if (requestData.details.request_status === "Accepted") {
		const member = await createMember({ //Add user to squad
			member_id: 0,
			squad_id: requestData.details.squad_id,
			user_id: userData.uid,
			member_role: "member",
			image_id: userData.picture
		})

		return { addUserToSquad: true, message: "User added to squad." }
	}

	return { addUserToSquad: false, message: "Request data not accepted/found." }
}

function RequestExt(request) {
	this.request_id = request.request_id,
		this.user_id = request.user_id,
		this.squad_id = request.squad_id,
		this.email = request.email,
		this.first_name = request.first_name,
		this.last_name = request.last_name,
		this.type = request.type,
		this.isValid = "true"
}

function Request(request_id, squad_id, user_id, request_status = 'Received') {
	this.request_id = request_id,
		this.squad_id = squad_id,
		this.user_id = user_id,
		this.request_status = request_status
}

module.exports = {
	createMember,
	updateMember,
	getMembers,
	removeOne,
	getAllSquadIds,
	deleteAllMembers,
	getOneMember,
	createSquadRequest,
	createMemberRequestBulk,
	updateSquadRequest,
	getMemberRequestList,
	getSquadOwnerData,
	checkRequest,
	createRequestExternal,
	createRequestExternalBulk,
	updateExtRequestStatus,
	addExtUserToSquadAuto
};
