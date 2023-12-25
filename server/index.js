//---------------------------------------------------------------- optimized code ----------------------------------------------------------------
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const initializeSocket = require("./socketManager");

// const FRONTEND_URL = "http://localhost:3000/";
const FRONTEND_URL = process.env.FRONTEND_URL;
console.log(FRONTEND_URL);

const app = express();
app.use(cors());
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
