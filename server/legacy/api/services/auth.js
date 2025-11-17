const jwt = require('jsonwebtoken');
const _ = require('lodash');

const { nanoid } = require('nanoid');
const Service = require('../base/Service');
const usersModel = require('../models/users');

const {
  JWT_SECRET = nanoid(32),
  JWT_ACCESS_TTL = '5m',
  JWT_REFRESH_TTL = '15d',
} = process.env;

// props to store within the token
const userProps = [
  '_id',
  'role',
  'lng',
];

class AuthServ extends Service {
  async login(user, persist) {
    // record login time
    await this.patch(
      { _id: user._id, lastLogin: new Date() },
    );

    return this.signTokens(user, persist);
  }

  async authenticate({ persist, ...cred }) {
    const u = await this.basicStrag(cred);

    // record login time
    return this.login(u, persist);
  }

  async basicStrag({ email, password }) {
    const [u] = await this.find({
      filter: { email },
      select: '+password',
    });

    if (!u) {
      this.throw(400, 'res.invalidCredentials');
    }
    if (!u.active) {
      this.throw(400, 'res.userInactivated');
    }
    if (!await this.model.comparePwd(password, u.password)) {
      this.throw(400, 'res.invalidCredentials');
    }

    return u;
  }

  signTokens(user, persist = false) {
    const props = _.pick(user, userProps);

    return {
      user: props,
      persist,
      access: jwt.sign(
        props,
        JWT_SECRET,
        { expiresIn: JWT_ACCESS_TTL },
      ),
      refresh: jwt.sign(
        { _id: user._id, persist: Boolean(persist) },
        JWT_SECRET,
        { expiresIn: JWT_REFRESH_TTL },
      ),
    };
  }

  verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }

  async renewTokens(refreshTk) {
    let payload;

    try {
      payload = this.verifyToken(refreshTk);
    } catch (e) {
      this.throw(400, 'res.invalidToken');
    }

    const { _id, persist, iat } = payload;

    const [u] = await this.find({
      filter: {
        _id,
        active: 1,
      },
    });

    if (!u) {
      this.throw(400, 'res.invalidToken');
    }

    // check if user has logged out
    // after the token was issued
    if (u.lastLogout > new Date(iat * 1000)) {
      this.throw(400, 'res.loggedOut');
    }

    return {
      user: _.pick(u, userProps),
      ...this.signTokens(u, persist),
    };
  }

  async verifyOrRenew({ access, refresh }) {
    if (access) {
      try {
        const user = this.verifyToken(access);

        return { user };
      } catch (e) {
        // do nothing
      }
    }
    if (refresh) {
      const o = await this.renewTokens(refresh);

      return o;
    }

    this.throw(400, 'res.invalidToken');

    // todo: unreachable return
    return null;
  }

  async refresh({ token }) {
    const { access, refresh } = await this.renewTokens(token);

    return { access, refresh };
  }

  async logout(attrs, user) {
    if (user) {
      await this.patch(
        { _id: user._id, lastLogout: new Date() },
      );
    }
  }
}

module.exports = new AuthServ(usersModel);
