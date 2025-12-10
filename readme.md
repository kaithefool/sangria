# Sangria

## Getting Start
##### Prerequisites
- Nodejs >= 16.0.0
- Mongodb >= 4.2.2

##### Installation
```shell
npm i
```
##### Start the server
```shell
npm start
```
```

## Command line interface
##### Generate the first admin user
```shell
./server/bin/gen-admin [username@domain.com] [password]
```

##### Generate resources API and CMS UI
```shell
npx hygen new api [resource]
npx hygen new cms [resource]
```
##### Singletons
```shell
npx hygen new api [resource] --singleton
npx hygen new cms [resource] --singleton
```
## CMS UI React components
After logging in as admin,
Visit [localhost:3000/admin/example](http://localhost:3000/admin/example) to see the showcase of CMS UI React components.

## Deploy
##### Setup directories in deploy environment
```shell
pm2 deploy [env] setup
```

##### ... and deploy
```shell
pm2 deploy [env]
```

## Environment variables
`HTTPS=0`
  Set to 1 to enable HTTPS.
`PORT=3000`
  Port number the server listens on.  
`ACCESSLOG_TTL=180d`
  Access log time to live.  

`COOKIE_SECRET`
  Sec ret string for signing cookies.
`JWT_ACCESS_TTL=5m`
  Access token time to live.  
`JWT_REFRESH_TTL=15d`
  Refresh token time to live.  
`OTP_EMAIL_TTL=60m`
  OTP code sent via email time to live.  
`OTP_EMAIL_MAX=3`
  Maximum times a user can request for OTP code sent via email.  
`OTP_SMS_TTL=15m`
  OTP code sent via SMS time to live.  
`OTP_SMS_MAX=3`
  Maximum times a user can request for OTP code sent via SMS.  

`MONGO_URI=mongodb://localhost:27017/{package_name}`
  MongoDB connection URI.  
`MONGO_AUTO_INDEX`
  Set to enable automatic index synchronization.  
`REDIS_URL`
  Redis connection URL. Set to enable Redis.  
`SOCKET=0`
  Set to `1` to enable Web Sockets.  
`MAIL_ROOT_URL`
  Root URL for email links.  
`MAIL_HOST`
  Set SMTP host for sending emails.  
`MAIL_PORT`
  Set SMTP port for sending emails.  
`MAIL_USER`
  Set SMTP username for sending emails.  
`MAIL_PASSWORD`
  Set SMTP password for sending emails.  
`MAIL_DEFAULT_SENDER`
  Default sender email address.  
`SMS_ACC_SID`
  Twilio account SID for sending SMS.  
`SMS_AUTH_TOKEN`
  Twilio account auth token for sending SMS.  
`SMS_FROM_NO`
  Twilio account phone no for sending SMS.  
`GOOGLE_API_KEY`
  Google API key for Google Maps and other services.  
`GOOGLE_RECAPTCHA_PUBIC_KEY`
  Google reCAPTCHA public key for client-side reCAPTCHA.  
`GOOGLE_RECAPTCHA_SECRET_KEY`
  Google reCAPTCHA secret key for server-side reCAPTCHA verification.  
`LNG=en,zh-hant`
  Languages to enable for i18n.  
`LNG_LABEL=EN,中文`
  Language labels corresponding to `LNG`.  
`LNG_FLAG=🇬🇧,🇭🇰`
  Language flags corresponding to `LNG`.  