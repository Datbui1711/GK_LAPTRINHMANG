const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/sounds", express.static(path.join(__dirname, "sounds")));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/game", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "game.html"));
});

// Room management
const rooms = {};

io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  socket.on("join_room", ({ username, roomCode }) => {
    socket.join(roomCode);
    if (!rooms[roomCode]) {
      rooms[roomCode] = { 
        players: [], 
        choices: {}, 
        scores: {}, 
        gameActive: false,
        currentRound: 0,
        maxRounds: 3
      };
    }

    const room = rooms[roomCode];
    const existingPlayer = room.players.find(p => p.id === socket.id);
    
    if (!existingPlayer) {
      room.players.push({ id: socket.id, username });
      room.scores[username] = 0;
    }

    // Notify all players in room
    io.to(roomCode).emit("player_joined", {
      players: room.players.map(p => p.username),
      scores: room.scores
    });

    console.log(`👥 ${username} joined ${roomCode}`);
  });

  socket.on("start_game", ({ roomCode, maxRounds = 3 }) => {
    const room = rooms[roomCode];
    if (!room) {
      socket.emit("game_error", { message: "Phòng không tồn tại!" });
      return;
    }
    
    if (room.players.length < 2) {
      socket.emit("game_error", { message: "Cần ít nhất 2 người chơi để bắt đầu!" });
      return;
    }

    room.gameActive = true;
    room.choices = {};
    room.currentRound = 0;
    room.maxRounds = maxRounds;
    room.players.forEach(p => (room.scores[p.username] = 0));

    io.to(roomCode).emit("game_started", { maxRounds });
    console.log(`🎮 Game started in room ${roomCode} (Best of ${maxRounds})`);
  });

  socket.on("player_choice", ({ roomCode, username, choice }) => {
    const room = rooms[roomCode];
    if (!room || !room.gameActive) return;

    room.choices[username] = choice;
    io.to(roomCode).emit("choice_made", { username, choice });

    if (Object.keys(room.choices).length === 2) {
      room.currentRound++;
      const players = Object.entries(room.choices).map(([u, c]) => ({ 
        username: u, 
        choice: c 
      }));
      const [p1, p2] = players;

      const result = getWinner(p1.choice, p2.choice);
      let winner = "Draw";
      if (result === 1) winner = p1.username;
      else if (result === 2) winner = p2.username;

      if (winner !== "Draw") {
        room.scores[winner]++;
      }

      const winCount = Object.values(room.scores);
      const requiredWins = Math.ceil(room.maxRounds / 2);
      
      io.to(roomCode).emit("round_result", {
        players,
        winner,
        scores: room.scores,
        currentRound: room.currentRound,
        maxRounds: room.maxRounds
      });

      if (winCount.some(v => v >= requiredWins)) {
        const matchWinner = Object.keys(room.scores).find(u => room.scores[u] >= requiredWins);
        io.to(roomCode).emit("game_over", { winner: matchWinner });

        room.gameActive = false;
        room.choices = {};
        room.currentRound = 0;
        room.players.forEach(p => (room.scores[p.username] = 0));
      } else {
        setTimeout(() => {
          room.choices = {};
          io.to(roomCode).emit("next_round", { 
            scores: room.scores,
            currentRound: room.currentRound,
            maxRounds: room.maxRounds
          });
        }, 3000);
      }
    }
  });

  socket.on("chat_message", ({ roomCode, username, text }) => {
    io.to(roomCode).emit("chat_message", { username, text });
  });

  socket.on("leave_room", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (room) {
      const leavingPlayer = room.players.find(p => p.id === socket.id);
      room.players = room.players.filter(p => p.id !== socket.id);
      
      if (leavingPlayer && room.players.length > 0) {
        io.to(roomCode).emit("player_left", { username: leavingPlayer.username });
      }
      
      if (room.players.length === 0) {
        delete rooms[roomCode];
      }
    }
    socket.leave(roomCode);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
    
    Object.keys(rooms).forEach(roomCode => {
      const room = rooms[roomCode];
      const leavingPlayer = room.players.find(p => p.id === socket.id);
      if (leavingPlayer) {
        room.players = room.players.filter(p => p.id !== socket.id);
        if (room.players.length > 0) {
          io.to(roomCode).emit("player_left", { username: leavingPlayer.username });
        }
        if (room.players.length === 0) {
          delete rooms[roomCode];
        }
      }
    });
  });
});

function getWinner(a, b) {
  if (a === b) return 0;
  if (
    (a === "rock" && b === "scissors") ||
    (a === "paper" && b === "rock") ||
    (a === "scissors" && b === "paper")
  )
    return 1;
  return 2;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

