const _ = require('lodash');

const io = require('../../start/io');

const toUsers = (userId) => io.to(
  _.castArray(userId).map((_id) => `user:${_id}`),
);

const joinRoom = (userId, room) => (
  toUsers(userId).socketsJoin(room)
);

const leaveRoom = (userId, room) => (
  toUsers(userId).socketsLeave(room)
);

module.exports = {
  toUsers,
  joinRoom,
  leaveRoom,
};
