//Contains code where manipulations are done before sending data to email-service
const { getUserTableOnly } = require('./userHelper');
const { getOnlySquadTable } = require('./squad/squadHelper');

//Rotue: /squad/createRequestExtBulk
const helperFn_createRequestExtBulk = async ({ squad_id, user_id, invites } = req.body) =>
	invites.map(async (invite) => {
		const { squad_name } = await getOnlySquadTable(squad_id);
		const { firstname: first_name, lastname: last_name } = await getUserTableOnly(user_id);

		let obj = {};

		let encodedID = encodeString(invite.request_id); //encoding request_id

		obj.to = invite.email;
		obj.from = process.env.SENDGRID_SENDER_MAIL;
		obj.templateId = process.env.TEMPLATE_INVITATION_TO_JOIN_SQUAD;
		obj.dynamicTemplateData = {
			encodedID,
			first_name: invite.first_name,
			last_name: invite.last_name,
			sender_name: `${first_name} ${last_name}`,
			sender_squad_name: squad_name
		};

		return obj;
	});

//Route: /work/shareWorkExternal
const helperFn_shareWorkExternal = async (external) =>
	external.map(async (e) => {
		// const { squad_name } = await getOnlySquadTable(squad_id);
		// const { firstname: first_name, lastname: last_name } = await getUserTableOnly(user_id);
		//^put these in a function and get the data from there because the same data is being used by helper_createRequestExtBulk

		let obj = {};

		obj.to = e.email;
		obj.from = process.env.SENDGRID_SENDER_MAIL;
		obj.templateId = process.env.TEMPLATE_SHARE_WORK_EXTERNAL;
		obj.dynamicTemplateData = {
			external_share_id: e.external_share_id //[TODO] change this to encrypted one.
		};

		return obj;
	});

const encodeString = (string) => {
	let bufferObj = Buffer.from(string, 'utf8');
	let base64String = bufferObj.toString('base64');

	return base64String;
};

const decodeString = async (string) => {
	// Input: The base64 encoded input string

	let bufferObj = Buffer.from(string, 'base64'); // Create a buffer from the string
	let decodedString = bufferObj.toString('utf8'); // Encode the Buffer as a utf8 string

	return decodedString;
};

module.exports = {
	helperFn_createRequestExtBulk,
	helperFn_shareWorkExternal,
	decodeString
};
