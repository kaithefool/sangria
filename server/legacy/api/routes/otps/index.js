const routes = require('express').Router();
const authMobile = require('./authMobile');
const pwdresetEmail = require('./pwdresetEmail');
const registerEmail = require('./registerEmail');

routes.use('/auth-mobile', authMobile);
routes.use('/pwdreset-email', pwdresetEmail);
routes.use('/register-email', registerEmail);

module.exports = routes;
