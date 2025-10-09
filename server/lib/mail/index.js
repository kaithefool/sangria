const path = require('path');
const Email = require('email-templates');

const {
  MAIL_ROOT_URL,
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASSWORD,
  MAIL_DEFAULT_SENDER,
} = process.env;

const transport = {
  pool: true,
  host: MAIL_HOST,
  port: MAIL_PORT || 587,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASSWORD,
  },
};

const email = new Email({
  transport,
  views: {
    root: path.resolve(__dirname, 'templates'),
    locals: {
      rootUrl: MAIL_ROOT_URL,
    },
  },
  message: {
    from: MAIL_DEFAULT_SENDER || transport.auth.user,
  },
});

module.exports = email;
