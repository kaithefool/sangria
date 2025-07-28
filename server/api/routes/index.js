const routes = require('express').Router();

const views = require('./views');
const otps = require('./otps');
const accessLogs = require('./accessLogs');
const auth = require('./auth');
const files = require('./files');
const users = require('./users');
const assets = require('./assets');
const consts = require('./consts');
const self = require('./self');

routes.use('/views', views);
routes.use('/otps', otps);
routes.use('/access-logs', accessLogs);
routes.use('/auth', auth);
routes.use('/files', files);
routes.use('/users', users);
routes.use('/assets', assets);
routes.use('/consts', consts);
routes.use('/self', self);

module.exports = routes;
