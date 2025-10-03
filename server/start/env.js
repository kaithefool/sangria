const path = require('path');

const re = require('dotenv').config({
  path: path.resolve(__dirname, '../secrets/.env'),
});

if (re.error) throw re.error;
