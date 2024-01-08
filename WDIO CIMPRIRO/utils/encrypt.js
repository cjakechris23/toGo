const CryptoJS = require('crypto-js');

function encryptCredentials(username, password, key) {
  const encryptedUsername = CryptoJS.AES.encrypt(username, key).toString();
  const encryptedPassword = CryptoJS.AES.encrypt(password, key).toString();
  console.log("Username: " + encryptedUsername)
  console.log("Password: " + encryptedPassword)
  return {
    username: encryptedUsername,
    password: encryptedPassword
  };
 
}

module.exports = {
  encryptCredentials
};