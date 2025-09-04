const env = {
  get() {
    Object.keys(this).forEach((key) => {
      if (typeof this[key] !== 'function') {
        delete this[key];
      }
    });
    const el = document.querySelector('#env');
    Object.assign(this, JSON.parse(el.innerHTML));
  },
};

env.get();

export default env;
