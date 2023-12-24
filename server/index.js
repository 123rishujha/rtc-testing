// const express = require("express");
// const app = express();
// const http = require("http").Server(app);

// const { Server } = require("socket.io");

// const io = new Server(http, {
//   cors: "http://localhost:3000",
// });

// http.listen(8000, () => {
//   console.log("server is listing on port 8000...");
// });

// //-------------------------
// const usersWantTochat = {};

// /*

// {
//   socketId: "yd_vuQIWCv6U6n7WAAAB",
//   connectionStatus: false,
//   connectedWith: null,
// }

// */

// // socket connection --------------------------------
// io.on("connection", (socket) => {
//   console.log("user connected", socket.id);

//   if (!(socket.id in usersWantTochat) && socket.id) {
//     usersWantTochat[socket.id] = {
//       socketId: socket.id,
//       connectionStatus: false,
//       connectedWith: null,
//     };
//   }

//   socket.on("connectWithSomeone", (request_from_socket) => {
//     connectWithSomeone({ request_from_socket, socket });
//   });

//   //sendMessage;
//   socket.on("sendMessage", ({ from, msg }) => {
//     io.to(usersWantTochat[from]?.connectedWith).emit("gotMessage", msg);
//   });

//   //sdp
//   socket.on("sdp", ({ fromSocket, toSocket, data }) => {
//     const payload = { data, fromSocket };
//     io.to(toSocket).emit("sdp", payload);
//   });

//   //sdp
//   socket.on("candidate", ({ fromSocket, toSocket, data }) => {
//     // const payload = { data, fromSocket };
//     io.to(toSocket).emit("candidate", data);
//   });

//   socket.on("disconnect", () => {
//     let connectedUser = usersWantTochat[socket.id]["connectedWith"];
//     usersWantTochat[connectedUser] = {
//       ...usersWantTochat[connectedUser],
//       connectionStatus: null,
//       connectedWith: null,
//     };

//     delete usersWantTochat[socket.id];
//     console.log("user disconnected", socket.id);
//   });
// });

// const connectWithSomeone = ({ request_from_socket }) => {
//   let goingToConnectWith;
//   for (let key in usersWantTochat) {
//     if (!usersWantTochat[key].connectionStatus) {
//       if (usersWantTochat[key].socketId !== request_from_socket) {
//         goingToConnectWith = usersWantTochat[key];
//       }
//     }
//   }
//   if (!goingToConnectWith) {
//     return;
//   }

//   // user want to connect
//   let requestFrom = usersWantTochat[request_from_socket];
//   requestFrom = {
//     ...requestFrom,
//     connectionStatus: true,
//     connectedWith: goingToConnectWith?.socketId,
//   };

//   usersWantTochat[request_from_socket] = requestFrom;

//   // going to connect with
//   goingToConnectWith = {
//     ...goingToConnectWith,
//     connectionStatus: true,
//     connectedWith: request_from_socket,
//   };
//   usersWantTochat[goingToConnectWith?.socketId] = goingToConnectWith;

//   // notify user that he is connected with someone
//   if (requestFrom.connectionStatus) {
//     io.to(request_from_socket).emit("connectedWithSomeOne", {
//       shouldCreateOffer: true,
//       connectedWith: goingToConnectWith,
//     });
//   }
//   // notify user that he is connected with someone
//   if (goingToConnectWith.connectionStatus) {
//     io.to(goingToConnectWith.socketId).emit("connectedWithSomeOne", {
//       shouldCreateOffer: false,
//       connectedWith: requestFrom,
//     });
//   }
// };

//---------------------------------------------------------------- optimized code ----------------------------------------------------------------
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const initializeSocket = require("./socketManager");

const FRONTEND_URL = "https://c5xltq-3000.csb.app";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: FRONTEND_URL,
});

const usersWantTochat = {};

initializeSocket(io, usersWantTochat);

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}...`);
});
