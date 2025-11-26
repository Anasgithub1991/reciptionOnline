//Checking the crypto module
const crypto = require('crypto');
const algorithm = 'aes-256-cbc'; //Using AES encryption

const key = Buffer.from('hbiSUle+sg3AnX/y1KDHUwuya+UamocUWJFV3Vo8FNE=', 'base64');


const iv = crypto.randomBytes(16);

// console.log(iv)
//Encrypting text
function encrypt(text) {
   let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
   let encrypted = cipher.update(text);
   encrypted = Buffer.concat([encrypted, cipher.final()]);
   return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

// Decrypting text
function decrypt(text) {
   if (text) {
      let iv = Buffer.from(text?.iv, 'hex');
      let encryptedText = Buffer.from(text?.encryptedData, 'hex');
      let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
   }
}

module.exports = { encrypt, decrypt }