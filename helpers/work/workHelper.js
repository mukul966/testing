const { v4: uuidv4 } = require('uuid');
var dayjs = require('dayjs');
var relativeTime = require('dayjs/plugin/relativeTime');
const { payment_terms_map, project_type_response_map } = require('../../maps/create-work.js');
const Work = require('../../models/work/work.js');
const Application = require('../../models/work/application.js');
const Share = require('../../models/work/share.js');
const resourceHelper = require('../../helpers/work/resourceHelper');
const db = require('../../routes/dbhelper');
var pool = db.getconnection();

dayjs.extend(relativeTime);

/** Create work */
const createWork = (squad_id) =>
	new Promise((resolve, reject) => {
		const work = new Work({
			work_id: uuidv4(),
			squad_id
		});

		const createWorkQuery = `INSERT INTO work SET ?`;
		pool.query(createWorkQuery, work, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Work Created',
					work_id: work.work_id
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from createWork() :>> ', error);
			return { error: error.message };
		});

const createMilestones = (milestones, work_id) =>
	new Promise((resolve, reject) => {
		const query = `INSERT INTO work_fixedFee_milestone(milestone_id, work_id, name, amount, currency, description) VALUES ?`;

		pool.query(
			query,
			[milestones.map((e) => [uuidv4(), work_id, e.name, e.amount, e.cuurrency, e.description])],
			function (err, rows, fields) {
				if (err) {
					reject(err);
				} else {
					resolve({
						milestonesCreated: true,
						message: 'milestones data updated.'
					});
				}
			}
		);
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from createMilestones() :>> ', error);
			return { error: error.message };
		});

const getMilestones = (work_id) =>
	new Promise((resolve, reject) => {
		const query = 'SELECT * FROM work_fixedFee_milestone WHERE work_id = ?';
		pool.query(query, work_id, function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from getMilestones() :>> ', error);
			return { error: error.message };
		});

const deleteWorkMilestone = (work_id) =>
	new Promise((resolve, reject) => {
		const query = 'DELETE FROM work_fixedFee_milestone WHERE milestone_id = ?';
		pool.query(query, [work_id], function (err, rows, result) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve({ message: 'Milestone deleted', success: true });
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			return error;
		});

const getWorkDetails = (work_id) =>
	new Promise((resolve, reject) => {
		const getWorkQuery = 'SELECT * FROM work WHERE work_id = ?';
		pool.query(getWorkQuery, work_id, function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows[0]);
			}
		});
	})
		.then((response) => {
			//manipulations for keeping in accordance with work.json
			let project_hourly_rate =
				response.project_type === 1
					? {
							currency: response.projectHR_currency,
							amount: response.projectHR_amount
					  }
					: null;

			let fixed_fee =
				response.project_type === 2
					? {
							currency: response.fixedHR_currency,
							amount: response.fixedHR_amount
					  }
					: null;

			let billing_details = {
				billing_currency: response.billing_currency,
				project_payment_frequency: response.project_payment_frequency,
				payment_terms: response.payment_terms === null ? null : payment_terms_map[response.payment_terms]
			};

			let location = `${response.state},${response.country}`;

			response.location = location;
			response.project_hourly_rate = project_hourly_rate;
			response.fixed_fee = fixed_fee;
			response.billing_details = billing_details;

			[
				'state',
				'country',
				'projectHR_currency',
				'projectHR_amount',
				'fixedHR_currency',
				'fixedHR_amount',
				'billing_currency',
				'project_payment_frequency',
				'payment_terms'
			].forEach((e) => delete response[e]);

			return response;
		})
		.catch((error) => {
			console.log('error from getWorkDetails() :>> ', error);
			return { error: error.message };
		});

const updateWorkDetails = (workDetails, work_id) =>
	new Promise((resolve, reject) => {
		delete workDetails.work_id; //remove work_id from update routes.

		const updateWorkQuery =
			'UPDATE work SET ' +
			Object.keys(workDetails)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE work_id = ?';

		const parameters = [...Object.values(workDetails), work_id];
		pool.query(updateWorkQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: 'Work details updated.',
					work_id
				});
			}
		});
	})
		.then((response) => response)
		.catch((error) => {
			console.log('error from updateWorkDetails() :>> ', error);

			return {
				error: error.message
			};
		});

const shareWorkExternalBulk = (shareWorkData, work_id) =>
	new Promise((resolve, reject) => {
		const query = `INSERT INTO work_shared_external(external_share_id, work_id, email, company_name, recipient_name, isValid) VALUES ?`;

		shareWorkData.forEach((e) => {
			e.external_share_id = uuidv4(); // adding external_share_id to shareWorkData object. In pool.query, I require only values, whereas this shareWorkData object is needed further for id.
		});

		pool.query(
			query,
			[shareWorkData.map((e) => [uuidv4(), work_id, e.email, e.company_name, e.recipient_name, 'true'])],
			function (err, rows, fields) {
				if (err) {
					reject(err);
				} else {
					resolve({
						addToDB: true,
						shareWorkData,
						message: 'Work sharing process successful.'
					});
				}
			}
		);
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from shareWorkExternalBulk() :>> ', error);
			return { error: error.message };
		});

const checkValidWork = (work_id) =>
	new Promise((resolve, reject) => {
		const query = 'SELECT * FROM work WHERE work_id = ?';
		pool.query(query, work_id, function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
                  return { isValidWork: response.length == 0 ? false : true };
		})
		.catch((error) => {
			console.log('error from checkValidWork() :>> ', error);
			return { error: error.message };
		});

const getWorkListBySquad = (squad_id) =>
	new Promise((resolve, reject) => {
		const query = 'SELECT work_id FROM work WHERE squad_id = ?';
		pool.query(query, squad_id, function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			let id = [];

			response.forEach((e) => {
				id.push(e.work_id);
			});

			return id;
		})
		.catch((error) => {
			console.log('error from getWorkListBySquad() :>> ', error);
			return { success: false, work: [], error: error.message }; //[TODO] remove error message and set this to true
		});

/** Created by me */
const createdByMe = (squad_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT 
		work.work_id,
		work.work_title,
		work.project_type,
		work.industry,
		work.description,
		work.work_status,
		work.sharing,
		work.squad_id,
		work.projectHR_currency,
		work.projectHR_amount,
		work.fixedHR_currency,
		work.fixedHR_amount,
		GROUP_CONCAT(DISTINCT (work_skill.skill_name)) AS skills,
		DATEDIFF(end_date, start_date) AS duration_in_days,
		MIN(work_resource.amount) AS resource_min_money,
		MAX(work_resource.amount) AS resource_max_money,
		COUNT(DISTINCT work_application.application_id) AS applicant_count
	FROM
		work
			LEFT JOIN
		work_skill ON work_skill.work_id = work.work_id
			LEFT JOIN
		work_resource ON work.work_id = work_resource.work_id
			LEFT JOIN
		work_application ON work_application.work_id = work.work_id
			LEFT JOIN
		squad ON work.squad_id = squad.squad_id
	WHERE
		work.squad_id = ?
	GROUP BY work_id`;

		pool.query(query, squad_id, function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			if (response === undefined || response === null) {
				return { count: 0, data: [] };
			}

			response.forEach((e) => {
				computeWorkData(e); //returns with correct: range, project_typed, duration
			});

			return { count: response.length, data: response };
		})
		.catch((error) => {
			console.log('error from createdByMe() :>> ', error);
			return { error: error.message };
		});

async function getWorkIds2(data) {
	const ids = data.map((e) => e.work_id);
	return ids;
}

const viewWork = (work_id) =>
	new Promise((resolve, reject) => {
		//[TODO] ADD JOB_ID
		const query = `SELECT work.work_id, work.squad_id, work.work_title, work.project_type, work.industry, work.description,
		work.projectHR_currency,
		work.projectHR_amount,
		work.fixedHR_currency,
		work.fixedHR_amount,
		GROUP_CONCAT(DISTINCT(work_skill.skill_name)) AS skills,
		DATEDIFF(end_date, start_date) AS duration_in_days,
		MIN(work_resource.amount) AS resource_min_money,
		MAX(work_resource.amount) AS resource_max_money
FROM work 
		LEFT JOIN work_skill ON work_skill.work_id = work.work_id
		LEFT JOIN work_resource ON work.work_id = work_resource.work_id
WHERE
		work.work_id = ?
		GROUP BY work.work_id`;

		pool.query(query, work_id, function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows[0]);
			}
		});
	})
		.then(async (res) => {
			await computeWorkData(res);
			return res;
		})
		.catch((error) => {
			console.log('error from viewWork() :>> ', error);
			return { error: error.message };
		});

const createdByMeViewWorkStat = (work_id) =>
	new Promise((resolve, reject) => {
		const getWorkQuery = `SELECT 
		work.sharing,
		work_shared.created_at AS shared_on,
		COUNT(work_application.application_id) AS application_count
	FROM
		work
			INNER JOIN
		work_shared ON work.work_id = work_shared.work_id
			LEFT JOIN
		work_application ON work.work_id = work_application.work_id
	WHERE
		work.work_id = ?`;

		pool.query(getWorkQuery, work_id, function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows[0]);
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from createdByMeViewWorkStat() :>> ', error);
			return { error: error.message };
		});

async function getWorkIds(data) {
	let workIds = [];
	const map = new Map();

	for (let i = 0; i < data.length; i++) {
		if (data[i].project_type === 'Resource hourly rate') {
			workIds.push(data[i].work_id);
			map.set(data[i].work_id, i);
			data[i].resources = [];
		}
	}

	const resourceList = await resourceHelper.getAllResourcesFromArray(workIds);

	resourceList.forEach((e) => {
		let indexToStore = map.get(e.work_id);
		data[indexToStore].resources.push(e);
	});

	return data;
}

/** Shared with me */
const shareWorkWithSquadBulk = (work_id, squads) =>
	new Promise((resolve, reject) => {
		// work_request_status: 'Received' is default value.
		const shareWorkQuery = `INSERT INTO work_shared(share_id, work_id, squad_id, work_request_status) VALUES ?`;
		pool.query(
			shareWorkQuery,
			[squads.map((e) => [uuidv4(), work_id, e, 'Received'])],
			function (err, rows, fields) {
				if (err) {
					reject(err);
				} else {
					resolve({
						success: true,
						message: 'Work shared.',
						work_id
					});
				}
			}
		);
	})
		.then((response) => {
			//update flags for work
			return updateWorkDetails({ work_status: 'shared', sharing: 'privately' }, response.work_id);
			// .then(()=>{})send mail
		})
		.then((res2) => {
			res2.success = true;
			res2.message = 'work shared and details updated.';

			return res2;
		})
		.catch((error) => {
			console.log('error from shareWorkWithSquadBulk() :>> ', error);
			return { error: error.message };
		});
/*
const deprecated_workSharedWithMe = (squad_id, status) =>
	new Promise((resolve, reject) => {
		const fields = [
			'work.work_id',
			'work.squad_id',
			'squad.squad_name',
			'work.project_type',
			'work.projectHR_amount',
			'work.projectHR_currency',
			'work.fixedHR_amount',
			'work.fixedHR_currency',
			'work.work_title',
			'work_shared.created_at AS shared_on',
			'work_shared.work_request_status'
		];

		const allWorkSharedWithMeQuery = `SELECT ${fields.join(
			','
		)} FROM work INNER JOIN work_shared ON work.work_id = work_shared.work_id INNER JOIN squad ON work.squad_id = squad.squad_id WHERE work.squad_id = ?`;

		const receivedWorkQuery = `SELECT ${fields.join(
			','
		)} FROM work INNER JOIN work_shared ON work.work_id = work_shared.work_id INNER JOIN squad ON work.squad_id = squad.squad_id WHERE work.squad_id = ? AND work_request_status = 'Received'`;

		const inConversationWorkQuery = `SELECT ${fields.join(
			','
		)} FROM work INNER JOIN work_shared ON work.work_id = work_shared.work_id INNER JOIN squad ON work.squad_id = squad.squad_id WHERE work.squad_id = ? AND work_request_status = 'In conversation'`;

		const acceptedWorkQuery = `SELECT ${fields.join(
			','
		)} FROM work INNER JOIN work_shared ON work.work_id = work_shared.work_id WHERE INNER JOIN squad ON work.squad_id = squad.squad_id work.squad_id = ? AND work_request_status = 'Accepted'`;

		const rejectedWorkQuery = `SELECT ${fields.join(
			','
		)} FROM work INNER JOIN work_shared ON work.work_id = work_shared.work_id WHERE INNER JOIN squad ON work.squad_id = squad.squad_id work.squad_id = ? AND work_request_status = 'Rejected'`;

		let queryToRun;

		if (status === 'all') {
			queryToRun = allWorkSharedWithMeQuery;
		} else if (status === 'received') {
			queryToRun = receivedWorkQuery;
		} else if (status === 'inConversation') {
			queryToRun = inConversationWorkQuery;
		} else if (status === 'accepted') {
			queryToRun = acceptedWorkQuery;
		} else if (status === 'rejected') {
			queryToRun = rejectedWorkQuery;
		} else {
			resolve([]);
		}

		pool.query(queryToRun, squad_id, function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			response.forEach((response) => {
				let project_hourly_rate =
					response.project_type === 1
						? {
								currency: response.projectHR_currency,
								amount: response.projectHR_amount
						  }
						: null;

				let fixed_fee =
					response.project_type === 2
						? {
								currency: response.fixedHR_currency,
								amount: response.fixedHR_amount
						  }
						: null;

				response.project_hourly_rate = project_hourly_rate;
				response.fixed_fee = fixed_fee;

				let projectType =
					project_type_response_map[response.project_type];
				response.project_type = projectType;

				delete response.projectHR_amount;
				delete response.projectHR_currency;
				delete response.fixedHR_currency;
				delete response.fixedHR_amount;
			});

			return response;
		})
		.catch((error) => {
			console.log('error from allWorkSharedWithMe() :>> ', error);
			return { error: error.message };
		});
*/

const workSharedWithMe = (squad_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT 
		work_shared.work_id,
		work_shared.work_request_status,
		squad.squad_name,
		squad.squad_id,
		work.work_title,
		work.project_type,
		work.industry,
		work.description,
		work.projectHR_currency,
		work.projectHR_amount,
		work.fixedHR_currency,
		work.fixedHR_amount,
		GROUP_CONCAT(DISTINCT (work_skill.skill_name)) AS skills,
		DATEDIFF(end_date, start_date) AS duration_in_days,
		MIN(work_resource.amount) AS resource_min_money,
		MAX(work_resource.amount) AS resource_max_money
	FROM
		work_shared
			LEFT JOIN
		work ON work_shared.work_id = work.work_id
			LEFT JOIN
		work_skill ON work_skill.work_id = work.work_id
			LEFT JOIN
		work_resource ON work.work_id = work_resource.work_id
			LEFT JOIN
		squad ON squad.squad_id = work.squad_id
	WHERE
		work_shared.squad_id = ?
	GROUP BY work_id`;

		pool.query(query, squad_id, function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then((res) => {
			if (res === undefined || res === null) {
				return { count: 0, data: [] };
			}

			res.forEach((e) => {
				computeWorkData(e); //returns with correct: range, project_typed, duration
			});

			return { count: res.length, data: res };
		})
		.catch((error) => {
			console.log('error from workSharedWithMe() :>> ', error);
			return { error: error.message };
		});

// const getClientStats = (squad_id) => new Promise((resolve, reject) => {
// 	const query = `SELECT squad.id, squad.state, squad.country, COUNT(work_id) AS project_count FROM work LEFT JOIN squad ON squad.squad_id = work.squad_id WHERE work.squad_id = ?`;

// 	pool.query(query, squad_id, function (err, rows, fields) {
// 		if (err) {
// 			reject({ error: err.message });
// 		} else {
// 			resolve(rows);
// 		}
// 	});
// })
// 	.then((response) => {
// 		return response;
// 	})
// 	.catch((error) => {
// 		console.log('error from clientStats() :>> ', error);
// 		return { error: error.message };
// 	});

//[WIP][TODO]
async function getClientStatsHardcode(squad_id) {
	//hard-coded setup for now. change once you are clear on data points to be calculated from.
	return {
		squad_id: '0x1',
		squad_name: 'Test Squad I',
		workwall_verified_squad: false,
		industry: 'IT',
		project_count: 12,
		average_project_duration: '6 months',
		average_project_value: '$50,000',
		member_since: 2022,
		hiring_rate: 'N/A'
	};
}

//[WIP][TODO]
const getClientStats = (squad_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT 
		work.industry,
		work.state,
		work.country,
		COUNT(work.work_id) AS project_count,
		AVG(CEILING(DATEDIFF(end_date, start_date) / 30)) AS average_project_duration,
		COUNT(DISTINCT squad_member.member_id) AS team_size,
		squad.created_at AS member_since
	FROM
		work
			LEFT JOIN
		squad_member ON squad_member.squad_id = work.squad_id
			LEFT JOIN
		squad ON squad.squad_id = work.squad_id
	WHERE
		work.squad_id = ?`;

		pool.query(query, squad_id, function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows[0]);
			}
		});
	})
		.then(async (res) => {
			if (res === null || res === undefined || res === {}) {
				return { error: 'Data not available on squad_id' };
			}

			let size = await companySize(res.team_size);
			delete res.team_size;
			res.team_size = size;
			return res;
		})
		.catch((error) => {
			console.log('error from getClientStats() :>> ', error);
			return { error: error.message };
		});

const updateWorkRequestStatus = (work_request_status, work_id, squad_id) =>
	new Promise((resolve, reject) => {
		const updateWorkQuery = `UPDATE work_shared SET work_request_status = ? WHERE work_id = ? AND squad_id = ?`;
		const parameters = [work_request_status, work_id, squad_id];

		pool.query(updateWorkQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					message: `Shared work 'work_request_status' updated to '${work_request_status}'`,
					work_id
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

/** Marketplace */
const marketPlace = () =>
	new Promise((resolve, reject) => {
		const query = `SELECT 
      work.work_id,
	work.squad_id,
      work.work_title,
	work.industry,
	work.description,
	work.projectHR_currency,
	work.projectHR_amount,
	work.fixedHR_currency,
	work.fixedHR_amount,
	work.created_at,
	DATEDIFF(end_date, start_date) AS duration_in_days,
	work.project_type,
	GROUP_CONCAT(DISTINCT(work_skill.skill_name)) AS skills,
	MIN(work_resource.amount) AS resource_min_money,
	MAX(work_resource.amount) AS resource_max_money
FROM
    work 
		LEFT JOIN work_skill ON work.work_id = work_skill.work_id
		LEFT JOIN work_resource ON work.work_id = work_resource.work_id
WHERE
    work.sharing = 'marketplace' OR work.sharing = 'both'
GROUP BY work.work_id`;

		pool.query(query, function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			if (response === undefined || response === null) {
				return { count: 0, data: [] };
			}

			response.map(async (e) => {
				await computeWorkData(e);
			});

			return { data: response, count: response.length };
		})
		.catch((error) => {
			console.log('error from marketPlace() :>> ', error);
			return { error: error.message };
		});

const searchMarketPlace = (keyword) =>
	new Promise((resolve, reject) => {
		const query = `SELECT 
		work.work_id,
		work.squad_id,
		work.work_title,
		work.industry,
		work.description,
		work.projectHR_currency,
		work.projectHR_amount,
		work.fixedHR_currency,
		work.fixedHR_amount,
		work.created_at,
		DATEDIFF(end_date, start_date) AS duration_in_days,
		work.project_type,
		GROUP_CONCAT(DISTINCT(work_skill.skill_name)) AS skills,
		MIN(work_resource.amount) AS resource_min_money,
		MAX(work_resource.amount) AS resource_max_money
	FROM
		work 
			LEFT JOIN work_skill ON work.work_id = work_skill.work_id
			LEFT JOIN work_resource ON work.work_id = work_resource.work_id
	WHERE
		work.sharing = 'marketplace' AND work.work_title LIKE CONCAT('%',?,'%')
	GROUP BY work.work_id
	ORDER BY work.work_title;`;

		pool.query(query, [keyword], function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			if (response === undefined || response === null) {
				return { count: 0, data: [] };
			}

			response.map(async (e) => {
				await computeWorkData(e);
			});

			return { data: response, count: response.length };
		})
		.catch((error) => {
			console.log('error from searchMarketPlace() :>> ', error);
			return { error: error.message };
		});

/** Applications */
const getAllApplicationsForWork = (work_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT 
		work_application.application_id,
		work_application.created_at,
		work_application.application_status,
		squad.squad_name,
		squad.legal_name,
		squad.tag_line,
		squad.default_profile_image_id,
		squad_profile_image.profimgid,
		squad_profile_image.profimgname,
		squad_profile_image.profimgurl,
		squad_profile_image.profimgrotation,
		squad_profile_image.profimgposition1,
		squad_profile_image.profimgposition2,
		squad_profile_image.profimgscale,
		squad_profile_image.profimgrotationfocuspoint1,
		squad_profile_image.profimgrotationfocuspoint2
	FROM
		work_application
			LEFT JOIN
		squad ON squad.squad_id = work_application.squad_id
			LEFT JOIN
		squad_profile_image ON squad.default_profile_image_id = squad_profile_image.profimgid
	WHERE
		work_id = ? AND (work_application.complete = 'true' AND NOT work_application.application_status = 'Withdrawn')`;

		pool.query(query, work_id, function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			if (response === undefined || response === null) {
				return { count: 0, data: [] };
			}

			response.forEach((e) => {
				e.squad = {
					squad_id: e.squad_id,
					squad_name: e.squad_name,
					legal_name: e.legal_name,
					tag_line: e.tag_line,
					default_profile_image: {
						profimgid: e.profimgid,
						profimgname: e.profimgname,
						profimgurl: e.profimgurl,
						profimgrotation: e.profimgrotation,
						profimgposition1: e.profimgposition1,
						profimgposition2: e.profimgposition2,
						profimgscale: e.profimgscale,
						profimgrotationfocuspoint1: e.profimgrotationfocuspoint1,
						profimgrotationfocuspoint2: e.profimgrotationfocuspoint2
					}
				};

				[
					'squad_id',
					'squad_name',
					'legal_name',
					'tag_line',
					'default_profile_image_id',
					'profimgid',
					'profimgname',
					'profimgurl',
					'profimgrotation',
					'profimgposition1',
					'profimgposition2',
					'profimgscale',
					'profimgrotationfocuspoint1',
					'profimgrotationfocuspoint2'
				].forEach((y) => delete e[y]);
			});

			return { count: response.length, data: response };
		})
		.catch((error) => {
			console.log('error from getAllApplicationsForWork() :>> ', error);
			return { error: error.message };
		});

/** Miscellaneous functions */
const getRange = async (project_type, projectHR_amount, fixedHR_amount, resource_max_money, resource_min_money) => {
	let range = null;

	if (project_type === 1) {
		//project_hourly_rate
		range = `$${projectHR_amount}/hr`;
	} else if (project_type === 2) {
		//fixed fee
		range = `$${fixedHR_amount}`;
	} else if (project_type === 0) {
		//resource_hourly_rate
		if (resource_max_money === null && resource_min_money === null) {
			range = 'N/A';
		}

		range = {
			min: resource_min_money === null ? 'N/A' : resource_min_money,
			max: resource_max_money
		};
	} else {
		//setting N/A if project type is not defined
		range = 'N/A';
	}

	return range;
};

//calculates work data: 1. range, 2. project_type, 3. duration, 4. from_now('X' days/months/hour ago)
const computeWorkData = async (e) => {
	let skills = !e.skills ? [] : e.skills.split(',');
	e.skills = skills;

	//manipulations here
	// 1. range
	const range = await getRange(
		e.project_type,
		e.projectHR_amount,
		e.fixedHR_amount,
		e.resource_max_money,
		e.resource_min_money
	);
	e.range = range;

	// 2. project_type
	let aux_project_type = project_type_response_map[e.project_type];
	e.project_type = aux_project_type;

	// 3. duration - send data which is most feasible, in-days or in-months
	const duration = await getWorkDuration(e.duration_in_days);
	e.duration = duration;

	//4. add from_now - relative time
	let from_now = dayjs(e.created_at).fromNow();
	e.from_now = from_now;

	[
		'resource_min_money',
		'resource_max_money',
		'projectHR_amount',
		'projectHR_currency',
		'fixedHR_amount',
		'fixedHR_currency',
		'duration_in_months',
		'duration_in_days',
		'created_at'
	].forEach((element) => delete e[element]);
};

const getWorkDuration = async (duration_in_days) => {
	let duration;

	let duration_in_months = duration_in_days / 30;
	duration_in_months = Math.floor(duration_in_months);

	if (duration_in_months >= 1) {
		duration = `${Math.floor(duration_in_months)} months`;
	} else {
		duration = duration_in_days === null ? 'N/A' : `${duration_in_days} days`;
	}
	return duration;
};

async function companySize(no) {
      if(no==0){
            return '0';
      }else if(no >= 0 || no >= 10) {
		return '0-10';
	} else if (no <= 50) {
		return '11-50';
	} else if (no <= 200) {
		return '51-200';
	} else if (no <= 500) {
		return '201-500';
	} else if (no <= 1000) {
		return '501-1000';
	} else if (no <= 5000) {
		return '1001-5000';
	} else if (no <= 10000) {
		return '5001-10,000 ';
	} else {
		return '10,000+';
	}
}

/** Delete Work */
const deleteAllwork = (work_id) =>
	new Promise((resolve, reject) => {
		const query = 'DELETE FROM work WHERE work_id=?';
		pool.query(query, [work_id], function (err, rows, result) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve('sucessfully deleted from work Table');
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			return error;
		});

const deleteWorkWorkBookmark = (work_id) =>
	new Promise((resolve, reject) => {
		const query = 'DELETE FROM work_bookmark WHERE work_id=?';
		pool.query(query, [work_id], function (err, rows, result) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve('sucessfully deleted from work_bookmark Table');
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			return error;
		});

const deleteWorkQuestionnaire = (work_id) =>
	new Promise((resolve, reject) => {
		const query = 'DELETE FROM work_questionnaire WHERE work_id=?';
		pool.query(query, [work_id], function (err, rows, result) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve('sucessfully deleted from work_questionnaire Table');
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			return error;
		});

const deleteWorkResource = (work_id) =>
	new Promise((resolve, reject) => {
		const query = 'DELETE FROM work_resource WHERE work_id=?';
		pool.query(query, [work_id], function (err, rows, result) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve('sucessfully deleted from work_resource Table');
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			return error;
		});

const deleteWorkShared = (work_id) =>
	new Promise((resolve, reject) => {
		const query = 'DELETE FROM work_shared WHERE work_id=?';
		pool.query(query, [work_id], function (err, rows, result) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve('sucessfully deleted from work_shared Table');
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			return error;
		});

const deleteWorkSharedExternal = (work_id) =>
	new Promise((resolve, reject) => {
		const query = 'DELETE FROM work_shared_external WHERE work_id=?';
		pool.query(query, [work_id], function (err, rows, result) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve('sucessfully deleted from work_shared_external Table');
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			return error;
		});

const deleteWorkSkill = (work_id) =>
	new Promise((resolve, reject) => {
		const query = 'DELETE FROM work_skill WHERE work_id=?';
		pool.query(query, [work_id], function (err, rows, result) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve('sucessfully deleted from work_skill Table');
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			return error;
		});

async function delete_data_work(work_id) {
	const work = await deleteAllwork(work_id);
	const WorkBookmark = await deleteWorkWorkBookmark(work_id);
	const workQuestionnaire = await deleteWorkQuestionnaire(work_id);
	const workResource = await deleteWorkResource(work_id);
	const workShared = await deleteWorkShared(work_id);
	const workSharedExternal = await deleteWorkSharedExternal(work_id);
	const workSkill = await deleteWorkSkill(work_id);

	let response = {
		work: work,
		WorkBookmark: WorkBookmark,
		workQuestionnaire: workQuestionnaire,
		workResource: workResource,
		workShared: workShared,
		workSharedExternal: workSharedExternal,
		workSkill: workSkill
	};
	return response;
}

/** PROJECTS/INVOICE */
const getProjectsWithClient = (workIDList, client_squad_id) =>
	new Promise((resolve, reject) => {
		const query =
			`SELECT work_application.work_id AS work_id, work.work_title FROM work_application INNER JOIN work ON work.work_id = work_application.work_id WHERE work_application.work_id IN (` +
			pool.escape(workIDList) +
			`) AND (work_application.application_status = 'Accepted' AND work_application.complete = 'true' AND work_application.squad_id = '${client_squad_id}')`;
		pool.query(query, function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from getProjectsWithClient() :>> ', error);
			return { error: error.message };
		});

const checkApplication = (work_id, squad_id) =>
	new Promise((resolve, reject) => {
		const checkApplicationQuery = `SELECT 
		*
	FROM
		vmsback.work_application
	WHERE
		work_id = ? AND squad_id = ?`;

		pool.query(checkApplicationQuery, [work_id, squad_id], function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((rows) => {
			return {
				applied: rows.length == 0 ? false : true,
				complete: rows[0].complete,
				application_id: rows[0].application_id
			};
		})
		.catch((error) => {
			console.log('Error from workHelper :: checkApplication', error);
			return {
				error: error.message
			};
		});



const deleteWorkMilestoneByWork_id = (work_id) =>
  new Promise((resolve, reject) => {
    const query = "DELETE FROM work_fixedFee_milestone WHERE work_id= ?";
    pool.query(query, work_id, function (err, rows, result) {
      if (err) {
        reject({ error: err.message });
      } else {
        resolve({ message: "Milestone deleted", success: true });
      }
    });
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error;
    });

module.exports = {
	createWork,
	getWorkDetails,
	updateWorkDetails,
	checkValidWork,
	shareWorkExternalBulk,
	createdByMe,
	viewWork,
	createdByMeViewWorkStat,
	shareWorkWithSquadBulk,
	workSharedWithMe,
	updateWorkRequestStatus,
	marketPlace,
	getWorkIds,
	getClientStats,
	getAllApplicationsForWork,
	getWorkIds2,
	computeWorkData,
	createMilestones,
	getMilestones,
	deleteWorkMilestone,
	delete_data_work,
	searchMarketPlace,
	getWorkListBySquad,
	getProjectsWithClient,
	checkApplication,
      deleteWorkMilestoneByWork_id
};
