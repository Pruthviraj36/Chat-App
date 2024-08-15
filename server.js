const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./models/Message'); // Import Message model
require('dotenv').config(); // Load environment variables

// Access MongoDB connection string from environment variable
const mongoUri = process.env.MONGO_URI;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to MongoDB using environment variable
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB connected');
    app.use(express.static('public'));

    io.on('connection', (socket) => {
        console.log('A user connected');

        // Retrieve and send all messages to the new user
        Message.find().sort({ timestamp: 1 }).exec()
        .then(messages => {
            messages.forEach(msg => socket.emit('chat message', msg));
        })
        .catch(err => {
            console.error('Error retrieving messages:', err);
        });
        
        socket.on('chat message', (msg) => {
            const message = new Message({
                username: msg.username,
                text: msg.text,
                timestamp: new Date().toLocaleTimeString()
            });

            message.save()
            .then(() => {
                io.emit('chat message', message); // Broadcast message to all clients
            })
            .catch(err => {
                console.error('Error saving message:', err);
            });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    const PORT = 4000;
    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
})
.catch(error => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});