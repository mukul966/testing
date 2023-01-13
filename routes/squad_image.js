const express = require('express');
const multer = require('multer');
const gcpStorage = require('../services/gcp-storage');
const squadBgImgHelper = require('../helpers/squad/squadBgImageHelper');
const squadProfImgHelper = require('../helpers/squad/squadProfileImageHelper');
const clientHelper = require('../helpers/squad/clientHelper');
const router = new express.Router();

const multerMemStorageSquad = multer.memoryStorage();
const upload = multer({ storage: multerMemStorageSquad });

//Squad profile-image Routes
router.post('/uploadSquadProfImage', upload.single('profileImage'), async (req, res) => {
	if (!req.body.squad_id) {
		return res.status(400).send({ message: `Mandatory field(s): 'squad_id' missing` });
	}

	if (!req.file || !req.file.fieldname === 'profileImage') {
		return res.status(400).send({
			message: `Mandatory field(s): 'profileImage' missing or invalid image data. Please refer documentation for correct format.`
		});
	}

	const { squad_id } = req.body;
	const { mimetype, buffer: imageBuffer } = req.file;
	const uniqueFileName = generateUniqueName(mimetype);
	const idPrefixUniqueFileName = `images/squad/${squad_id}/${uniqueFileName}`; //adding squad_id which acts as a folder for the image. So all the data goes to the folder of the corresponding squad_id.

	const uploadData = await gcpStorage.uploadFromMemory(idPrefixUniqueFileName, imageBuffer); //takes in buffer for uploading image
	if (uploadData.error) {
		return res.status(500).send(uploadData);
	}

	const createData = await squadProfImgHelper.createImage(squad_id, uniqueFileName, (profimgurl = uploadData.link));
	if (createData.error) {
		return res.status(500).send(createData);
	}

	res.status(201).send({
		success: true,
		message: 'Image uploaded to gcp-storage and entry created in DB.',
		squad_id,
		profimgid: createData.profimgid,
		link: uploadData.link
	});
});

router.post('/updateSquadProfImage', async (req, res) => {
	if (!req.body.profimgid) {
		return res.status(400).send({ message: `Mandatory field: 'profimgid' missing` });
	}

	const data = await squadProfImgHelper.updateImageData(req.body);
	if (data.error) {
		return res.send(data);
	}

	res.status(200).send(data);
});

router.post('/setDefaultSquadProfImage', async (req, res) => {
	if (!req.body.squad_id && !req.body.profimgid) {
		return res.status(400).send({ message: `Mandatory field(s): 'squad_id', 'profimgid'` });
	}

	const { squad_id, profimgid } = req.body;

	const data = await squadProfImgHelper.markActiveImage(squad_id, profimgid);
	if (data.error) {
		return res.send(data);
	}

	res.status(201).send(data);
});

router.post('/getSquadProfImage', async (req, res) => {
	if (!req.body.hasOwnProperty('profimgid')) {
		return res.status(400).send({ message: `Mandatory field: 'profimgid' missing` });
	}

	const { profimgid } = req.body;

	const data = await squadProfImgHelper.getProfImageData(profimgid);
	if (data.error) {
		return res.send(data);
	}

	res.status(200).send(data);
});

router.post('/getAllSquadProfImages', async (req, res) => {
	if (!req.body.hasOwnProperty('squad_id')) {
		return res.status(400).send({ message: `Mandatory field: 'squad_id' missing` });
	}

	const { squad_id } = req.body;

	const data = await squadProfImgHelper.getAllProfImages(squad_id);
	if (data.error) {
		return res.send(data);
	}
	res.status(200).send(data);
});

//Squad Background Image Routes
router.post('/uploadSquadBgImage', upload.single('bgImage'), async (req, res) => {
	if (!req.body.squad_id) {
		return res.status(400).send({ message: `Mandatory field(s): 'squad_id' missing` });
	}

	if (!req.file || !req.file.fieldname === 'bgImage') {
		return res.status(400).send({
			message: `Mandatory field(s): 'bgImage' missing or invalid image data. Please refer documentation for correct format.`
		});
	}

	const { squad_id } = req.body;

	const { mimetype, buffer: imageBuffer } = req.file;
	const uniqueFileName = generateUniqueName(mimetype);
	const idPrefixUniqueFileName = `images/squad/${squad_id}/${uniqueFileName}`; //adding squad_id which acts as a folder for the image. So all the data goes to the folder of the corresponding squad_id.

	const uploadData = await gcpStorage.uploadFromMemory(idPrefixUniqueFileName, imageBuffer); //takes in buffer for uploading image
	if (uploadData.error) {
		return res.status(500).send(uploadData);
	}

	const createData = await squadBgImgHelper.createImage(squad_id, uniqueFileName, (bgimgurl = uploadData.link));
	if (createData.error) {
		return res.status(500).send(uploadData);
	}

	res.status(200).send({
		success: true,
		message: 'Image uploaded to gcp-storage and entry created in DB.',
		squad_id,
		bgimgid: createData.bgimgid,
		link: uploadData.link
	});
});

router.post('/updateSquadBgImage', async (req, res) => {
	if (!req.body.bgimgid) {
		return res.status(400).send({ message: `Mandatory field: 'bgimgid' missing` });
	}

	const data = await squadBgImgHelper.updateImageData(req.body);
	if (data.error) {
		return res.send(data);
	}

	res.status(200).send(data);
});

router.post('/setDefaultSquadBgImage', async (req, res) => {
	if (!req.body.squad_id || !req.body.bgimgid) {
		return res.status(400).send({ message: `Mandatory field(s): 'squad_id', 'bgimgid'` });
	}

	const { squad_id, bgimgid } = req.body;

	const data = await squadBgImgHelper.markActiveImage(squad_id, bgimgid);
	if (data.error) {
		return res.send(data);
	}

	res.status(201).send(data);
});

router.post('/getSquadBgImage', async (req, res) => {
	if (!req.body.hasOwnProperty('bgimgid')) {
		return res.status(400).send({ message: `Mandatory field: 'bgimgid' missing` });
	}

	const { bgimgid } = req.body;

	const data = await squadBgImgHelper.getImageData(bgimgid);
	if (data.error) {
		return res.send(data);
	}

	res.status(200).send(data);
});

router.post('/getAllSquadBgImages', async (req, res) => {
	if (!req.body.hasOwnProperty('squad_id')) {
		return res.status(400).send({ message: `Mandatory field: 'squad_id' missing` });
	}

	const { squad_id } = req.body;

	const data = await squadBgImgHelper.getAllBgImages(squad_id);
	if (data.error) {
		return res.send(data);
	}
	res.status(200).send(data);
});

//Squad-client image routes
router.post('/client/imageUpload', upload.single('clientImage'), async (req, res) => {
	if (!req.body.client_id) {
		return res.status(400).send({ message: `Mandatory field(s): 'client_id'` });
	}

	if (!req.file || !req.file.fieldname === 'clientImage') {
		return res.status(400).send({
			message: `Mandatory field(s): 'clientImage' missing or invalid image data. Please refer documentation for correct format.`
		});
	}

	const { client_id } = req.body;
	const { mimetype, buffer: imageBuffer } = req.file;
	const uniqueFileName = generateUniqueName(mimetype);
	const idPrefixUniqueFileName = `images/client/${client_id}/${uniqueFileName}`; //adding squad_id which acts as a folder for the image. So all the data goes to the folder of the corresponding squad_id.

	const uploadData = await gcpStorage.uploadFromMemory(idPrefixUniqueFileName, imageBuffer); //takes in buffer for uploading image
	if (uploadData.error) {
		return res.status(500).send(uploadData);
	}

	const createData = await clientHelper.createImage(client_id, uniqueFileName, (imgurl = uploadData.link));
	if (createData.error) {
		return res.status(500).send(createData);
	}

	const updateData = await clientHelper.updateClient({
		client_id,
		imgid: createData.imgid
	}); //updating uploaded url in  table squad_client.imgurl; Last uploaded image is set as default image. No option for multiple images.
	// [TODO][ADD] remove/delete previous image

	res.status(201).send({
		success: true,
		message: 'Image uploaded to gcp-storage. Entry created and updated in DB.',
		client_id,
		imgid: createData.imgid,
		link: uploadData.link
	});
});

router.post('/client/updateImage', async (req, res) => {
	if (!req.body.imgid) {
		return res.status(400).send({ message: `Mandatory field: 'imgid' missing` });
	}

	const data = await clientHelper.updateImageData(req.body);
	if (data.error) {
		return res.send(data);
	}

	res.status(200).send(data);
});

//Temp-image routes
router.post('/uploadTempImage', upload.single('tempImage'), async (req, res) => {
	if (!req.body.user_id) {
		return res.status(400).send({ message: `Mandatory field(s): 'user_id' missing` });
	}

	if (!req.file || !req.file.fieldname === 'tempImage') {
		return res.status(400).send({
			message: `Mandatory field(s): 'tempImage' missing or invalid image data. Please refer documentation for correct format.`
		});
	}

	const { user_id } = req.body;

	const { mimetype, buffer: imageBuffer } = req.file;
	const uniqueFileName = generateUniqueName(mimetype);
	const idPrefixUniqueFileName = `images/temp/${user_id}/${uniqueFileName}`; //adding user_id which acts as a folder for the image. so all the data goes to the folder of the corresponding user_id

	const uploadData = await gcpStorage.uploadFromMemory(idPrefixUniqueFileName, imageBuffer); //takes in buffer for uploading image
	if (uploadData.error) {
		return res.status(500).send(uploadData);
	}

	const createData = await squadProfImgHelper.createTempImage(user_id, uniqueFileName, (imgurl = uploadData.link));
	if (createData.error) {
		return res.status(500).send(createData);
	}

	res.status(201).send({
		success: true,
		image_upload: true,
		image_dbEntry: true,
		message: 'Image uploaded to gcp-storage and entry created in DB.',
		user_id,
		temp_id: createData.temp_id,
		link: uploadData.link
	});
	// res.status(201).send({ data: true })
});

router.post('/updateTempData', async (req, res) => {
	if (!req.body.temp_id) {
		return res.status(400).send({ message: `Mandatory field: 'temp_id' missing` });
	}

	const data = await squadProfImgHelper.updateTempImageData(req.body);
	if (data.error) {
		return res.status(500).send(data);
	}

	res.status(200).send(data);
});

router.post('/getTempImage', async (req, res) => {
	if (!req.body.hasOwnProperty('temp_id')) {
		return res.status(400).send({ message: `Mandatory field: 'temp_id' missing` });
	}

	const { temp_id } = req.body;

	const data = await squadProfImgHelper.getTempImageData(temp_id);
	if (data.error) {
		return res.send(data);
	}

	res.status(200).send(data);
});

router.post('/moveTempToSquad', async (req, res) => {
	if (!req.body.hasOwnProperty('temp_id') || !req.body.hasOwnProperty('squad_id')) {
		return res.status(400).send({ message: `Mandatory field: 'temp_id' & 'squad_id' missing` });
	}
	const { squad_id, temp_id } = req.body;
	const image = await squadProfImgHelper.getTempImageData(temp_id);
	['temp_id', 'user_id', 'created_at', 'updated_at'].forEach((e) => delete image[e]);

	const data = await squadProfImgHelper.moveTempToSquad(squad_id, image);
	if (data.hasOwnProperty('error')) {
		return res.status(500).send(data);
	}

	res.status(201).send(data);
});

//Aux Functions
const generateUniqueName = (mimetype) => {
	const type = mimetype.split('/');
	const ext = type[1];

	const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
	const uniqueFileName = `${uniquePrefix}.${ext}`;
	return uniqueFileName;
};

module.exports = router;
