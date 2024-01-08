const CryptoJS = require('crypto-js');

function decryptCredentials(encryptedUsername, encryptedPassword, key) {
  const decryptedUsername = CryptoJS.AES.decrypt(encryptedUsername, key).toString(CryptoJS.enc.Utf8);
  const decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, key).toString(CryptoJS.enc.Utf8);
  return {
    username: decryptedUsername,
    password: decryptedPassword
  };
}

module.exports = {
  decryptCredentials
};