const router = require("express").Router();
const mysql = require("mysql");
const dotenv = require("dotenv");
const db = require("./dbhelper");
const middleware = require("./middleware");
var connection = db.getconnection();
const { v4: uuidv4 } = require("uuid");
const Profile = require("../models/profile");
const projectHelper = require("../helpers/projectHelper");
const profileHelper = require('../helpers/profileHelper');
const reviewHelper = require("../helpers/reviewHelper");
const skillHelper = require("../helpers/skillHelper");
const experienceHelper = require("../helpers/experienceHelper");
const educationHelper = require("../helpers/educationHelper");
const interestHelper = require("../helpers/interestHelper");
const languageHelper = require("../helpers/languageHelper");
const licenseHelper = require("../helpers/licenseHelper");
const visaHelper = require("../helpers/visaHelper");
const { getImageData } = require('../helpers/bgImageHelper');
const { getProfImageData } = require('../helpers/profileImageHelper');
const { getUserDetails } = require('../helpers/userHelper');
const { aux_getSquadData } = require('../helpers/squad/squadHelper')

dotenv.config();

router.post('/createprofile', async (req, res) => {
	try {
		if (!req.body.user_id) {
			return res.status(400).send({ message: `Mandatory field missing: 'user_id'` });
		}

		const { user_id } = req.body;

		const profile = await profileHelper.createProfile(user_id);
		if (profile.hasOwnProperty('error')) {
			return res.status(500).send(profile);
		}

		res.status(201).send(profile);
	} catch (error) {
		return res.status(500).send({ error: error.message });
	}
});

//[TODO] Better error handling for /getprofile
router.post('/getprofile', async (req, res) => {
	try {
		if (!req.body.user_id || !req.body.profile_id) {
			throw new Error('Mandatory field(s): user_id, profile_id');
		}

		const { user_id, profile_id } = req.body;

		const profileCheck = await profileHelper.profileExists(profile_id);
		if (profileCheck === null) {
			return res.status(200).send({ message: `Profile does not exist for profile_id: ${profile_id}`, profile: {} })
		}

		let profile = await profileHelper.getProfile(user_id);
		const skill = await skillHelper.getSkills(user_id);
		const project = await projectHelper.getProjects(user_id);
		const review = await reviewHelper.getReviews(profile_id);
		const experience = await experienceHelper.getExperienceList(user_id);
		const education = await educationHelper.getEducationList(user_id);
		const license = await licenseHelper.getLicenseList(user_id);
		const visa = await visaHelper.getVisaList(user_id);
		const interest = await interestHelper.getInterestList(user_id);
		const language = await languageHelper.getLanguageList(user_id);
		const squadData = await aux_getSquadData(user_id);

		if (profile.default_background_image_id !== null) {
			const background_image = await getImageData(profile.default_background_image_id);
			profile.general.background_image = background_image;
		} else {
			profile.general.background_image = null;
		}

		if (profile.default_profile_image_id !== null) {
			const profile_image = await getProfImageData(profile.default_profile_image_id);
			profile.general.profile_image = profile_image;
		} else {
			profile.general.profile_image = null;
		}

		const orderArray = await getOrderArray(user_id);
		const hiddenArray = []; //await getHiddenArray(profile_id, user_id); //defaults to empty array because respective cards are not in use.
		const multipleArray = await arrayHelper({
			experience,
			skill,
			education,
			license,
			visa,
			interest,
			language,
			contact_details: profile.general.contact_detail
		}); //card number is added to multipleArray whose data is not filled.
		const rejectedArrayHalf = await arrayHelper({
			about_me: profile.general.about_me,
			project,
			linked_account: profile.general.linked_account
		}); //remove the cards(8) calculated for multiple array. calculate for the remaining(3). combine multipleArray & rejectArrayHalf.
		const rejectedArrayFinal = [...multipleArray, ...rejectedArrayHalf].sort((a, b) => a - b); // All cards(11 = 8+3) computed.

		profile.general.skills = skill;
		profile.general.projects = project;
		profile.general.ratings = review;
		profile.general.work_experience = experience;
		profile.general.education = education;
		profile.general.licenses = license;
		profile.general.visas = visa;
		profile.general.interest = interest;
		profile.general.language = language;

		profile.general.order = orderArray;
		profile.general.hidden = hiddenArray;
		profile.general.multiple = multipleArray;
		profile.general.rejected = rejectedArrayFinal;

		profile.profile_completion = await calculateProfileCompletion({
			totalCards: orderArray.length - 1, // -1 for add_details card which is used for controlling/keeping track of other cards.
			emptyCards: rejectedArrayFinal.length,
			backgroundImage: profile.background_image_id,
			profileImage: profile.profile_image_id
		});

		//[HOTFIX] update profile.profile_completion here, use it to send that data
		const updateData = await profileHelper.updateProfile({ user_id, profile_completion: profile.profile_completion })

		profile.squad = squadData;

		if (profile instanceof Error) {
			throw new Error(profile);
		}

		res.status(200).send({ profile });
	} catch (error) {
		console.log('error from /getprofile route :>> ', error);
		return res.status(500).send({ error: error.message });
	}
});

//get profile_id of a user
router.post('/getProfileId', async (req, res) => {
	const data = await profileHelper.getProfileIdViaUserId(req.body.user_id);

	if (data.hasOwnProperty('error')) {
		return res.send(data);
	}

	res.status(200).send(data);
});

// Dynamic POST Route for all tables
router.post('/updateprofile', async (req, res) => {
	try {
		const table = Object.keys(req.body)[0];
		let details;

		if (table === 'profile') {
			details = await profileHelper.updateProfile({ ...req.body[`${table}`] });
		} else if (table === 'project') {
			details = await projectDetails({
				...req.body[`${table}`]
			});
		} else if (table === 'review') {
			details = await reviewDetails({
				...req.body[`${table}`]
			});
		} else if (table === 'skill') {
			details = await skillDetails({
				...req.body[`${table}`]
			});
		} else if (table === 'experience') {
			details = await experienceDetails({
				...req.body[`${table}`]
			});
		} else if (table === 'education') {
			details = await educationDetails({
				...req.body[`${table}`]
			});
		} else if (table === 'interest') {
			details = await interestDetails({
				...req.body[`${table}`]
			});
		} else if (table === 'language') {
			details = await languageDetails({
				...req.body[`${table}`]
			});
		} else if (table === 'visa') {
			details = await visaDetails({
				...req.body[`${table}`]
			});
		} else if (table === 'license') {
			details = await licenseDetails({
				...req.body[`${table}`]
			});
		}

		console.log('Response Instance (Error) :>> ', details instanceof Error);
		if (details instanceof Error) {
			throw new Error(details);
		}
		console.log('details :>> ', details);
		return res.send({
			details
		});
	} catch (error) {
		console.log('Error from /updateprofile-fn :>> ', error);
		return res.status(500).send({ error: error.message });
	}
});

//GET project(1).
router.post('/getproject', async (req, res) => {
	if (!req.body.hasOwnProperty('project_id')) {
		return res.status(400).send({ error: 'Mandatory field: project_id' });
	}

	const { project_id } = req.body;
	const project = await projectHelper.getOneProject(project_id);

	if (project.hasOwnProperty('error')) {
		return res.send(project);
	}

	return res.status(200).send(project);
});

//GET review(1).
router.post('/getreview', async (req, res) => {
	if (!req.body.hasOwnProperty('review_id')) {
		return res.status(400).send({ error: 'Mandatory field: review_id' });
	}

	const { review_id } = req.body;
	const review = await reviewHelper.getOneReview(review_id);

	if (review.hasOwnProperty('error')) {
		return res.send(review);
	}

	return res.status(200).send(review);
});

router.post('/getskill', async (req, res) => {
	if (!req.body.hasOwnProperty('skill_id')) {
		return res.status(400).send({ error: 'Mandatory field: skill_id' });
	}

	const { skill_id } = req.body;
	const skill = await skillHelper.getOneSkill(skill_id);

	if (skill.hasOwnProperty('error')) {
		return res.send(skill);
	}

	return res.status(200).send(skill);
});

//GET experience(1).
router.post('/getexperience', async (req, res) => {
	if (!req.body.hasOwnProperty('experience_id')) {
		return res.status(400).send({ error: 'Mandatory field: experience_id' });
	}

	const { experience_id } = req.body;
	const experience = await experienceHelper.getOneExperience(experience_id);

	if (experience.hasOwnProperty('error')) {
		return res.send(experience);
	}

	return res.status(200).send(experience);
});

//GET education(1).
router.post('/geteducation', async (req, res) => {
	if (!req.body.hasOwnProperty('education_id')) {
		return res.status(400).send({ error: 'Mandatory field: education_id' });
	}

	const { education_id } = req.body;
	const education = await educationHelper.getOneEducation(education_id);

	if (education.hasOwnProperty('error')) {
		return res.send(education);
	}

	return res.status(200).send(education);
});

//GET interest(1).
router.post('/getinterest', async (req, res) => {
	if (!req.body.hasOwnProperty('interest_id')) {
		return res.status(400).send({ error: 'Mandatory field: interest_id' });
	}

	const { interest_id } = req.body;
	const interest = await interestHelper.getOneInterest(interest_id);

	if (interest.hasOwnProperty('error')) {
		return res.send(interest);
	}

	return res.status(200).send(interest);
});

//GET language(1).
router.post('/getlanguage', async (req, res) => {
	if (!req.body.hasOwnProperty('language_id')) {
		return res.status(400).send({ error: 'Mandatory field: language_id' });
	}

	const { language_id } = req.body;
	const language = await languageHelper.getOneLanguage(language_id);

	if (language.hasOwnProperty('error')) {
		return res.send(language);
	}

	return res.status(200).send(language);
});

//GET visa(1).
router.post('/getvisa', async (req, res) => {
	if (!req.body.hasOwnProperty('visa_id')) {
		return res.status(400).send({ error: 'Mandatory field: visa_id' });
	}

	const { visa_id } = req.body;
	const visa = await visaHelper.getOneVisa(visa_id);

	if (visa.hasOwnProperty('error')) {
		return res.send(visa);
	}

	return res.status(200).send(visa);
});

//GET license(1).
router.post('/getlicense', async (req, res) => {
	if (!req.body.hasOwnProperty('license_id')) {
		return res.status(400).send({ error: 'Mandatory field: license_id' });
	}

	const { license_id } = req.body;
	const license = await licenseHelper.getOneLicense(license_id);

	if (license.hasOwnProperty('error')) {
		return res.send(license);
	}

	return res.status(200).send(license);
});

router.post('/deleteOne', async (req, res) => {
	try {
		const table = Object.keys(req.body)[0];
		let details, message;

		if (table === 'project') {
			details = await projectHelper.removeOne({
				...req.body[`${table}`]
			});
		} else if (table === 'review') {
			details = await reviewHelper.removeOne({
				...req.body[`${table}`]
			});
		} else if (table === 'license') {
			details = await licenseHelper.removeOne({
				...req.body[`${table}`]
			});
		} else if (table === 'skill') {
			details = await skillHelper.removeOne({
				...req.body[`${table}`]
			});
		} else if (table === 'language') {
			details = await languageHelper.removeOne({
				...req.body[`${table}`]
			});
		} else if (table === 'visa') {
			details = await visaHelper.removeOne({
				...req.body[`${table}`]
			});
		} else if (table === 'interest') {
			details = await interestHelper.removeOne({
				...req.body[`${table}`]
			});
		} else if (table === 'education') {
			details = await educationHelper.removeOne({
				...req.body[`${table}`]
			});
		} else if (table === 'experience') {
			details = await experienceHelper.removeOne({
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

router.post('/getarrays', async (req, res) => {
	/*
	cards array(3):-
		1)order - sequence for cards.
		2)hidden - for fields which are filled NOT by the user which are 'comments' & 'revenue'.
			Eg. If there are no comments then include the card no. in hidden 
		3)rejected [TBD]
			
	Card Numbers - https://gist.github.com/sachin-prosoai/2eaa68b20a0147b37ab4ce0d661b6de8
		about_me: 0,
		skill: 1,
		project: 2,
		revenue: 3,
		experience: 4,
		education: 5,
		licence: 6,
		visa: 7,
		interest: 8,
		language: 9,
		linked_account: 10,
		ratings: 11,
		contact_details: 12,
		add_details: 13
	*/

	try {
		const { profile_id, user_id } = req.body;

		const orderArray = await getOrderArray(user_id);
		const hiddenArray = await getHiddenArray(profile_id, user_id);
		// const rejectedArray = await getRejectedArray(user_id);
		// const multipledArray = await getMultipleArray(user_id);
		return res.status(200).send({ order: orderArray, hidden: hiddenArray });
	} catch (e) {
		console.log('error from /getarrays route :>> ', e);
		return res.send(e);
	}
});

router.post('/filterSkill', async (req, res) => {
	try {
		const { skill_name } = req.body;

		const skilledUsers = await skillHelper.getAllUserIds(skill_name); //users who have skill(req.body.skill_name)
		let arrayOfUserIDs = skilledUsers.map((e) => e.user_id);

		let userData = await getUsersData(arrayOfUserIDs); //
		const otherSkills = await skillHelper.otherSkills(arrayOfUserIDs); //returns other skills of user(s)
		const map = new Map();

		otherSkills.forEach((e) => {
			//filling map with key-value pair (user_id: skills[])

			const { user_id, skill_name } = e;

			if (map.get(user_id) === undefined) {
				map.set(user_id, []);
				map.get(user_id).push(skill_name);
			} else {
				map.get(user_id).push(skill_name);
			}
		});
		//adding skills field to user data from user-table
		userData.forEach((e) => {
			const skills = map.get(e.user_id);
			e.skills = skills;
		});

		return res.status(200).send(userData);
	} catch (error) {
		console.log('error from /skillTest route :>> ', error);
		res.status(500).send({ error: error.message });
	}
});

router.post('/profileData', async (req, res) => {
	//(req) user_id -> (res) profile_id, user_id, background_image, profile_image, name, user_handle

	const { user_id } = req.body;

	const userData = await getUserDetails(user_id);
	if (userData === undefined) {
		return res.status(500).send({ message: 'user data does not exist' });
	}

	let profile = await profileHelper.getProfileTable(user_id);
	if (profile.error) {
		return res.status(500).send(profile);
	}

	const background_image = await getImageData(profile.default_background_image_id);
	if (background_image.error) {
		return res.status(500).send(background_image);
	}

	const profile_image = await getProfImageData(profile.default_profile_image_id);
	if (profile_image.error) {
		return res.status(500).send(profile_image);
	}

	res.status(200).send({
		user_id,
		profile_id: profile.profile_id,
		...userData,
		background_image: Object.keys(background_image).length === 0 && background_image.constructor === Object ? null : background_image,
		profile_image: Object.keys(profile_image).length === 0 && profile_image.constructor === Object ? null : profile_image
	});
});

//Project - Create New & Update Existing
async function projectDetails(projectObject) {
	try {
		if (!projectObject.hasOwnProperty('project_id')) {
			throw new Error(`Mandatory field 'project_id' missing`);
		}
		if (projectObject.project_id === 0) {
			if (!projectObject.hasOwnProperty('user_id')) {
				throw new Error(`Mandatory field 'user_id' missing`);
			}

			//hotfix
			if (projectObject.hasOwnProperty('skills') && projectObject.skills.length > 0) {
				let skillsValue = projectObject.skills.join(',')
				projectObject.skills = skillsValue
			} else if (projectObject.hasOwnProperty('skills') && projectObject.skills.length === 0) {
				projectObject.skills = null
			}

			return await projectHelper.createProject(projectObject);
		} else {
			//hotfix
			if (projectObject.hasOwnProperty('skills') && projectObject.skills.length > 0) {
				let skillsValue = projectObject.skills.join(',')
				projectObject.skills = skillsValue
			} else if (projectObject.hasOwnProperty('skills') && projectObject.skills.length === 0) {
				projectObject.skills = null
			}

			return await projectHelper.updateProject(projectObject);
		}
	} catch (e) {
		console.log('error from projectDetails-fn :>> ', e);
		return e;
	}
}

//Review - Create New & Update Existing
async function reviewDetails(update) {
	try {
		if (!update.hasOwnProperty('review_id')) {
			throw new Error(`Mandatory field 'review_id' missing`);
		}
		if (update.review_id === 0) {
			if (!update.hasOwnProperty('user_id') || !update.hasOwnProperty('profile_id')) {
				throw new Error(`Mandatory field(s): 'user_id' & 'profile_id`);
			}
			return await reviewHelper.createReview(update);
		} else {
			return await reviewHelper.updateReview(update);
		}
	} catch (e) {
		console.log('error from reviewDetails-fn :>> ', e);
		return e;
	}
}

//Skill - Create New & Update Existing
async function skillDetails(update) {
	try {
		if (!update.hasOwnProperty('skill_id')) {
			throw new Error(`Mandatory field 'skill_id' missing`);
		}

		if (update.skill_id === 0) {
			if (!update.hasOwnProperty('user_id')) {
				throw new Error(`Mandatory field 'user_id' missing`);
			}
			return await skillHelper.createSkill(update);
		} else {
			return await skillHelper.updateSkill(update);
		}
	} catch (e) {
		console.log('error from Details-fn :>> ', e);
		return e;
	}
}

//Experience - Create New & Update Existing
async function experienceDetails(update) {
	try {
		if (!update.hasOwnProperty('experience_id')) {
			throw new Error(`Mandatory field 'experience_id' missing`);
		}

		if (update.experience_id === 0) {
			if (!update.hasOwnProperty('user_id')) {
				throw new Error(`Mandatory field 'user_id' missing`);
			}

			return await experienceHelper.createExperience(update);
		} else {
			return await experienceHelper.updateExperience(update);
		}
	} catch (e) {
		console.log('error from Details-fn :>> ', e);
		return e;
	}
}

//Education - Create New & Update Existing
async function educationDetails(update) {
	try {
		if (!update.hasOwnProperty('education_id')) {
			throw new Error(`Mandatory field 'education_id' missing`);
		}

		if (update.education_id === 0) {
			if (!update.hasOwnProperty('user_id')) {
				throw new Error(`Mandatory field 'user_id' missing`);
			}

			return await educationHelper.createEducation(update);
		} else {
			return await educationHelper.updateEducation(update);
		}
	} catch (e) {
		console.log('error from Details-fn :>> ', e);
		return e;
	}
}

//Interest - Create New & Update Existing
async function interestDetails(update) {
	try {
		if (!update.hasOwnProperty('interest_id')) {
			throw new Error(`Mandatory field 'interest_id' missing`);
		}

		if (update.interest_id === 0) {
			if (!update.hasOwnProperty('user_id')) {
				throw new Error(`Mandatory field 'user_id' missing`);
			}

			return await interestHelper.createInterest(update);
		} else {
			return await interestHelper.updateInterest(update);
		}
	} catch (e) {
		console.log('error from Details-fn :>> ', e);
		return e;
	}
}

//Language - Create New & Update Existing
async function languageDetails(update) {
	try {
		if (!update.hasOwnProperty('language_id')) {
			throw new Error(`Mandatory field 'language_id' missing`);
		}

		if (update.language_id === 0) {
			if (!update.hasOwnProperty('user_id')) {
				throw new Error(`Mandatory field 'user_id' missing`);
			}

			return await languageHelper.createLanguage(update);
		} else {
			return await languageHelper.updateLanguage(update);
		}
	} catch (e) {
		console.log('error from Details-fn :>> ', e);
		return e;
	}
}

//Visa - Create New & Update Existing
async function visaDetails(update) {
	try {
		if (!update.hasOwnProperty('visa_id')) {
			throw new Error(`Mandatory field 'visa_id' missing`);
		}

		if (update.visa_id === 0) {
			if (!update.hasOwnProperty('user_id')) {
				throw new Error(`Mandatory field 'user_id' missing`);
			}

			return await visaHelper.createVisa(update);
		} else {
			return await visaHelper.updateVisa(update);
		}
	} catch (e) {
		console.log('error from Details-fn :>> ', e);
		return e;
	}
}

//License - Create New & Update Existing
async function licenseDetails(update) {
	try {
		if (!update.hasOwnProperty('license_id')) {
			throw new Error(`Mandatory field 'license_id' missing`);
		}

		if (update.license_id === 0) {
			if (!update.hasOwnProperty('user_id')) {
				throw new Error(`Mandatory field 'user_id' missing`);
			}

			return await licenseHelper.createLicense(update);
		} else {
			return await licenseHelper.updateLicense(update);
		}
	} catch (e) {
		console.log('error from Details-fn :>> ', e);
		return e;
	}
}

const OrderArrayHelper = (user_id) =>
	new Promise((resolve, reject) => {
		let query = 'SELECT order_array FROM user_profile WHERE user_id = ?';
		connection.query(query, user_id, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows[0]);
			}
		});
	});

async function getOrderArray(user_id) {
	try {
		let details = await OrderArrayHelper(user_id).then((response) => {
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

async function getHiddenArray(profile_id, user_id) {
	try {
		// 3: Revenue(),
		// 11: Rating_and_Review(),
		let hidden = [];
		const filledReview = await reviewHelper.checkReview(profile_id);
		const profile = await getProfile(user_id);

		if (profile.general.revenue.filled === true) {
			hidden.push(3);
		}

		if (filledReview === true) {
			hidden.push(11);
		}
		return hidden;
	} catch (error) {
		console.log('error from /getHiddenArray-fn :>> ', error);
		return error.message;
	}
}

const getUsersData = (users) =>
	new Promise((resolve, reject) => {
		let query =
			'SELECT user_id, default_background_image_id, default_profile_image_id FROM user_profile WHERE user_ID IN (' + connection.escape(users) + ')';

		connection.query(query, function (err, rows, fields) {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	}).then((response) => {
		return response;
	});

//calculates for multipleArray & rejectedArray.
async function arrayHelper(computeObject) {
	// Multiple -> check for tables -> exp, skill, education, license, visa, interest, language, contact_details
	// Rejected -> check for tables ->

	const map = {
		about_me: 0,
		skill: 1,
		project: 2,
		experience: 3,
		education: 4,
		license: 5,
		visa: 6,
		interest: 7,
		language: 8,
		linked_account: 9,
		contact_details: 10
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

async function calculateProfileCompletion(data) {
	//weightage is value set for each card.
	let weightage = 7.7;	// 100/13 = 7.69
	let filledCards = data.totalCards - data.emptyCards;
	let percentage = filledCards * weightage;
	if (data.backgroundImage !== null) {
		percentage += weightage;
	}
	if (data.profileImage !== null) {
		percentage += weightage;
	}

	return Math.floor(percentage);
}

// Generic-fn
async function fn_Details(update) {
	try {
		if (!update.hasOwnProperty('_id')) {
			throw new Error(`Mandatory field '_id' missing`);
		}
		if (update._id === 0) {
			if (!update.hasOwnProperty('user_id')) {
				throw new Error(`Mandatory field 'user_id' missing`);
			}
			return await Helper.create(update);
		} else {
			return await Helper.update(update);
		}
	} catch (e) {
		console.log('error from Details-fn :>> ', e);
		return e;
	}
}

module.exports = router;

/** Developer Notes:
 *
 * 	Prepared statements wherever possible(UPDATE queries as of now).[DONE]
 * 	Normal queries with parametrized queries. [TODO] Add data sanitization.
 * 	.query vs .execute
 * 		INSERT not working with .execute(). Driver(mysql2) does not support/works for INSERT with .execute(). Refer Link https://github.com/sidorares/node-mysql2/issues/742
 * 		SELECT needs to be run with query(). Because .execute() does not return desired data. Instead it returns (fields metadata, rows, etc) from the table.
 * 		UPDATE works great.
 *
 ** Cards(can be referred to as Tables for backend):
 *	 	rejected - List of card which don't have any data and viewer cant view it but admin can
 *	 	order - list of cards order
 *	 	multiple - single card will control multiple cards ,no. of those cards which are being controlled by the multiple card
 *	 	hidden - review and revenue card will get data from backend and user can't enter it
 *
 * 	[BUG] [FIXED]
 * 		addFilledField() -> adds filled:true for general.linked_accounts when all fields are null. Fix later
 *		check for orderArray wrt production-app
 *
 *
 *   [TODO]
 *  	1. Better error handling for /getprofile route
 * 		2. array-cards support [DONE]
 * 		3. ADD route
 * 			3.1 from profile table - profile_pic_image_id, user_handle, user_name, profession\
 * 		4.ADD
 *
 *
 *  [Changes]
 * 		last /getProfile & /updateProfile
 * 		Individual Routes changed & _
 *
 *
 */
