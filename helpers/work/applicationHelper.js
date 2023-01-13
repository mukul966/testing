const { v4: uuidv4 } = require('uuid');
const Application = require('../../models/work/application.js');
const { computeWorkData } = require('./workHelper');
const { getAllResourcesInWorkApplication } = require('./resourceHelper');
const { getAllQuestionnaire, getAllQuestionAnswer, mergeQuestionandAnswers } = require('./questionnaireHelper');
const db = require('../../routes/dbhelper');
var pool = db.getconnection();

// route: /apply
const createApplication = (work_id, squad_id) =>
	new Promise((resolve, reject) => {
		const application = new Application({
			application_id: uuidv4(),
			work_id,
			squad_id,
			application_status: 'Received',
			complete: 'false'
		});

		const query = `INSERT INTO work_application SET ?`;
		pool.query(query, application, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					success: true,
					message: 'Application Created',
					application_id: application.application_id
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from createApplication() :>> ', error);
			return { error: error.message };
		});

const updateApplication = (data, application_id) =>
	new Promise((resolve, reject) => {
		const updateApplicationQuery =
			'UPDATE work_application SET ' +
			Object.keys(data)
				.map((key) => `${key} = ?`)
				.join(', ') +
			' WHERE application_id = ?';

		const parameters = [...Object.values(data), application_id];
		pool.query(updateApplicationQuery, parameters, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ updateApplication: true, message: 'Application updated' });
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from updateApplicationQuery() :>> ', error);
			return { error: error.message };
		});

const checkValidApplication = (application_id) =>
	new Promise((resolve, reject) => {
		const query = 'SELECT * FROM work_application WHERE application_id = ?';
		pool.query(query, application_id, function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			return { isValidApplication: response.length == 0 ? false : true };
		})
		.catch((error) => {
			console.log('error from checkValidApplication() :>> ', error);
			return { error: error.message };
		});

//get squad data of applications 
const getSquadData = (workIDList) =>
	new Promise((resolve, reject) => {
		const query = `SELECT work_application.squad_id, squad.squad_name, squad.legal_name FROM work_application INNER JOIN squad ON squad.squad_id = work_application.squad_id WHERE work_id IN (` + pool.escape(workIDList) + `) AND (work_application.application_status = 'Accepted' AND work_application.complete = 'true')`;

		pool.query(query, function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			return response
		})
		.catch((error) => {
			console.log('error from getSquadData() :>> ', error);
			return { error: error.message };
		});


//Add applicant count to multiple work(s)
const addApplicantCountToWorks = (data) =>
	new Promise(async (resolve, reject) => {
		const {work_ids} = data.map((e) => e.work_id); //gives out array of ids
		const query =
			`SELECT work_id, COUNT(application_id) AS applicants FROM vmsback.work_application WHERE work_id IN (` +
			work_ids.map((e) => '?').join(',') +
			`) GROUP BY work_id`;

		pool.query(query, work_ids, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	})
		.then((response) => {
			//response contains [{ work_id: applicants(count) }]

			const map = new Map(); //hashmap for tracking work_ids:applicants
			response.forEach((e) => {
				map.set(e.work_id, e.applicants);
			});

			data.forEach((e) => {
				//adding applicants for each work which has key:value pair in map. If no pair exists in map, doing nothing here. Default applicants set to 0.
				let applicants = 0;
				applicants = map.get(e.work_id);
				if (applicants !== undefined) {
					e.applicants = applicants;
				}
			});

			return data;
		})
		.catch((err) => {
			console.log('err from addApplicantCountToWorks() :>> ', err);
			return { error: err.message };
		});

const getApplicantCountForWork = (work_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT work_id, COUNT(application_id) as applicants FROM work_application WHERE work_id = ?`;

		pool.query(query, work_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve((applicants = rows[0].applicants));
			}
		});
	})
		.then((response) => response)
		.catch((error) => {
			console.log('error from getApplicantCountForWork() :>> ', error);
			return {
				error: error.message
			};
		});

const getWorkAndSquadData = async (application_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT
		work_application.application_id,
		work.work_id,
		work.work_title,
		squad.squad_id,
		squad.squad_name,
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

		FROM work_application 
			LEFT JOIN work ON work_application.work_id = work.work_id
			LEFT JOIN squad ON work.squad_id = squad.squad_id
			LEFT JOIN squad_profile_image on squad_profile_image.profimgid = squad.default_profile_image_id 
		WHERE work_application.application_id = ?`;

		pool.query(query, application_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows[0]);
			}
		});
	})
		.then((res) => {
			res.squad = {
				squad_id: res.squad_id,
				squad_name: res.squad_name
			};

			res.squad.default_profile_image = {
				profimgid: res.profimgid,
				profimgname: res.profimgname,
				profimgurl: res.profimgurl,
				profimgrotation: res.profimgrotation,
				profimgposition1: res.profimgposition1,
				profimgposition2: res.profimgposition2,
				profimgscale: res.profimgscale,
				profimgrotationfocuspoint1: res.profimgrotationfocuspoint1,
				profimgrotationfocuspoint2: res.profimgrotationfocuspoint2
			};

			[
				'squad_id',
				'squad_name',
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
			].forEach((e) => delete res[e]);

			return res;
		})
		.catch((error) => {
			console.log('error from createApplication() :>> ', error);
			return { error: error.message };
		});

const viewOneApplication = async (application_id) => {
	const workSquadData = await getWorkAndSquadData(application_id);
	const resourceData = await getAllResourcesInWorkApplication(application_id);
	const questionData = await getAllQuestionnaire(workSquadData.work_id);
	const answerData = await getAllQuestionAnswer(application_id);
	const attachmentData = await getAttachmentsInApplication(application_id);

	const mergeQandAnswers = await mergeQuestionandAnswers(questionData, answerData);

	return {
		application: {
			...workSquadData,
			resources: resourceData,
			questionnaire: mergeQandAnswers,
			attachements: attachmentData
		}
	};
};

const getMyApplications = (squad_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT
		work_application.application_id, 
		work_application.application_status, 
		work_application.created_at, 
		squad.squad_name,
		squad.squad_id,
		work.work_id,
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
		work_application
			LEFT JOIN
		work ON work_application.work_id = work.work_id
			LEFT JOIN
		work_skill ON work_skill.work_id = work.work_id
			LEFT JOIN
		work_resource ON work.work_id = work_resource.work_id
			LEFT JOIN
		squad ON squad.squad_id = work.squad_id
	WHERE
		work_application.squad_id = ?
	GROUP BY work_id`;

		pool.query(query, squad_id, function (err, rows, fields) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve(rows);
			}
		});
	})
		.then(async (res) => {
			if (res === undefined || res === null) {
				return { count: 0, data: [] };
			}

			res.forEach((e) => {
				computeWorkData(e); //returns with correct: range, project_typed, duration
			});

			return { count: res.length, data: res };
		})
		.catch((error) => {
			console.log('error from getMyApplications() :>> ', error);
			return { error: error.message };
		});

const createAttachment = ({ application_id, name, url, type }) =>
	new Promise((resolve, reject) => {
		const attachment = new Attachment({
			attachment_id: uuidv4(),
			application_id,
			file_name: name,
			file_url: url,
			file_type: type
		});

		const query = 'INSERT INTO work_application_attachment SET ?';
		pool.query(query, attachment, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					addToDB: true,
					attachment_id: attachment.attachment_id
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from createAttachment() :>> ', error);
			return {
				error: error.message
			};
		});

const deleteAttachment = (attachment_id) =>
	new Promise((resolve, reject) => {
		const query = `DELETE FROM work_application_attachment WHERE attachment_id = ?`;
		pool.query(query, attachment_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({ removeFromDB: true, message: 'Attachment deleted.' });
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from deleteAttachment() :>> ', error);
			return {
				error: error.message
			};
		});

const getAttachmentData = (attachment_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM work_application_attachment WHERE attachment_id = ?`;
		pool.query(query, attachment_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows[0]);
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from getAttachmentData() :>> ', error);
			return {
				error: error.message
			};
		});

const getAttachmentsInApplication = (application_id) =>
	new Promise((resolve, reject) => {
		const query = `SELECT * FROM work_application_attachment WHERE application_id = ?`;
		pool.query(query, application_id, function (err, rows, fields) {
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
		.catch((error) => {
			console.log('error from getAttachmentsInApplication() :>> ', error);
			return {
				error: error.message
			};
		});

function Attachment({ attachment_id, application_id, file_name, file_url, file_type }) {
	(this.attachment_id = attachment_id),
		(this.application_id = application_id),
		(this.file_name = file_name),
		(this.file_url = file_url),
		(this.file_type = file_type);
}

const setResourceCounterFieldToTrue = (ids) =>
	new Promise((resolve, reject) => {
		const query =
			`UPDATE work_application_resource SET counter = 'true' WHERE resource_id IN (` +
			ids.map((id) => `'${id}'`) +
			`)`;

		pool.query(query, ids, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					updateApplication: true,
					message: 'counter field updated.'
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from setResourceCounterFieldToTrue() :>> ', error);
			return { error: error.message };
		});

const createCounter = (counter, application_id) =>
	new Promise((resolve, reject) => {
		const query = `INSERT INTO work_application_counter(counter_id, application_id, resource_id, new_rate, new_currency, resource_change, rate_change) VALUES ?`;

		pool.query(
			query,
			[
				counter.map((e) => [
					uuidv4(),
					application_id,
					e.resource_id,
					e.new_rate === undefined ? null : e.new_rate,
					e.new_currency === undefined ? null : e.new_currency,
					e.resource_change === undefined ? null : e.resource_change,
					e.rate_change === undefined ? null : e.rate_change
				])
			],
			function (err, rows, fields) {
				if (err) {
					reject(err);
				} else {
					resolve({
						updateApplication: true,
						message: 'counter data updated.'
					});
				}
			}
		);
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from createCounter() :>> ', error);
			return { error: error.message };
		});

async function counterOffer(application_id, counter) {
	const ids = await getIds(counter);
	const counterUpdate = await setResourceCounterFieldToTrue(ids);
	const data = await createCounter(counter, application_id);

	return data;
}

async function getIds(counter) {
	let ids = [];

	counter.forEach((e) => {
		if (
			(e.resource_id !== null || e.resource_id !== undefined) &&
			(e.resource_change === 'true' || e.rate_change === 'true')
		) {
			ids.push(e.resource_id);
		} else {
			return { message: 'incorrect data in request' };
		}
	});

	return ids;
}

const updateResourceCounterFieldtoFalse = (application_id) =>
	new Promise((resolve, reject) => {
		const query = `UPDATE work_application_resource SET counter = 'false' WHERE work_application_resource.application_id = ?`;

		pool.query(query, application_id, function (err, rows, fields) {
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
		.catch((error) => {
			console.log('error from updateResourceCounterFieldtoFalse() :>> ', error);
			return { error: error.message };
		});

const deleteCounterData = (application_id) =>
	new Promise((resolve, reject) => {
		const query = `DELETE FROM work_application_counter WHERE application_id = ?`;

		pool.query(query, application_id, function (err, rows, fields) {
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
		.catch((error) => {
			console.log('error from deleteCounterData() :>> ', error);
			return { error: error.message };
		});

async function resolveCounterOffer(application_id) {
	const updateCounter = await updateResourceCounterFieldtoFalse(application_id); //remove counter data from table work_application_counter
	if (updateCounter.hasOwnProperty('error') || updateCounter === null || updateCounter === undefined) {
		return { message: 'Unable to process request. Please check format and correctness of fields.' };
	}

	const data = await deleteCounterData(application_id); //update counter field to work_application_resource.counter
	if (data.hasOwnProperty('error') || data === null || data === undefined) {
		return data;
	}

	return { message: 'Counter offer resolved', counterDataDelete: true, counterFieldUpdateToFalse: true };
}

/** Delete Application */
const deleteAllworkApplication = (application_id) =>
	new Promise((resolve, reject) => {
		const query = 'DELETE FROM work_application WHERE application_id=?';
		pool.query(query, [application_id], function (err, rows, result) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve('sucessfully deleted from work_application Table');
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			return error;
		});

const deleteWorkApplicationAnswer = (application_id) =>
	new Promise((resolve, reject) => {
		const query = 'DELETE FROM work_application_answer WHERE application_id=?';
		pool.query(query, [application_id], function (err, rows, result) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve('sucessfully deleted from work_application_answer Table');
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			return error;
		});

const deleteworkApplicationAttachment = (application_id) =>
	new Promise((resolve, reject) => {
		const query = 'DELETE FROM work_application_attachment WHERE application_id=?';
		pool.query(query, [application_id], function (err, rows, result) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve('sucessfully deleted from work_application_attachment Table');
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			return error;
		});

const deleteworkApplicationResource = (application_id) =>
	new Promise((resolve, reject) => {
		const query = 'DELETE FROM work_application_resource WHERE application_id=?';
		pool.query(query, [application_id], function (err, rows, result) {
			if (err) {
				reject({ error: err.message });
			} else {
				resolve('sucessfully deleted from work_application_resource Table');
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			return error;
		});

async function delete_data_application(application_id) {
	const workApplication = await deleteAllworkApplication(application_id);
	const WorkApplicationAnswer = await deleteWorkApplicationAnswer(application_id);
	const workApplicationAttachment = await deleteworkApplicationAttachment(application_id);
	const workApplicationResource = await deleteworkApplicationResource(application_id);

	let response = {
		workApplication: workApplication,
		WorkApplicationAnswer: WorkApplicationAnswer,
		workApplicationAttachment: workApplicationAttachment,
		workApplicationResource: workApplicationResource
	};

	return response;
}

/** Accept proposal */

async function acceptProposal({ application_id, work_id } = data) {
	//set status for all id except this.apid to 'Rejected' [BULK api] [DONE]
	//set 1 to 'Accepted' [DONE]
	//move to 'Projects' [TODO]

	try {
		const setAlltoRejected = await setApplicationsToRejectedBulk(application_id, work_id);
		const setToAccepted = await updateApplication({ application_status: 'Accepted' }, application_id);
		return { setAlltoRejected, setToAccepted };
	} catch (error) {
		return { error: error.message };
	}
}

const setApplicationsToRejectedBulk = (application_id, work_id) =>
	new Promise((resolve, reject) => {
		const query = `UPDATE work_application SET application_status = 'Rejected' WHERE work_id = ? AND NOT application_id = ? `;

		pool.query(query, [work_id, application_id], function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve({
					updateApplications: true,
					message: 'status updated.'
				});
			}
		});
	})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log('error from setApplicationsToRejectedBulk() :>> ', error);
			return { error: error.message };
		});



const deleteWorkApplicationByWorkid = (work_id) =>
      new Promise((resolve, reject) => {
      const query = `DELETE FROM work_application WHERE work_id=? `;

      pool.query(query, work_id, function (err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  })
    .then((response) => {
      return {
        message: " workApplication(s) deleted successfully",
      };
    })
    .catch((error) => {
      console.log("error from deleteWorkApplication() :>> ", error);
      return { error: error.message };
    });


const deleteWorkApplicationAnswerByWorkid = (work_id) =>
      new Promise((resolve, reject) => {
      const query = `DELETE FROM work_application_answer 
                                    WHERE
                                          application_id IN 
                                          (SELECT application_id
                                                FROM
                                                      work_application
                                                WHERE
                                                      work_id = ? ) `;

    pool.query(query, work_id, function (err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  })
    .then((response) => {
      return {
        message: " workApplicationAnswer(s) deleted successfully",
      };
    })
    .catch((error) => {
      console.log("error from deleteWorkApplicationAnswer() :>> ", error);
      return { error: error.message };
    });

const deleteWorkApplicationAttachmentByWorkid = (work_id) =>
  new Promise((resolve, reject) => {
    const query = `DELETE FROM work_application_attachment 
                              WHERE
                                    application_id IN (SELECT 
                                                            application_id
                                                      FROM
                                                            work_application
                                                      WHERE 
                                                            work_id = ? );`;
    pool.query(query, work_id, function (err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  })
    .then((response) => {
      return {
        message: " workApplicationAttachment(s) deleted successfully",
      };
    })
    .catch((error) => {
      console.log("error from deleteWorkApplicationAttachment() :>> ", error);
      return { error: error.message };
    });

const deleteWorkApplicationResourceByWorkid = (work_id) =>
  new Promise((resolve, reject) => {
    const query = `DELETE FROM work_application_resource 
                                    WHERE
                                          application_id IN (SELECT 
                                                      application_id
                                                FROM
                                                      work_application
                                                WHERE 
                                                      work_id = ? );`;
    pool.query(query, work_id, function (err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  })
    .then((response) => {
      return {
        message: " workApplicationResource(s) deleted successfully",
      };
    })
    .catch((error) => {
      console.log("error from deleteWorkApplicationResource() :>> ", error);
      return { error: error.message };
    });

const deleteWorkApplicationCounterByWorkid = (work_id) =>
  new Promise((resolve, reject) => {
    const query = `DELETE FROM work_application_counter 
                        WHERE
                              application_id IN (SELECT 
                                                application_id
                                          FROM
                                                work_application
                                          WHERE 
                                                work_id = ? );`;
    pool.query(query, work_id, function (err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  })
    .then((response) => {
      return {
        message: " workApplicationCounter(s) deleted successfully",
      };
    })
    .catch((error) => {
      console.log("error from deleteWorkApplicationCounter() :>> ", error);
      return { error: error.message };
    });

async function delete_application_by_workid(work_id) {
  const WorkApplicationAnswerByWorkid = await deleteWorkApplicationAnswerByWorkid(work_id);
  const workApplicationAttachmentByWorkid = await deleteWorkApplicationAttachmentByWorkid(work_id);
  const workApplicationResourceByWorkid = await deleteWorkApplicationResourceByWorkid(work_id);
  const workApplicationCounterByWorkid = await deleteWorkApplicationCounterByWorkid(work_id);
  const workApplicationByWorkid = await deleteWorkApplicationByWorkid(work_id);

  let response = {
    workApplication: workApplicationByWorkid,
    WorkApplicationAnswer: WorkApplicationAnswerByWorkid,
    workApplicationAttachment: workApplicationAttachmentByWorkid,
    workApplicationResource: workApplicationResourceByWorkid,
    workApplicationCounter: workApplicationCounterByWorkid,
  };

  return response;
}


module.exports = {
	addApplicantCountToWorks,
	getApplicantCountForWork,
	createApplication,
	getMyApplications,
	viewOneApplication,
	createAttachment,
	getAttachmentData,
	deleteAttachment,
	getAttachmentsInApplication,
	createCounter,
	setResourceCounterFieldToTrue,
	counterOffer,
	resolveCounterOffer,
	updateApplication,
	delete_data_application,
	acceptProposal,
	checkValidApplication,
	getSquadData,
      delete_application_by_workid
};
