const twilio = require('twilio');

const {
  SMS_ACC_SID,
  SMS_AUTH_TOKEN,
  SMS_FROM_NO,
} = process.env;
let client;

if (SMS_ACC_SID && SMS_AUTH_TOKEN) {
  client = twilio(SMS_ACC_SID, SMS_AUTH_TOKEN);
}

module.exports = ({
  to,
  body,
}) => {
  const no = to.toString();

  // numbers start with 1 are for testing
  if (client && no[0] !== '1') {
    return client.messages.create({
      body,
      from: SMS_FROM_NO,
      to: no[0] === '+' ? no : `+852${no}`,
    });
  }

  console.info('SMS message: ', body);

  return null;
};
