const routes = require('express').Router();
const consts = require('../models/consts');

routes.get('/', (req, res) => res.json(consts.public));

module.exports = routes;
