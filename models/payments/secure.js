const crypto=require("crypto")
const algorithm="aes-256-cbc"
const initVector=crypto.randomBytes(16);
const Securitykey=crypto.randomBytes(32);


const dataToEncrypt = (data1) => {
  const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
  const encrypted = cipher.update(data1, "utf-8", "hex");
  const final = encrypted+cipher.final("hex");
  return final;
};

const dataToDecrypt = (encrypted_data) => {
  const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);
  let decryptedData = decipher.update(encrypted_data, "hex", "utf-8");
  const final = decryptedData+decipher.final("utf8");
  return final.toString();
};



// const dataAfterEncryption=dataToEncrypt('65476732657652')
// console.log("ENCRYPTED_DATA :: ",dataAfterEncryption);
// const afterDecryption=dataToDecrypt(dataAfterEncryption);
// console.log("DECRYPTED_DATA :: ",afterDecryption)



const num='872938466723654767683246'
// const endNum=num.slice(-4);
// console.log(endNum);
// const maskNum=endNum.padStart(num.length,"*")
// console.log(maskNum);

async function masking (account_number){
      const endNum=account_number.slice(-4);
      const maskNum=endNum.padStart(account_number.length,"*")
      console.log(maskNum);
      return maskNum
}


//let mask= await masking('3452345436327');


module.exports={
      dataToEncrypt,
      dataToDecrypt,
      masking
}