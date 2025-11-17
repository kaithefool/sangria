const io = require('../../start/io');

io.on('connect', async (socket) => {
  const { request: { user } } = socket;

  socket.join(`user:${user._id}`);

  // join rooms...
});
