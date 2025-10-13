const {
  name,
  repository: { url: repo },
} = require('./package.json');

const postSetup = () => [
  'mkdir -p ../shared/secrets',
  'touch ../shared/secrets/.env',
  'mkdir -p ../shared/uploads',
  'ln -sf ../shared/uploads .',
].join(' && ');

const postDeploy = (env) => [
  'npm i',
  `pm2 startOrReload ecosystem.config.js --env=${env}`,
].join(' && ');

const cmd = () => [
  'set -a',
  '. ../shared/secrets/.env',
  'set +a',
  './server/bin/www',
].join(' && ');

const scripts = (env) => ({
  'post-deploy': postDeploy(env),
  'post-setup': postSetup(env),
});

module.exports = {
  apps: [{
    name,
    script: cmd(env),
    max_memory_restart: '1G',
    instances: 'max',
    env: { NODE_ENV: 'development' },
    env_uat: { NODE_ENV: 'uat' },
    env_prd: { NODE_ENV: 'production' },
    time: true,
  }],

  deploy: {
    uat: {
      user: 'SSH_USERNAME',
      host: 'SSH_HOSTMACHINE',
      ref: 'origin/master',
      repo,
      path: `/home/ubuntu/www-nodejs/${name}`,
      ...scripts('uat'),
    }
  }
};
