const { Storage } = require('@google-cloud/storage');
const storage = new Storage({ keyFilename: './encryption/key.json' }); // Creates a client from a Google service account key
const bucketName = process.env.GCP_BUCKET_VMS; // The ID of your GCS bucket

async function uploadFromMemory(destFileName, contents) {
	try {
		await storage.bucket(bucketName).file(destFileName).save(contents);
		return {
			success: true,
			message: 'Image upload complete',
			link: `https://${bucketName}.storage.googleapis.com/${destFileName}`
		};
	} catch (error) {
		return { error: error.message };
	}
}

async function deleteFile(fileName) {
	try {
		await storage.bucket(bucketName).file(fileName).delete();
		return { success: true, message: `File deleted` };
	} catch (error) {
		console.log('error from gcp-service deleteFile() :>> ', error);
		return { error: error.message };
	}
}

module.exports = { uploadFromMemory, deleteFile };
