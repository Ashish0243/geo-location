const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

// Store active users in memory (for MVP)
const activeUsers = new Map();

app.get('/', (req, res) => {
    res.send('Geolocation App Server');
});

// Serve static files for the frontend
app.use(express.static('frontend/build'));

// Real-time location updates
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Immediately send all current users' locations to new user
    const existingLocations = Array.from(activeUsers.entries()).map(([id, location]) => ({
        userId: id,
        ...location
    }));
    socket.emit('initial-locations', existingLocations);
    
    socket.on('location-update', (location) => {
        // Store updated location
        activeUsers.set(socket.id, location);
        
        // Broadcast to all clients immediately
        io.emit('location-update', {
            userId: socket.id,
            ...location
        });
    });

    socket.on('disconnect', () => {
        // Remove user when they disconnect
        activeUsers.delete(socket.id);
        io.emit('user-disconnected', socket.id);
        console.log('User disconnected:', socket.id);
    });
});

server.listen(5000, () => {
    console.log('Server listening on port 5000');
});