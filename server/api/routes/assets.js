const express = require('express');
const authorizer = require('../base/authorizer');
const statics = require('../responders/statics');

const routes = express.Router();

routes.use(
  authorizer('admin'), // only admins can access the files
  statics(__dirname, '../assets'),
);

module.exports = routes;
