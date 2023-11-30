const bcrypt = require('bcrypt');
const usuarioModel = require('../db/db');


const encryptPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

const comparePasswords = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

module.exports = { encryptPassword, comparePasswords };
