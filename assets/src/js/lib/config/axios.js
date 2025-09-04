import axios from 'axios';
import env from './env';

function getCsrf() {
  return axios.defaults.headers.common['x-csrf-token'];
}
function setCsrf() {
  axios.defaults.headers.common['x-csrf-token'] = env.csrf;
}
setCsrf();

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    env.get();
    if (getCsrf() !== env.csrf) {
      setCsrf();
    }
  }
});

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    const { status, data } = (err.response || {});

    // trigger auth redirects
    if (status === 401) {
      window.location.reload();
    }
    if (status === 403) {
      if (data?.type === 'invalid-csrf') {
        // TODO:
        // iOS safari (and browsers using the same engine)
        // dumps session cookies randomly.
        // This causes the lost of CSRF secret
        // within the httpOnly session cookie.
        // This temp fix refresh both the secrets and tokens
        // but may introduce infinity reload loop in somewhere.
        window.location.reload();
      } else {
        window.location.href = '/logout';
      }
    }

    return Promise.reject(err);
  },
);

export default axios;
