const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Message = require('./models/Message'); // Import Message model
require('dotenv').config(); // Load environment variables

// Access MongoDB connection string from environment variable
const mongoUri = process.env.MONGO_URI;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

    // Get all messages
    app.get('/messages', async (req, res) => {
        try {
            const messages = await Message.find();
            res.send(messages);
        } catch (err) {
            res.status(500).send({ error: 'Failed to retrieve messages' });
        }
    });

    // Get message by username
    app.get('/messages/:username', async (req, res) => {
        try {
            const message = await Message.findOne({ username: req.params.username });
            if (message) {
                res.send(message);
            } else {
                res.status(404).send({ error: 'Message not found' });
            }
        } catch (err) {
            res.status(500).send({ error: 'Failed to retrieve message' });
        }
    });

    // Create a new message
    app.post('/messages', async (req, res) => {
        try {
            const message = new Message(req.body);
            const savedMessage = await message.save();
            res.send(savedMessage);
        } catch (err) {
            res.status(500).send({ error: 'Failed to create message' });
        }
    });

    // Update a message by username
    app.patch('/messages/:username', async (req, res) => {
        try {
            const message = await Message.findOne({ username: req.params.username });
            if (message) {
                message.text = req.body.text; // Update the text field or other fields as needed
                const updatedMessage = await message.save();
                res.send(updatedMessage);
            } else {
                res.status(404).send({ error: 'Message not found' });
            }
        } catch (err) {
            res.status(500).send({ error: 'Failed to update message' });
        }
    });

    // Delete a message by username
    app.delete('/messages/:username', async (req, res) => {
        try {
            const result = await Message.deleteMany({ username: req.params.username });
            res.send(result);
        } catch (err) {
            res.status(500).send({ error: 'Failed to delete message' });
        }
    });

    // Delete all messages
    app.delete('/messages', async (req, res) => {
        try {
            const result = await Message.deleteMany({});
            res.send(result);
        } catch (err) {
            res.status(500).send({ error: 'Failed to delete messages' });
        }
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