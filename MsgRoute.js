const express = require('express')
const Message = require('./models/Message')
const route = express.Router()

// Get all messages
route.get('/', async (req, res) => {
    try {
        const messages = await Message.find();
        res.send(messages);
    } catch (err) {
        res.status(500).send({ error: 'Failed to retrieve messages' });
    }
});

// Get message by username
route.get('/:username', async (req, res) => {
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
route.post('/create', async (req, res) => {
    try {
        const message = new Message(req.body);
        const savedMessage = await message.save();
        res.send(savedMessage);
    } catch (err) {
        res.status(500).send({ error: 'Failed to create message' });
    }
});

// Update a message by username
route.patch('/update/:username', async (req, res) => {
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
route.delete('/delete/:username', async (req, res) => {
    try {
        const result = await Message.deleteMany({ username: req.params.username });
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: 'Failed to delete message' });
    }
});

// Delete all messages
route.delete('/deleteAll', async (req, res) => {
    try {
        const result = await Message.deleteMany({});
        res.send(result);
    } catch (err) {
        res.status(500).send({ error: 'Failed to delete messages' });
    }
});

module.exports = route