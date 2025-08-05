
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for socket.io
const server = http.createServer(app);

// Initialize socket.io server
const io = new Server(server, {
  cors: {
    origin: "https://majestic-quokka-133518.netlify.app",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cookieParser());
// Middleware
app.use(cors({
  origin: 'https://majestic-quokka-133518.netlify.app',
  credentials: true
}));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("AI Quiz Generator API is running");
});
app.use('/api/auth', authRoutes);
app.use("/api/quizzes", quizRoutes);

// app.get('/api/ping', (req, res) => {
//   res.json({ message: 'pong' });
// });


// Set io in app so we can use in controllers
app.set("io", io);

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(err => console.error("MongoDB connection error:", err));

// Start listening
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Client joins a quiz room
  socket.on("joinRoom", (roomCode) => {
    socket.join(roomCode);
    console.log(`User ${socket.id} joined room ${roomCode}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});