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
