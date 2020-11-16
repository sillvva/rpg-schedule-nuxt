let _socket;

export default {
  socket: (apiUrl, { query, rooms }) => {
    if (!_socket) {
      console.log("Establishing websocket connection...");

      const socket = io(apiUrl, {
        transports: ["websocket"],
        query: { rooms: ["global", ...rooms], ...query }
      });

      socket.on("reconnect_attempt", () => {
        socket.io.opts.transports = ["polling", "websocket"];
      });

      _socket = socket;
    }
    return _socket;
  }
};
