const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

let waitingUser = null;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinQueue", () => {
    if (waitingUser) {
      const otherUser = waitingUser;
      waitingUser = null;
      socket.emit("matchFound", otherUser.id);
      otherUser.emit("matchFound", socket.id);
    } else {
      waitingUser = socket;
    }
  });

  socket.on("signal", ({ to, data }) => {
    io.to(to).emit("signal", { from: socket.id, data });
  });

  socket.on("disconnect", () => {
    if (waitingUser && waitingUser.id === socket.id) {
      waitingUser = null;
    }
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
