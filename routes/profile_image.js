const express = require('express');
const multer = require('multer');
const gcpStorage = require('../services/gcp-storage')
const profImgHelper = require('../helpers/profileImageHelper');
const bgImgHelper = require('../helpers/bgImageHelper');
const router = new express.Router();

const multerMemStorage = multer.memoryStorage()
const upload = multer({ storage: multerMemStorage })

//Profile Image Routes
router.post('/uploadProfileImage', upload.single('profileImage'), async (req, res) => {
    //[TODO] resize and reconfigure images then use a default name format

    if (!req.body.profile_id) {
        return res.status(400).send({ message: `Mandatory field(s): 'profile_id' missing` });
    }

    if (!req.file || !req.file.fieldname === 'profileImage') {
        return res.status(400).send({ message: `Mandatory field(s): 'profileImage' missing or invalid image data. Please refer documentation for correct format.` });
    }

    const { profile_id } = req.body;

    const { mimetype, buffer: imageBuffer } = req.file
    const uniqueFileName = generateUniqueName(mimetype)
    const idPrefixUniqueFileName = `images/profile/${profile_id}/${uniqueFileName}`; //adding profile_id which acts as a folder for the image. so all the data goes to the folder of the corresponding profile_id

    const uploadData = await gcpStorage.uploadFromMemory(idPrefixUniqueFileName, imageBuffer) //takes in buffer for uploading image
    if (uploadData.error) {
        return res.send(uploadData)
    }

    const createData = await profImgHelper.createImage(profile_id, uniqueFileName, profimgurl = uploadData.link);
    if (createData.error) {
        return res.send(createData);
    }

    res.status(200).send({ success: true, message: "Image uploaded to gcp-storage and entry created in DB.", profile_id, profimgid: createData.profimgid, link: uploadData.link })
})

router.post('/updateProfileImage', async (req, res) => {
    if (!req.body.profimgid) {
        return res.status(400).send({ message: `Mandatory field: 'profimgid' missing` });
    }

    const data = await profImgHelper.updateImageData(req.body);
    if (data.error) {
        return res.send(data);
    }

    res.status(200).send(data);
});

router.post('/setDefaultProfImage', async (req, res) => {
    if (!req.body.profile_id && !req.body.profimgid) {
        return res.status(400).send({ message: `Mandatory field(s): 'profile_id', 'profimgid'` });
    }

    const { profile_id, profimgid } = req.body;

    const data = await profImgHelper.markActiveImage(profile_id, profimgid);
    if (data.error) {
        return res.send(data);
    }

    res.status(201).send(data);
});

router.post('/getProfileImage', async (req, res) => {
    if (!req.body.hasOwnProperty('profimgid')) {
        return res.status(400).send({ message: `Mandatory field: 'profimgid' missing` });
    }

    const { profimgid } = req.body;

    const data = await profImgHelper.imgDataProfileId(profimgid);
    if (data.error) {
        return res.send(data);
    }

    res.status(200).send(data);
});

router.post('/getAllProfileImages', async (req, res) => {
    if (!req.body.hasOwnProperty('profile_id')) {
        return res.status(400).send({ message: `Mandatory field: 'profile_id' missing` });
    }

    const { profile_id } = req.body;

    const data = await profImgHelper.getAllProfImages(profile_id);
    if (data.error) {
        return res.send(data);
    }

    res.status(200).send(data);
});

//Profile Background Image Routes
router.post('/uploadProfBgImage', upload.single('bgImage'), async (req, res) => {
    //[TODO] resize and reconfigure images then use a default name format
    if (!req.body.profile_id) {
        return res.status(400).send({ message: `Mandatory field(s): 'profile_id' missing` });
    }

    if (!req.file || !req.file.fieldname === 'bgImage') {
        return res.status(400).send({ message: `Mandatory field(s): 'bgImage' missing or invalid image data. Please refer documentation for correct format.` });
    }

    const { profile_id } = req.body;

    const { mimetype, buffer: imageBuffer } = req.file
    const uniqueFileName = generateUniqueName(mimetype)
    const idPrefixUniqueFileName = `images/profile/${profile_id}/${uniqueFileName}`; //adding profile_id which acts as a folder for the image. so all the data goes to the folder of the corresponding profile_id

    const uploadData = await gcpStorage.uploadFromMemory(idPrefixUniqueFileName, imageBuffer) //takes in buffer for uploading image
    if (uploadData.error) {
        return res.send(uploadData)
    }

    const createData = await bgImgHelper.createImage(profile_id, uniqueFileName, bgimgurl = uploadData.link);

    if (createData.error) {
        return res.send(createData);
    }

    res.status(200).send({ success: true, message: "Image uploaded to gcp-storage and entry created in DB.", profile_id, bgimgid: createData.bgimgid, link: uploadData.link })
})

router.post('/updateProfBgImage', async (req, res) => {
    if (!req.body.bgimgid) {
        return res.status(400).send({ message: `Mandatory field: 'bgimgid' missing` });
    }

    const data = await bgImgHelper.updateImageData(req.body);
    if (data.error) {
        return res.send(data);
    }

    res.status(200).send(data);
});

router.post('/setDefaultProfBgImage', async (req, res) => {
    if (!req.body.profile_id || !req.body.bgimgid) {
        return res.status(400).send({ message: `Mandatory field(s): 'profile_id', 'bgimgid'` });
    }

    const { profile_id, bgimgid } = req.body;

    const data = await bgImgHelper.markActiveImage(profile_id, bgimgid);
    if (data.error) {
        return res.send(data);
    }

    res.status(200).send(data);
});

router.post('/getProfBgImage', async (req, res) => {
    if (!req.body.hasOwnProperty('bgimgid')) {
        return res.status(400).send({ message: `Mandatory field: 'bgimgid' missing` });
    }

    const { bgimgid } = req.body;

    const data = await bgImgHelper.imgDataProfileId(bgimgid);
    if (data.error) {
        return res.send(data);
    }

    res.status(200).send(data);
});

router.post('/getAllProfBgImages', async (req, res) => {
    if (!req.body.hasOwnProperty('profile_id')) {
        return res.status(400).send({ message: `Mandatory field: 'profile_id' missing` });
    }

    const { profile_id } = req.body;

    const data = await bgImgHelper.getAllBgImages(profile_id);
    if (data.error) {
        return res.send(data);
    }
    res.status(200).send(data);
});

const generateUniqueName = (mimetype) => {
    const type = mimetype.split('/');
    const ext = type[1];

    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const uniqueFileName = `${uniquePrefix}.${ext}`
    return uniqueFileName
}

module.exports = router;
