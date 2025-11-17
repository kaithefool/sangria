const password = require('password-hash-and-salt');

module.exports = {
  encrypt(str) {
    return new Promise((resolve, reject) => {
      password(str).hash((err, hash) => {
        if (err) return reject(err);

        return resolve(hash);
      });
    });
  },

  compare(str, hash) {
    return new Promise((resolve, reject) => {
      password(str).verifyAgainst(hash, (err, verified) => {
        if (err) return reject(err);

        return resolve(verified);
      });
    });
  },
};
