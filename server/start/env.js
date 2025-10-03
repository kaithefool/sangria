const path = require('path');

const re = require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

if (re.error) throw re.error;
