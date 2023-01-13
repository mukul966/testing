const express = require("express");
const workhelper = require("./oldWorkHelper");
const crypto=require("crypto")

const router = express();
router.use(express.json());

router.post("/newContactDetails", async (req, res) => 
{
  if (!req.body.id) 
  {
    return res.status(200).send( { message: `id missing` } );
  }
  
  const Updatedetail = await workhelper.updateDetails(req.body, req.body.id);
  
  if(Updatedetail.hasOwnProperty('error'))
  {
    return res.status(500).send( { message:`Error in Update` } )
  }
  
  return res.send(Updatedetail);

});







const algorithm="aes-256-cbc"
const initVector=crypto.randomBytes(16);
const Securitykey=crypto.randomBytes(32);


const dataToEncrypt = (data1) => {
  const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
  const encrypted = cipher.update(data1, "utf-8", "hex");
  const final = encrypted + cipher.final("hex");
  return final;
};

const dataToDecrypt = (encrypted_data) => {
  const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);
  let decryptedData = decipher.update(encrypted_data, "hex", "utf-8");
  const final = decipher.final("utf8");
  return final.toString();
};



const dataAfterEncryption=dataToEncrypt('65476732657652')
console.log("ENCRYPTED_DATA :: ",dataAfterEncryption);
const afterDecryption=dataToDecrypt(dataAfterEncryption);
console.log("DECRYPTED_DATA :: ",afterDecryption)





router.listen(8080);
