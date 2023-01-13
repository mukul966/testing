const router = require('express').Router();
const squadHelper = require('../helpers/squad/squadHelper');
const projectHelper = require('../helpers/squad/projectHelper');
const memberHelper = require('../helpers/squad/memberHelper');
const serviceHelper = require('../helpers/squad/serviceHelper');
const reviewHelper = require('../helpers/squad/reviewHelper');
const clientHelper = require('../helpers/squad/clientHelper');
const allianceHelper = require('../helpers/squad/allianceHelper');
const partnerHelper = require('../helpers/squad/partnerHelper');
const { getImageData: getSquadBgImage } = require('../helpers/squad/squadBgImageHelper');
const { getProfImageData: getProfileImage } = require('../helpers/squad/squadProfileImageHelper');
const { helperFn_createRequestExtBulk } = require('../helpers/emailHelper');
const { sendMail } = require('../services/email');

const dotenv = require('dotenv');
const dbhelper = require('./dbhelper');
const middleware = require('./middleware');
var connection = dbhelper.getconnection();

dotenv.config();

router.post('/createSquad', async (req, res) => {
	try {
		if (!req.body.squad_name || !req.body.user_id) {
			throw new Error('Mandatory field(s): squad_name, user_id');
		}
		//[TODO] update image(image_id) of user to member table
		const squad = await squadHelper.createSquad(req.body.squad_name, req.body.legal_name);
		if (squad.hasOwnProperty('error')) {
			return res.send({ error: squad.error });
		}

		await memberHelper.createMember({
			squad_id: squad.squad_id,
			user_id: req.body.user_id,
			member_role: 'owner'
		}); //adding owner to member table

		res.status(201).send({
			squad_id: squad.squad_id,
			message: 'Squad Created & Member Added as owner to Member Table.'
		});
	} catch (error) {
		console.log('error from /createSquad route :>> ', error);
		return res.status(500).send({ error: error.message });
	}
});

router.post('/getSquadTable', async (req, res) => {
	try {
		if (!req.body.squad_id) {
			return res.status(400).send({ error: 'Mandatory field missing: squad_id' });
		}

		const { squad_id } = req.body;
		const squad = await squadHelper.getOnlySquadTable(squad_id);

		res.status(200).send(squad);
	} catch (error) {
		console.log('error from /getSquadTable :>> ', error);
		return res.status(500).send({ error: error.message });
	}
});

router.post('/checkSquadName', async (req, res) => {
	try {
		if (!req.body.squad_name) {
			throw new Error('Mandatory field missing: squad_name');
		}

		const { squad_name } = req.body;

		const result = await squadHelper.checkSquadName(squad_name);
		res.status(200).send(result);
	} catch (error) {
		console.log('error :>> ', error);
		return res.status(500).send({ error: error.message });
	}
});

router.post('/updateSquad', async (req, res) => {
	/**
	 * UPDATE for tables - squad, project, member, review, service
	 * CREATE for tables - project, member, review, service (all except squad)
	 *
	 * To use this dynamic route.
	 * 		Send request with the respective tableName_id to update the particular entry.
	 * 		To create a new entry send request without the respective tableName_id.
	 * 		Differentiating factor is tableName_id.
	 */
	try {
		const table = Object.keys(req.body)[0];
		let details, message, additionalResponseInfo;

		if (table === 'squad') {
			details = await squadHelper.updateSquadDetails({
				...req.body[`${table}`]
			});
			message = 'Squad Updated';
		} else if (table === 'project') {
			details = await updateProjectHelper({
				...req.body[`${table}`]
			});
		} else if (table === 'member') {
			details = await updateMemberHelper({
				...req.body[`${table}`]
			});
		} else if (table === 'review') {
			details = await updateReviewHelper({
				...req.body[`${table}`]
			});
		} else if (table === 'service') {
			details = await updateServiceHelper({
				...req.body[`${table}`]
			});
		} else if (table === 'client') {
			details = await updateClientHelper({
				...req.body[`${table}`]
			});
		} else if (table === 'alliance') {
			details = await updateAllianceHelper({
				...req.body[`${table}`]
			});
		}

		console.log('Response instance (Error) :>> ', details instanceof Error);
		if (details instanceof Error) {
			throw new Error(details);
		}

		res.send({
			message,
			...details
		});
	} catch (error) {
		return res.status(500).send({ error: error.message });
	}
});

//Delete one entry from tables such as - project, member, review, service, client, alliance
router.post('/deleteOne', async (req, res) => {
	try {
		const table = Object.keys(req.body)[0];
		let details, message;

		if (table === 'project') {
			details = await projectHelper.deleteProject({
				...req.body[`${table}`]
			});
		} else if (table === 'member') {
			details = await memberHelper.removeOne({
				...req.body[`${table}`]
			});
		} else if (table === 'review') {
			details = await reviewHelper.removeOne({
				...req.body[`${table}`]
			});
		} else if (table === 'service') {
			details = await serviceHelper.removeOne({
				...req.body[`${table}`]
			});
		} else if (table === 'client') {
			details = await clientHelper.removeOne({
				...req.body[`${table}`]
			});
		} else if (table === 'alliance') {
			details = await allianceHelper.removeOne({
				...req.body[`${table}`]
			});
		}

		console.log('Response instance (Error) :>> ', details instanceof Error);
		if (details instanceof Error) {
			throw new Error(details);
		}

		res.send({
			...details
		});
	} catch (error) {
		return res.status(500).send({ error: error.message });
	}
});

router.post('/deleteSquad', async (req, res) => {
	const { squad_id } = req.body;

	const removeProjects = await projectHelper.deleteAllProjects(squad_id);
	const removeMembers = await memberHelper.deleteAllMembers(squad_id);
	const removeReviews = await reviewHelper.deleteAllReviews(squad_id);
	const removeServices = await serviceHelper.deleteAllServices(squad_id);
	const removeClients = await clientHelper.deleteAllClients(squad_id);
	const removeAlliances = await allianceHelper.deleteAllAlliances(squad_id);
	const removeSquad = await squadHelper.deleteSquad(squad_id);

	if (removeProjects.error) {
		return res.status(500).send({ removeProjects });
	}

	if (removeMembers.error) {
		return res.status(500).send({ removeMembers });
	}

	if (removeReviews.error) {
		return res.status(500).send({ removeReviews });
	}

	if (removeServices.error) {
		return res.status(500).send({ removeServices });
	}

	if (removeClients.error) {
		return res.status(500).send({ removeClients });
	}

	if (removeAlliances.error) {
		return res.status(500).send({ removeAlliances });
	}

	if (removeSquad.error) {
		return res.status(500).send({ removeSquad });
	}

	res.status(200).send({ message: 'Squad deleted' });
});

router.post('/getSquad', async (req, res) => {
	// Gathers data from all the tables(squad, project, member, review, service). Helper functions do all the processing. Returning squad as a response.
	try {
		const { squad_id } = req.body;

		let squad = await squadHelper.getSquad(squad_id);

		if (squad.error) {
			return res.status(500).send(squad);
		}

		const projects = await projectHelper.getProjects(squad_id);
		const members = await memberHelper.getMembers(squad_id);
		const services = await serviceHelper.getServices(squad_id);
		const reviews = await reviewHelper.getReviews(squad_id);
		const clients = await clientHelper.getClients(squad_id);
		const alliances = await allianceHelper.getAlliances(squad_id);

		if (squad.default_background_image_id !== null) {
			const background_image = await getSquadBgImage(squad.default_background_image_id);
			squad.general.background_image = background_image;
		} else {
			squad.general.background_image = null;
		}

		if (squad.default_profile_image_id !== null) {
			const profile_image = await getProfileImage(squad.default_profile_image_id);
			squad.general.profile_image = profile_image;
		} else {
			squad.general.profile_image = null;
		}

		const orderArray = await getOrderArray(squad_id);
		const hiddenArray = []; //await getHiddenArray(squad_id);
		const multipleArray = await arrayHelper({
			contact_details: squad.general.contact_detail
		}); //card number is added to multipleArray whose data is not filled.
		const rejectedArray = await arrayHelper({
			about_us: squad.general.about_us,
			service: services,
			project: projects,
			linked_account: squad.general.linked_account,
			alliance: alliances,
			client: clients,
			contact_details: squad.general.contact_detail
		});

		squad.general.projects = projects;
		squad.members = members;
		squad.general.offered_services = services;
		squad.general.alliances_and_partnership = alliances;
		squad.general.clients = clients;
		squad.general.ratings = reviews;
		squad.general.order = orderArray;
		squad.general.hidden = hiddenArray;
		squad.general.multiple = multipleArray;
		squad.general.rejected = rejectedArray;

		squad.squad_completion = await calculateSquadCompletion({
			totalCards: orderArray.length - 1, // -1 for add_details card which is used for controlling/keeping track of other cards.
			emptyCards: rejectedArray.length,
			backgroundImage: squad.default_background_image_id,
			profileImage: squad.default_profile_image_id
		});

		//[HOTFIX] update squad.squad_completion here, use it to send that data
		const updateData = await squadHelper.updateSquadDetails({
			squad_id,
			squad_completion: squad.squad_completion
		});

		res.send(squad);
	} catch (e) {
		console.log('error from /squadTable route :>> ', e);
		res.send({ error: e.message });
	}
});

router.post('/getUsersSquad', async (req, res) => {
	try {
		const { user_id } = req.body;
		const data = await memberHelper.getAllSquadIds(user_id); //returns array filled with id's of all squads
		const data2 = await squadHelper.getUsersSquadHelper(data);

		return res.status(200).send(data2);
	} catch (error) {
		console.log('error from /getUsersSquad route :>> ', error);
		res.status(500).send({ error: error.message });
	}
});

//updates only order array. other 2(hidden & rejected) are computed and then sent from backend.
router.post('/updateOrder', async (req, res) => {
	try {
		const { order, squad_id } = req.body;
		const data = await squadHelper.updateOrderArray(order, squad_id);
		if (data.error) {
			return res.status(500).send(data);
		}

		res.status(200).send(data);
	} catch (error) {
		console.log('Error from /updateorder :>> ', error);
		return res.status(500).send({ error });
	}
});

router.post('/getProject', async (req, res) => {
	if (!req.body.project_id) {
		return res.status(400).send({ error: 'Mandatory field: project_id' });
	}
	const { project_id } = req.body;
	const project = await projectHelper.getOneProject(project_id);

	if (project.hasOwnProperty('error')) {
		return res.send(project);
	}

	return res.status(200).send(project);
});

router.post('/getMember', async (req, res) => {
	if (!req.body.member_id) {
		return res.status(400).send({ error: 'Mandatory field: member_id' });
	}
	const { member_id } = req.body;
	const member = await memberHelper.getOneMember(member_id);

	if (member.hasOwnProperty('error')) {
		return res.send(member);
	}

	return res.status(200).send(member);
});

router.post('/getService', async (req, res) => {
	if (!req.body.service_id) {
		return res.status(400).send({ error: 'Mandatory field: service_id' });
	}
	const { service_id } = req.body;
	const service = await serviceHelper.getOneService(service_id);

	if (service.hasOwnProperty('error')) {
		return res.send(service);
	}

	return res.status(200).send(service);
});

router.post('/getReview', async (req, res) => {
	if (!req.body.review_id) {
		return res.status(400).send({ error: 'Mandatory field: review_id' });
	}
	const { review_id } = req.body;
	const review = await reviewHelper.getOneReview(review_id);

	if (review.hasOwnProperty('error')) {
		return res.send(review);
	}

	return res.status(200).send(review);
});

router.post('/getClient', async (req, res) => {
	if (!req.body.client_id) {
		return res.status(400).send({ error: 'Mandatory field: client_id' });
	}
	const { client_id } = req.body;
	const client = await clientHelper.getOneClient(client_id);

	if (client.hasOwnProperty('error')) {
		return res.send(client);
	}

	return res.status(200).send(client);
});

router.post('/getAlliance', async (req, res) => {
	if (!req.body.alliance_id) {
		return res.status(400).send({ error: 'Mandatory field: alliance_id' });
	}
	const { alliance_id } = req.body;
	const alliance = await allianceHelper.getOneAlliance(alliance_id);

	if (alliance.hasOwnProperty('error')) {
		return res.send(alliance);
	}

	return res.status(200).send(alliance);
});

router.post('/getMoreInfo', async (req, res) => {
	if (!req.body.squad_id) {
		return res.status(500).send({ message: `Mandatory field(s): 'squad_id'.` });
	}
	const data = await squadHelper.getSquad(req.body.squad_id);

	if (data.error) {
		return res.status(500).send(data);
	}

	const {
		general: { more_info }
	} = data;

	return res.status(200).send({ more_info });
});

router.post('/searchSquad', async (req, res) => {
	if (!req.body.keyword) {
		return res.status(400).send({ error: `Missing field: 'keyword'` });
	}

	const { keyword } = req.body;
	const searchData = await squadHelper.searchSquad(keyword);

	if (searchData.hasOwnProperty('error')) {
		return res.send(searchData);
	}

	return res.status(200).send(searchData);
});

router.post('/searchResource', async (req, res) => {
	//search user(s) from a particular squad
	if (!req.body.keyword) {
		return res.status(400).send({ error: `Missing field: 'keyword'` });
	}

	const { keyword } = req.body;
	const searchData = await squadHelper.searchSquadUsers(keyword);

	if (searchData.hasOwnProperty('error')) {
		return res.send(searchData);
	}

	return res.status(200).send(searchData);
});

router.post('/createSquadRequest', async (req, res) => {
	if (!req.body.user_id || !req.body.squad_id) {
		return res.status(400).send({ error: `Missing field: 'squad_id', 'user_id` });
	}

	const { squad_id, user_id } = req.body;
	const searchData = await memberHelper.createSquadRequest(squad_id, user_id);
	//generate notification for this.

	if (searchData.hasOwnProperty('error')) {
		return res.send(searchData);
	}

	return res.status(200).send(searchData);
});

router.post('/bulkSquadRequest', async (req, res) => {
	if (!req.body.users || !req.body.squad_id) {
		return res.status(400).send({ error: `Missing field: 'squad_id', 'user_id` });
	}
	const { squad_id, users } = req.body;

	const data = await memberHelper.createMemberRequestBulk(squad_id, users);
	//generate notification for this.

	if (data.hasOwnProperty('error')) {
		return res.send(data);
	}

	return res.status(200).send(data);
});

router.post('/updateSquadRequest', async (req, res) => {
	if (!req.body.squad_id || !req.body.user_id) {
		return res.status(500).send({ message: `Mandatory field(s): 'squad_id', 'user_id'` });
	}

	if (!req.body.request_status) {
		return res.status(500).send({ message: `Mandatory field(s): 'request_status'` });
	}

	const { user_id, request_status, squad_id } = req.body;
	const data = await memberHelper.updateSquadRequest({
		request_status,
		squad_id,
		user_id
	});
	//if accepted - add to squad, remove from db
	//if rejected - remove from db

	if (data.hasOwnProperty('error')) {
		return res.status(500).send(data);
	}

	return res.status(200).send(data);
});

router.post('/userSquadRequest', async (req, res) => {
	if (!req.body.user_id) {
		return res.status(500).send({ message: `Mandatory field: 'user_id'` });
	}

	const { user_id } = req.body;
	const data = await memberHelper.getMemberRequestList(user_id);

	if (data.error) {
		return res.status(500).send(data);
	}

	return res.status(201).send(data);
});

router.post('/squadOwnerData', async (req, res) => {
	if (!req.body.squad_id) {
		return res.status(500).send({ message: `Mandatory field: 'squad_id'` });
	}

	const { squad_id } = req.body;
	const data = await memberHelper.getSquadOwnerData(squad_id);

	if (data.error) {
		return res.status(500).send(data);
	}

	return res.status(200).send(data);
});

router.post('/createRequestExt', async (req, res) => {
	if (!req.body.squad_id) {
		return res.status(500).send({ message: `Mandatory field: 'squad_id'` });
	}

	//ADD check if request from the same user already exists
	const addToDB = await memberHelper.createRequestExternal(
		({ squad_id, email, first_name, last_name, type } = req.body)
	);
	if (addToDB.hasOwnProperty('error')) {
		return res.status(500).send(addToDB);
	}

	const shootMail = await sendEmailExtRequest(email, addToDB.request_id);
	if (shootMail.error) {
		return res.status(500).send(shootMail);
	}

	return res.status(201).send({ ...addToDB, ...shootMail });
});

router.post('/createRequestExtBulk', async (req, res) => {
	if (!req.body.squad_id || !req.body.user_id) {
		return res.status(500).send({ message: `Mandatory field: 'squad_id' & 'user_id'` });
	}

	/**
	API: <url>/squad/checkRequest -> checks if request for the particular email already exists.
		Frontend will prompt email already has a request, ask him/her to accept/decline the previous requests and that recipient-email won't be allowed for another request. 
	*/
	const addToDBBulk = await memberHelper.createRequestExternalBulk(req.body);
	if (addToDBBulk.hasOwnProperty('error')) {
		return res.status(500).send(addToDBBulk);
	}

	const { invites } = addToDBBulk;
	//addToDBBulk.invites has data for invites. Generate link for every object inside it
	let messages = await helperFn_createRequestExtBulk(req.body); //prepare body for email call(multiple mails)
	let m2 = await Promise.all(messages).then((e) => {
		return e;
	});

	const shootMail = await sendMail(m2);
	if (shootMail.error) {
		return res.status(500).send(shootMail);
	}

	return res.status(201).send({ success_addToDB: addToDBBulk.success, ...shootMail }); //remove - addToDBBulk
});

router.post('/updateRequest', async (req, res) => {
	if (!req.body.request_id) {
		return res.status(500).send({ message: `Mandatory field: 'request_id'` });
	}

	const update = await memberHelper.updateExtRequestStatus(({ request_id, request_status } = req.body));
	if (update.hasOwnProperty('error')) {
		return res.status(500).send(update);
	}

	return res.status(201).send(update);
});

router.post('/checkRequest', async (req, res) => {
	if (!req.body.email) {
		return res.status(500).send({ message: `Mandatory field: 'email'` });
	}

	const { email } = req.body;
	const data = await memberHelper.checkRequest(email);

	if (data.error) {
		return res.status(500).send(data);
	}

	return res.status(201).send(data);
});

router.post('/userSquad', async (req, res) => {
	if (!req.body.user_id) {
		return res.status(400).send({ error: `Missing field: 'user_id'` });
	}

	const { user_id } = req.body;

	const data = await squadHelper.getUserSquad(user_id);
	if (data === null || data === undefined) {
		return res.status(200).send([]);
	}

	if (data.hasOwnProperty('error')) {
		return res.status(500).send(data);
	}

	return res.status(200).send(data);
});

router.post('/userSquadExists', async (req, res) => {
	if (!req.body.user_id) {
		return res.status(400).send({ error: `Missing field: 'user_id'` });
	}

	const { user_id } = req.body;
	const data = await squadHelper.squadExistsForUser(user_id);

	if (data.hasOwnProperty('error')) {
		return res.status(500).send({ error: data.error });
	}
	return res.status(200).send(data);
});

router.post('/createPartner', async (req, res) => {
	if (!req.body.user_id || !req.body.squad_id) {
		return res.status(400).send({ error: `Missing field: 'squad_id', 'user_id` });
	}

	const data = await partnerHelper.createPartner(({ squad_id, partner_squad_id } = req.body));

	if (data.hasOwnProperty('error')) {
		return res.send(data);
	}

	return res.status(201).send(data);
});

router.post('/getPartnerships', async (req, res) => {
	if (!req.body.squad_id) {
		return res.status(400).send({ error: 'Mandatory field: squad_id' });
	}
	const { squad_id } = req.body;
	const partners = await partnerHelper.getPartnerSquads(squad_id);

	if (partners.hasOwnProperty('error')) {
		return res.send(partners);
	}

	return res.status(200).send(partners);
});

router.post('/removePartner', async (req, res) => {
	if (!req.body.partner_id) {
		return res.status(400).send({ error: 'Mandatory field: partner_id' });
	}

	const data = await partnerHelper.deletePartner(req.body.partner_id);

	if (data.hasOwnProperty('error')) {
		return res.send(data);
	}

	return res.status(200).send(data);
});

//Project - Create New/Update Existing //Single Project
async function updateProjectHelper(update) {
	try {
		if (!update.hasOwnProperty('project_id')) {
			throw new Error(`Mandatory field 'project_id' missing`);
		}

		//hotfix
		if (update.project_id === 0) {
			//hotfix
			if (update.hasOwnProperty('skills') && update.skills.length > 0) {
				let skillsValue = update.skills.join(',');
				update.skills = skillsValue;
			} else if (update.hasOwnProperty('skills') && update.skills.length === 0) {
				update.skills = null;
			}

			return await projectHelper.createProject(update);
		} else {
			//hotfix
			if (update.hasOwnProperty('skills') && update.skills.length > 0) {
				let skillsValue = update.skills.join(',');
				update.skills = skillsValue;
			} else if (update.hasOwnProperty('skills') && update.skills.length === 0) {
				update.skills = null;
			}

			return await projectHelper.updateProject(update);
		}
	} catch (e) {
		console.log('error from updateProjectHelper-fn :>> ', e);
		return e;
	}
}

//Member - Create New/Update Existing //Single Member
async function updateMemberHelper(update) {
	try {
		if (!update.hasOwnProperty('member_id')) {
			throw new Error(`Mandatory field 'member_id' missing`);
		}

		if (update.member_id === 0) {
			if (!update.hasOwnProperty('squad_id') || !update.hasOwnProperty('user_id')) {
				throw new Error(`Mandatory field(s): 'squad_id' & 'user_id' `);
			}

			return await memberHelper.createMember(update);
		} else {
			return await memberHelper.updateMember(update);
		}
	} catch (e) {
		console.log('error from updateMemberHelper-fn :>> ', e);
		return e;
	}
}

//Review - Create New/Update Existing //Single Review
async function updateReviewHelper(update) {
	try {
		if (!update.hasOwnProperty('review_id')) {
			throw new Error(`Mandatory field 'review_id' missing`);
		}

		if (update.review_id === 0) {
			if (!update.hasOwnProperty('squad_id') || !update.hasOwnProperty('user_id')) {
				throw new Error(`Mandatory field(s): 'squad_id' & 'user_id' `);
			}

			return await reviewHelper.createReview(update);
		} else {
			return await reviewHelper.updateReview(update);
		}
	} catch (e) {
		console.log('error from updateReviewHelper-fn :>> ', e);
		return e;
	}
}

//Service - Create New/Update Existing //Single Service
async function updateServiceHelper(update) {
	try {
		if (!update.hasOwnProperty('service_id')) {
			throw new Error(`Mandatory field 'service_id' missing`);
		}

		if (update.service_id === 0) {
			if (!update.hasOwnProperty('squad_id')) {
				throw new Error(`Mandatory field(s): 'squad_id' missing`);
			}

			//hotfix
			if (update.hasOwnProperty('software') && update.software.length > 0) {
				let softwareValue = update.software.join(',');
				update.software = softwareValue;
			} else if (update.hasOwnProperty('software') && update.software.length === 0) {
				update.software = null;
			}

			return await serviceHelper.createService(update);
		} else {
			//hotfix
			if (update.hasOwnProperty('software') && update.software.length > 0) {
				let softwareValue = update.software.join(',');
				update.software = softwareValue;
			} else if (update.hasOwnProperty('software') && update.software.length === 0) {
				update.software = null;
			}
			return await serviceHelper.updateService(update);
		}
	} catch (e) {
		console.log('error from updateServiceHelper-fn :>> ', e);
		return e;
	}
}

//Client - Create New/Update Existing //Single Client
async function updateClientHelper(update) {
	try {
		if (!update.hasOwnProperty('client_id')) {
			throw new Error(`Mandatory field 'client_id' missing`);
		}

		if (update.client_id === 0) {
			if (!update.hasOwnProperty('squad_id')) {
				throw new Error(`Mandatory field(s): 'squad_id' missing`);
			}

			return await clientHelper.createClient(update);
		} else {
			return await clientHelper.updateClient(update);
		}
	} catch (e) {
		console.log('error from updateClientHelper-fn :>> ', e);
		return e;
	}
}

//Alliance - Create New/Update Existing //Single Alliance
async function updateAllianceHelper(update) {
	try {
		if (!update.hasOwnProperty('alliance_id')) {
			throw new Error(`Mandatory field 'alliance_id' missing`);
		}

		if (update.alliance_id === 0) {
			if (!update.hasOwnProperty('squad_id')) {
				throw new Error(`Mandatory field(s): 'squad_id' missing`);
			}

			return await allianceHelper.createAlliance(update);
		} else {
			return await allianceHelper.updateAlliance(update);
		}
	} catch (e) {
		console.log('error from updateAllianceHelper-fn :>> ', e);
		return e;
	}
}

const OrderArrayHelper = (squad_id) =>
	new Promise((resolve, reject) => {
		let query = 'SELECT order_array FROM squad WHERE squad_id = ?';
		connection.query(query, squad_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows[0]);
			}
		});
	});

async function getOrderArray(squad_id) {
	try {
		let details = await OrderArrayHelper(squad_id).then((response) => {
			return response;
		});

		if (details.order_array === null) {
			return [];
		}

		if (details instanceof Error) {
			throw new Error(details);
		}

		let order = details.order_array.split(',').map(Number);
		return order;
	} catch (error) {
		console.log('error from /getOrderArray-fn :>> ', error);
		return error.message;
	}
}

async function getHiddenArray(squad_id) {
	// 4: revenue
	// 5: rating

	let hidden = [];
	const filledReview = await reviewHelper.checkReview(squad_id);
	const squad = await squadHelper.getSquad(squad_id);

	if (squad.general.revenue.filled === true) {
		hidden.push(4);
	}

	if (filledReview === true) {
		hidden.push(5);
	}
	return hidden;
}

//calculates for multipleArray & rejectedArray. multipleArray does not exist for squad-api.
async function arrayHelper(computeObject) {
	// Multiple -> check for tables -> exp, skill, education, license, visa, interest, language, contact_details
	// Rejected -> check for ALL tables

	const map = {
		about_us: 0,
		service: 1,
		project: 2,
		linked_account: 3,
		alliance: 4,
		client: 5,
		contact_details: 6
	};

	let array = [];

	for (let prop in computeObject) {
		let iterator = computeObject[prop];
		let flag = false;
		for (let key in iterator) {
			if (iterator['filled'] === false) {
				flag = true;
				break;
			}
		}
		if (flag === true) {
			array.push(map[prop]);
		}
	}
	return array;
}

async function calculateSquadCompletion(data) {
	//weightage is value set for each card. 100/9 = 11.11
	let weightage = 11.11;
	let filledCards = data.totalCards - data.emptyCards;
	let percentage = filledCards * weightage;
	if (data.backgroundImage !== null) {
		percentage += weightage;
	}
	if (data.profileImage !== null) {
		percentage += weightage;
	}

	if (percentage < 0) {
		return 0;
	}
	return percentage > 95 ? 100 : Math.floor(percentage);
}

module.exports = router;

/** Developer Notes
 * Cards
		about_us: 0,
		service: 1,
		project: 2,
		more_info: 3,
		revenue: 4,
		rating: 5,
		linked_account: 6,
		contact_details: 7
*/
//test comment for checking github PR flow
