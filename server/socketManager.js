const { connectWithSomeone } = require("./socketController");

// {
//   socketId: "yd_vuQIWCv6U6n7WAAAB",
//   connectionStatus: false,
//   connectedWith: null,
// }
const initializeSocket = (io, usersWantTochat) => {
  io.on("connection", (socket) => {
    console.log("user connected", socket.id);

    if (!(socket.id in usersWantTochat) && socket.id) {
      usersWantTochat[socket.id] = {
        socketId: socket.id,
        connectionStatus: false,
        connectedWith: null,
      };
    }

    socket.on("connectWithSomeone", (request_from_socket) => {
      connectWithSomeone({
        request_from_socket,
        usersWantTochat,
        io,
      });
    });

    // sendMessage
    socket.on("sendMessage", ({ from, msg }) => {
      io.to(usersWantTochat[from]?.connectedWith).emit("gotMessage", msg);
    });

    // sdp
    socket.on("sdp", ({ fromSocket, toSocket, data }) => {
      const payload = { data, fromSocket };
      io.to(toSocket).emit("sdp", payload);
    });

    // candidate
    socket.on("candidate", ({ fromSocket, toSocket, data }) => {
      io.to(toSocket).emit("candidate", data);
    });

    socket.on("disconnect", () => {
      let connectedUser = usersWantTochat[socket.id]?.connectedWith;
      if (connectedUser) {
        usersWantTochat[connectedUser] = {
          ...usersWantTochat[connectedUser],
          connectionStatus: null,
          connectedWith: null,
        };
      }
      if (connectedUser) {
        io.to(connectedUser).emit("userDisconnected");
      }

      delete usersWantTochat[socket.id];
      console.log("user disconnected", socket.id);
    });
  });
};

module.exports = initializeSocket;
