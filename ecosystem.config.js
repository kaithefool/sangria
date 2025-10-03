const {
  name,
  repository: { url: repo },
} = require('./package.json');

const postSetup = () => [
  'mkdir -p ../shared/uploads ../shared/secrets',
  'ln -sf ../shared/uploads .',
  'ln -sf ../shared/secrets .',
].join(' && ');

const postDeploy = (env) => [
  'npm i',
  `pm2 startOrReload ecosystem.config.js --env=${env}`,
].join(' && ');

const scripts = (env) => ({
  'post-deploy': postDeploy(env),
  'post-setup': postSetup(env),
});

module.exports = {
  apps: [{
    name,
    script: './server/bin/www',
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
