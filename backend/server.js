const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const redis = require("redis");
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

const redisHost = process.env.REDIS_HOST || 'redis'; // Default to 'redis' for Docker network
const redisPort = process.env.REDIS_PORT || 6379; // Default Redis port

const redisClient = redis.createClient({
    url: `redis://${redisHost}:${redisPort}`,
});

redisClient.on('error', (err) => console.error('Redis error:', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

// Connect to Redis
(async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
})();

app.get('/', (req, res) => {
    res.send('Geolocation App Server');
});

// Serve static files for the frontend
app.use(express.static('frontend/build'));

// Real-time location updates
io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.on('update-location', (location) => {
        // Store location in Redis
        redisClient.hSet('locations', location.userId, JSON.stringify(location));
        // Broadcast to all connected clients
        io.emit('location-update', location);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(5000, () => {
    console.log('Server listening on port 5000');
});