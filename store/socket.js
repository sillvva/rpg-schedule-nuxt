let _socket;

export default {
  socket: (apiUrl) => {
    if (!_socket) {
      console.log("Establishing websocket connection...");
      
      const socket = io(apiUrl, {
        transports: ['websocket']
      });

      socket.on('reconnect_attempt', () => {
        socket.io.opts.transports = ['polling', 'websocket'];
      });

      _socket = socket;
    }
    return _socket;
  }
};
