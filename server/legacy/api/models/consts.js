const consts = {
  // constants that are used within server only
  private: {
  },
  // constants that are avaliable on both client and server
  public: {
    roles: ['admin', 'client'],
  },
};

module.exports = new Proxy(consts, {
  get(t, prop) {
    if (['private', 'public'].includes(prop)) return t[prop];

    return t.private[prop] || t.public[prop];
  },
});
