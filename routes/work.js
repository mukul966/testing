const express = require('express');
const dayjs = require('dayjs');
const multer = require('multer');
const gcpStorage = require('../services/gcp-storage');
const workHelper = require('../helpers/work/workHelper');
const skillHelper = require('../helpers/work/skillHelper');
const resourceHelper = require('../helpers/work/resourceHelper');
const questionnaireHelper = require('../helpers/work/questionnaireHelper');
const applicationHelper = require('../helpers/work/applicationHelper');
const { helperFn_shareWorkExternal } = require('../helpers/emailHelper');
const { sendMail } = require('../services/email');
const { createBookmark, getBookmarks, deleteBookmark, checkBookmark } = require('../helpers/work/bookmarkHelper');
//onst router = new express.Router();
const router = express();
router.use(express.json());
const multerMemStorageDocs = multer.memoryStorage(); //[TODO] check if stream is a better option
const upload = multer({ storage: multerMemStorageDocs });

/** Prototype - Create Work */
router.post('/createWork', async (req, res) => {
	if (!req.body.squad_id) {
		return res.status(500).send({ message: `Mandatory field(s): 'squad_id'.` });
	}

	const { squad_id } = req.body;
	const work = await workHelper.createWork(squad_id);

	if (work.hasOwnProperty('error')) {
		return res.send(work);
	}

	return res.status(201).send(work);
});

router.post('/getWork', async (req, res) => {
	if (!req.body.work_id) {
		return res.status(500).send({ message: `Mandatory field(s): 'work_id'.` });
	}

	const { work_id } = req.body;

	const check = await workHelper.checkValidWork(work_id);
	if (check.isValidWork === false) {
		return res.status(200).send({ message: `Invalid work_id. Work cannot be found`, work: {} }); // check valid work. if yes, proceed else delete
	}

	const workDetails = await workHelper.getWorkDetails(work_id);
	const skills = await skillHelper.getAllSkills(work_id);
	const resources = workDetails.project_type === 0 ? await resourceHelper.getAllResources(work_id) : null;
	const milestones = workDetails.project_type === 2 ? await workHelper.getMilestones(work_id) : null;
	const questionnaire = await questionnaireHelper.getAllQuestionnaire(work_id);

	workDetails.skills = skills;
	workDetails.resource_hourly_rate = resources;
	workDetails.milestones = milestones;
	workDetails.questionnaire = questionnaire;

	if (workDetails.hasOwnProperty('error')) {
		return res.status(500).send({ error: workDetails.error });
	}

	return res.send(workDetails);
});

router.post('/updateWork', async (req, res) => {
	req.body = { ...req.body.work };

	if (!req.body.work_id) {
		return res.status(500).send({ message: `Mandatory field(s): 'work_id'.` });
	}

	const { work_id } = req.body; //[TODO] check if work_id is valid/not

	delete req.body.work_id;
	delete req.body.squad_id;
	let responseDetails;

	//handling data where seperate tables are involved (skills, resource, questionnaire)
	if (req.body.skills) {
            // deleteSkillByWork_id
		const deleteExistingSkills= await skillHelper.deleteSkillByWork_id(work_id);
            responseDetails = await skillHelper.createSkillBulk(req.body.skills, work_id);
		delete req.body.skills;
	}

	if (req.body.project_type === 0) {
		if (!req.body.resource_hourly_rate) {
			return res.status(500).send({
				message: `Mandatory field: 'resource_hourly_rate' missing.`
			});
		}

		// const { project_type } = req.body;
		// await workHelper.updateWorkDetails({ project_type }, work_id);	//update project_type
		const deleteExistingResource=await resourceHelper.deleteResourceByWork_id(work_id);
            responseDetails = await resourceHelper.createResourceBulk(req.body.resource_hourly_rate, work_id);

		delete req.body.resource_hourly_rate;
	} else if (req.body.project_type === 1) {
		if (!req.body.project_hourly_rate) {
			return res.status(500).send({
				message: `Mandatory field: 'project_hourly_rate' missing.`
			});
		}

		const {
			project_hourly_rate: { currency: projectHR_currency, amount: projectHR_amount }
		} = req.body;

		responseDetails = await workHelper.updateWorkDetails({ projectHR_currency, projectHR_amount }, work_id);

		delete req.body.project_hourly_rate;
	} else if (req.body.project_type === 2) {
		if (!req.body.fixed_fee) {
			return res.status(500).send({ message: `Mandatory field: 'fixed_fee' missing.` });
		}
		const {
			fixed_fee: { currency: fixedHR_currency, amount: fixedHR_amount }
		} = req.body;

		responseDetails = await workHelper.updateWorkDetails({ fixedHR_currency, fixedHR_amount }, work_id);
		//create milestones for fixed fee
		if (req.body.milestones) {
                  const deleteExistingMilestones=await workHelper.deleteWorkMilestoneByWork_id(work_id);
			const { milestones } = req.body;
			const milestone_data = await workHelper.createMilestones(milestones, work_id);
		}

		delete req.body.fixed_fee;
		delete req.body.milestones;
	}

	if (req.body.questionnaire) {
            const deleteExistingQuestion= await questionnaireHelper.deleteQuestionnaireByWork_id(work_id);
		responseDetails = await questionnaireHelper.createQuestionnaireBulk(req.body.questionnaire, work_id);
		delete req.body.questionnaire;
	}

	//handling data for work tables
	if (Object.keys(req.body).length >= 1) {
		//if dates are present format them correctly to DATE type instead of "strings" which we are recieving from frontend.
		if (req.body.start_date) {
			let formatted_start_date = dayjs(req.body.start_date).format('YYYY-MM-DD');
			req.body.start_date = formatted_start_date;
		}

		if (req.body.end_date) {
			let formatted_date = dayjs(req.body.start_date).format('YYYY-MM-DD');
			req.body.start_date = formatted_date;
		}

		responseDetails = await workHelper.updateWorkDetails(req.body, work_id);
	}

	if (responseDetails.hasOwnProperty('error')) {
		return res.status(500).send(responseDetails.error);
	}

	return res.status(201).send(responseDetails);
});

//Update one entry from tables such as - skill, resource, questionnaire
router.post('/updateData', async (req, res) => {
	const table = Object.keys(req.body)[0];
	let details, message, additionalResponseInfo;

	if (table === 'skill') {
		details = await skillHelper.updateSkill({
			...req.body[`${table}`]
		});
		message = 'Skill Updated';
	} else if (table === 'questionnaire') {
		details = await questionnaireHelper.updateQuestionnaire({
			...req.body[`${table}`]
		});
	} else if (table === 'resource') {
		details = await resourceHelper.updateResource({
			...req.body[`${table}`]
		});
	}

	return res.status(200).send({
		...details
	});
});

//Delete one entry from tables such as - skill, resource, questionnaire
router.post('/deleteData', async (req, res) => {
	const table = Object.keys(req.body)[0];
	let details, message;

	if (table === 'skill') {
		details = await skillHelper.deleteSkill({
			...req.body[`${table}`]
		});
	} else if (table === 'resource') {
		details = await resourceHelper.deleteResource({
			...req.body[`${table}`]
		});
	} else if (table === 'questionnaire') {
		details = await questionnaireHelper.deleteQuestionnaire({
			...req.body[`${table}`]
		});
	}

	return res.status(200).send({
		...details
	});
});

router.post('/deleteMilestone', async (req, res) => {
	if (!req.body.milestone_id) {
		return res.status(500).send({
			message: `Mandatory field(s): 'milestone_id' missing.`
		});
	}

	const { milestone_id } = req.body;

	const data = await workHelper.deleteWorkMilestone(milestone_id);

	return res.status(200).send({
		message: 'Milestone data deleted',
		success: true
	});
});

/** Share Work */
router.post('/shareWorkExternal', async (req, res) => {
	/**
	 * details from req.body - company_name, recipient_name, email
	 * send data - work_id
	 */

	// [TODO] create API to check if request exists for the given email. Also, in the table email should be unique
	if (!req.body.work_id || !req.body.external) {
		return res.status(500).send({ message: `Mandatory field(s): 'work_id', 'external' missing.` });
	}

	const { work_id, external } = req.body;

	const share = await workHelper.shareWorkExternalBulk(external, work_id);
	if (share.addToDb === false) {
		return res.status(500).send({ message: 'Sharing process failed.' });
	}

	const { shareWorkData } = share;

	let messages = await helperFn_shareWorkExternal(shareWorkData); //prepare body for email call(multiple mails)
	let sendMailData = await Promise.all(messages).then((e) => {
		return e;
	});

	const shootMail = await sendMail(sendMailData); //send mail
	if (shootMail.hasOwnProperty('error')) {
		return res.status(500).send(shootMail);
	}
	res.status(200).send({ addToDB: share.addToDB, mail: shootMail });
});

//share work with squad(s)
router.post('/shareWork', async (req, res) => {
	/** [TODO]
	 * Cases(2):
	 * 	2.1 When squad exists on Workwall. Add to work_shared table, send out mail to each.
	 *  2.2 When squad does not exist on Workwall. Send out only mail.
	 */
	if (!req.body.work_id || !req.body.squads) {
		//req.body.squads contains [squad_id(s)]
		return res.status(500).send({ message: `Mandatory field(s): 'work_id', 'squad_id'` });
	}

	const { work_id, squads } = req.body;
	const data = await workHelper.shareWorkWithSquadBulk(work_id, squads);
	//[TODO] send mail to every squad

	if (data.hasOwnProperty('error')) {
		return res.status(500).send(data);
	}

	return res.status(200).send(data);
});

router.post('/updateWorkRequest', async (req, res) => {
	if (!req.body.work_id || !req.body.squad_id) {
		return res.status(500).send({
			message: `Mandatory field(s): 'work_id', 'squad_id' missing.`
		});
	}

	if (!req.body.work_request_status) {
		return res.status(500).send({
			message: `Mandatory field(s): 'work_request_status' missing.`
		});
	}

	const { work_id, work_request_status, squad_id } = req.body;
	const data = await workHelper.updateWorkRequestStatus(work_request_status, work_id, squad_id);

	if (data.hasOwnProperty('error')) {
		return res.status(500).send(data);
	}

	return res.status(200).send(data);
});

/** Prototype - Shared with me */
router.post('/sharedWithMe', async (req, res) => {
	if (!req.body.squad_id) {
		return res.status(500).send({ message: `Mandatory field(s): 'squad_id'` });
	}

	const { squad_id } = req.body;

	const data = await workHelper.workSharedWithMe(squad_id); //work-data shared with me

	if (data.hasOwnProperty('error')) {
		return res.status(500).send({ error: data.error });
	}

	res.status(200).send(data);
});

router.post('/clientStats', async (req, res) => {
	if (!req.body.squad_id) {
		return res.status(500).send({ message: `Mandatory field: 'squad_id'` });
	}

	const { squad_id } = req.body;

	const stats = await workHelper.getClientStats(squad_id);

	//hardcode data
	stats.average_project_value = 'N/A';
	stats.hiring_rate = 'N/A';

	if (stats.hasOwnProperty('error')) {
		return res.status(500).send({ error: stats.error });
	}

	return res.send(stats);
});

/** Prototype - Created by me */
router.post('/createdByMe', async (req, res) => {
	if (!req.body.squad_id) {
		return res.status(500).send({ message: `Mandatory field(s): 'squad_id'` });
	}

	const { squad_id } = req.body;

	const data = await workHelper.createdByMe(squad_id);

	if (data.hasOwnProperty('error')) {
		return res.status(500).send(data);
	}

	res.status(200).send(data);
});

//[TBD]create params here. would be beneficial in creating a job link.
router.post('/viewWork', async (req, res) => {
	if (!req.body.work_id) {
		return res.status(500).send({ message: `Mandatory field(s): 'work_id'.` });
	}

	const { work_id } = req.body;

	const workDetails = await workHelper.viewWork(work_id);

	const resources = workDetails.project_type === "Resource hourly rate" ? await resourceHelper.getAllResources(work_id) : null;
	const milestones = workDetails.project_type === "Fixed fee" ? await workHelper.getMilestones(work_id) : null;

	workDetails.resources = resources;
	workDetails.milestones = milestones;

	if (workDetails.hasOwnProperty('error')) {
		return res.status(500).send({ error: workDetails.error });
	}

	return res.send(workDetails);
});

router.post('/myWorkStats', async (req, res) => {
	if (!req.body.work_id) {
		return res.status(500).send({ message: `Mandatory field(s): 'work_id'` });
	}

	const { work_id } = req.body;

	const stats = await workHelper.createdByMeViewWorkStat(work_id);
      
	stats.job_link = `vmsproject-f655f.web.app/work/viewWork/${work_id}`;

	if (stats.hasOwnProperty('error')) {
		return res.status(500).send({ error: stats.error });
	}

	return res.send(stats);
});

/**
 * [ADD] stat-route(s) for viewing a particular work.
 * Scenario: 1.createdByMe screen - DONE
 * 			 2.marketplace screen
 */

/** Prototype - Marketplace */
router.post('/marketplace', async (req, res) => {
	const data = await workHelper.marketPlace();

	if (data.hasOwnProperty('error')) {
		return res.status(500).send(data);
	}

	res.status(200).send(data);
});

router.post('/apply', async (req, res) => {
	if (!req.body.work_id || !req.body.squad_id) {
		return res.status(500).send({ message: `Mandatory field(s): 'squad_id', 'work_id` });
	}

	const { squad_id, work_id } = req.body;
	const application = await applicationHelper.createApplication(work_id, squad_id);

	if (application.hasOwnProperty('error')) {
		return res.send(application);
	}

	return res.status(201).send(application);
});

router.post('/updateApp', async (req, res) => {
	let data = { ...req.body.application };
	if (!data.application_id) {
		return res.status(500).send({ message: `Mandatory field: 'application_id'` });
	}

	const { application_id } = data;

	delete data.application_id;
	delete data.work_id;
	delete data.squad_id;

	let response_details;

	if (data.resources) {
		response_details = await resourceHelper.createResources(data.resources, application_id);
		delete data.resources;
	}

	if (data.answers) {
		response_details = await questionnaireHelper.createAnswers(data.answers, application_id);
		delete data.questionnaire;
	}

	if (data.complete || data.application_status) {
		response_details = await applicationHelper.updateApplication(data, application_id); //updates 2 fields for table: application. 'application_staus' & 'complete'
	}

	return res.status(201).send(response_details);
});

router.post('/searchMarketplace', async (req, res) => {
	//searching on basis of work_name
	if (!req.body.keyword) {
		return res.status(400).send({ error: `Missing field: 'keyword'` });
	}
	const { keyword } = req.body;
	const searchData = await workHelper.searchMarketPlace(keyword);

	if (searchData.hasOwnProperty('error')) {
		return res.send(searchData);
	}

	return res.status(200).send(searchData);
});

/** Prototype - My Applications */
router.post('/applications', async (req, res) => {
	if (!req.body.work_id) {
		return res.status(500).send({ message: `Mandatory field: 'work_id'` });
	}

	const { work_id } = req.body;

	const data = await workHelper.getAllApplicationsForWork(work_id);

	if (data.hasOwnProperty('error')) {
		return res.status(500).send(data);
	}

	res.status(200).send(data);
});

// [TODO][WIP] review this route again.
router.post('/viewOneApp', async (req, res) => {
	if (!req.body.application_id) {
		return res.status(500).send({ message: `Mandatory field: 'application_id'` });
	}

	const { application_id } = req.body;

	const check = await applicationHelper.checkValidApplication(application_id);
	if (check.isValidApplication === false) {
		return res
			.status(200)
			.send({ message: `Invalid application_id. Application cannot be found`, application: {} }); // check valid work. if yes, proceed else delete
	}

	const data = await applicationHelper.viewOneApplication(application_id);

	if (data.hasOwnProperty('error') || data === null || data === undefined) {
		return res.status(500).send(data);
	}

	res.status(200).send(data);
});

router.post('/myApps', async (req, res) => {
	if (!req.body.squad_id) {
		return res.status(500).send({ message: `Mandatory field: 'squad_id'` });
	}
	const { squad_id } = req.body;

	const data = await applicationHelper.getMyApplications(squad_id);

	if (data.hasOwnProperty('error')) {
		return res.status(500).send(data);
	}

	res.status(200).send({ applications: { ...data } });
});

/** Document upload/delete routes */
router.post('/uploadDocument', upload.single('document'), async (req, res) => {
	if (!req.body.application_id || !req.body.squad_id) {
		return res.status(500).send({ message: `Mandatory field(s): 'application_id', 'squad_id'` });
	}

	if (!req.file || !req.file.fieldname === 'document') {
		return res.status(400).send({
			message: `Mandatory field(s): 'document' missing. Please refer documentation for correct format.`
		});
	}

	const { application_id, squad_id } = req.body;

	const { mimetype, buffer: imageBuffer } = req.file;
	const fileNameWithPrefix = `squad/${squad_id}/applications/${application_id}/${req.file.originalname}`; //adding squad_id which acts as a folder for the image. So all the data goes to the folder of the corresponding squad_id.

	//first UI should display list of all files which are available for upload. [API] list all files
	/*[TODO][ENHANCEMENT][FEATURE]
		if file already exists in the system, 
			skip upload create an entry in attachment table
			else upload and create entry.
	*/

	//before uploading check if file with same name exists? gcp rewrites the file with same name by itself.
	const cloud = await gcpStorage.uploadFromMemory(fileNameWithPrefix, imageBuffer); //takes in buffer for uploading file
	if (cloud.hasOwnProperty('error')) {
		return res.status(500).send(cloud);
	}

	const data = await applicationHelper.createAttachment({
		application_id,
		name: fileNameWithPrefix,
		url: cloud.link,
		type: mimetype
	});

	if (data.hasOwnProperty('error')) {
		return res.status(500).send(data);
	}

	res.status(200).send({ cloud, data });
});

router.post('/removeDocument', async (req, res) => {
	if (!req.body.attachment_id) {
		return res.status(500).send({ message: `Mandatory field(s): 'application_id', 'squad_id'` });
	}

	const { attachment_id } = req.body;

	const attachment_data = await applicationHelper.getAttachmentData(attachment_id);

	if (attachment_data === undefined) {
		return res.status(200).send({ success: false, fileFound: false, message: 'File not found' });
	}

	const { file_name } = attachment_data;

	const cloud = await gcpStorage.deleteFile(file_name);
	const data = await applicationHelper.deleteAttachment(attachment_id);

	if (data.hasOwnProperty('error')) {
		return res.status(500).send(data);
	}

	res.status(200).send({ cloud, data });
});

/** Bookmark work */
router.post('/createBookmark', async (req, res) => {
	if (!req.body.squad_id || !req.body.work_id) {
		return res.status(500).send({ message: `Mandatory field(s): 'squad_id','work_id'.` });
	}

	const { squad_id, work_id } = req.body;

	const create_bookmark = await createBookmark(squad_id, work_id);
	// const updateWorkField = await workHelper.updateWorkDetails({ bookmarked: 'true' }, work_id);

	if (create_bookmark.hasOwnProperty('error') || create_bookmark === null || create_bookmark === undefined) {
		return res.status(500).send(create_bookmark);
	}

	res.status(201).send(create_bookmark);
});

router.post('/workBookmarks', async (req, res) => {
	if (!req.body.squad_id) {
		return res.status(500).send({ message: `Mandatory field(s): 'squad_id' missing'.` });
	}

	const { squad_id } = req.body;

	const bookmarks = await getBookmarks(squad_id);

	if (bookmarks.hasOwnProperty('error') || bookmarks === null || bookmarks === undefined) {
		return res.status(500).send(bookmarks);
	}

	res.status(200).send(bookmarks);
});

router.post('/deleteBookmark', async (req, res) => {
	if (!req.body.bookmark_id) {
		return res.status(500).send({ message: `Mandatory field(s): 'bookmark_id'.` });
	}
	const { bookmark_id } = req.body;

	const data = await deleteBookmark(bookmark_id);

	if (data.hasOwnProperty('error') || data === null || data === undefined) {
		return res.status(500).send(data);
	}
	res.send(data);
});

router.post('/isBookmark', async (req, res) => {
	if (!req.body.work_id || !req.body.squad_id) {
		return res.status(500).send({ message: `Mandatory field(s): 'work_id', 'squad_id'` });
	}

	const { work_id, squad_id } = req.body;

	const bookmarks = await checkBookmark(squad_id, work_id);

	if (bookmarks.hasOwnProperty('error') || bookmarks === null || bookmarks === undefined) {
		return res.status(500).send(bookmarks);
	}

	res.status(200).send(bookmarks);
});

/** Counter for application */
router.post('/counterOffer', async (req, res) => {
	if (!req.body.application_id) {
		return res.status(500).send({ message: `Mandatory field(s): 'application_id'` });
	}

	const { application_id, counter } = req.body;

	const data = await applicationHelper.counterOffer(application_id, counter);

	if (data.hasOwnProperty('error')) {
		return res.send(data);
	}

	return res.status(201).send(data);
});

router.post('/resolveCounter', async (req, res) => {
	if (!req.body.application_id) {
		return res.status(500).send({ message: `Mandatory field(s): 'application_id'` });
	}

	const { application_id } = req.body;

	const data = await applicationHelper.resolveCounterOffer(application_id);

	if (data.hasOwnProperty('error')) {
		return res.send(data);
	}

	return res.status(201).send(data);
});

router.post('/acceptProposal', async (req, res) => {
	if (!req.body.application_id || !req.body.work_id) {
		return res.status(500).send({ message: `Mandatory field(s): 'application_id', 'work_id'` });
	}

	// const { application_id, work_id } = req.body;

	const data = await applicationHelper.acceptProposal(req.body);

	if (data.hasOwnProperty('error')) {
		return res.send(data);
	}

	return res.status(201).send(data);
});

/** Delete Work */
router.post('/deleteWork', async (req, res) => {
	if (!req.body.work_id) {
		return res.status(500).send({
			message: `Mandatory field(s): 'work_id' missing.`
		});
	}

	const { work_id } = req.body; 

	const response = await workHelper.delete_data_work(work_id);
      const deleteWorkApplication= await applicationHelper.delete_application_by_workid(work_id);

	return res.status(200).send({
		message: 'Work data deleted',
		success: true
	});
});

router.post('/deleteApplication', async (req, res) => {
	if (!req.body.application_id) {
		return res.status(500).send({
			message: `Mandatory field(s): 'application_id' missing.`
		});
	}

	const { application_id } = req.body;

	const response = await applicationHelper.delete_data_application(application_id);

	return res.status(200).send({
		message: 'Application data deleted',
		success: true
	});
});

router.post("/checkApplication", async (req, res) => {
	if (!req.body.work_id || !req.body.squad_id) {
		return res.status(500).send({
			message: `Mandatory field(s): 'work_id', 'squad_id' missing.`
		});
	}

	const { work_id, squad_id } = req.body;

	const check = await workHelper.checkApplication(work_id, squad_id);

	if (check.hasOwnProperty("error")) {
		return res.status(500).send({ error: check.error });
	}

	return res.send(check);

});

module.exports = router;
//router.listen(9000);