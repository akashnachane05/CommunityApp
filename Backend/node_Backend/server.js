// in server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const http = require('http'); // Import http
const { Server } = require("socket.io"); // Import Server from socket.io

// --- Import all your route files ---
const userRoutes = require('./routes/userRoutes');
const alumniRoutes = require('./routes/alumniRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const postRoutes = require('./routes/postRoutes');
const eventRoutes = require('./routes/eventRoutes');
const mentorshipRoutes = require('./routes/mentorshipRoutes');
const conversationRoutes = require('./routes/conversationRoutes'); 
const recommendationRoutes = require('./routes/recommendationRoutes'); // Add this
const statsRoutes = require('./routes/statsRoutes'); // Add this
const jobsRoutes = require("./routes/jobsRoutes");
const notificationRoutes = require('./routes/notificationRoutes');
const app = express();
const server = http.createServer(app); // Create an HTTP server from the Express app

// --- Configure Socket.IO ---
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Connect All API Routes to the App ---
app.use('/api/users', userRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/mentorships', mentorshipRoutes);
app.use('/api/conversations', conversationRoutes); // Add this
app.use('/api/recommendations', recommendationRoutes); // Add this
app.use('/api/stats', statsRoutes); // Add thi
app.use("/api/jobs", jobsRoutes);
app.use('/api/notifications', notificationRoutes);
// --- Socket.IO Connection Logic ---
io.on('connection', (socket) => {
  console.log('✅ A user connected:', socket.id);

  // User joins a room based on their user ID
  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined room ${userId}`);
  });

  // Handle sending messages
  // in server.js -> io.on('connection', ...)

  // in server.js -> io.on('connection', ...)

    socket.on('sendMessage', ({ sender, text, receiverId }) => {
      const messageData = {
        sender,
        text,
        createdAt: new Date()
      };

      // 1. Send the message to the receiver's chat window (if open)
      io.to(receiverId).emit('receiveMessage', messageData);

      // 2. ✅ NEW: Send a notification to the receiver
      io.to(receiverId).emit('newMessageNotification', {
        from: sender.fullName,
        message: text
      });
    });
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// --- Database Connection & Server Start ---
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    // Use server.listen instead of app.listen
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));