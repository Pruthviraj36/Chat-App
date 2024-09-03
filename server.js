const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const Message = require('./models/Message')
const messageRoute = require('./MsgRoute')
require('dotenv').config()
 
const mongoUri = process.env.MONGO_URI

const app = express()
const server = http.createServer(app)
const io = socketIo(server)
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/dynamo', messageRoute)


mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB connected')
    app.use(express.static('public'))

    io.on('connection', (socket) => {
        console.log('A user connected')

        Message.find().sort({ timestamp: 1 }).exec()
        .then(messages => {
            messages.forEach(msg => socket.emit('chat message', msg))
        })
        .catch(err => {
            console.error('Error retrieving messages:', err)
        })
        
        socket.on('chat message', (msg) => {
            const message = new Message({
                username: msg.username,
                text: msg.text,
                timestamp: new Date().toLocaleTimeString()
            })

            message.save()
            .then(() => {
                io.emit('chat message', message)
            })
            .catch(err => {
                console.error('Error saving message:', err)
            })
        })

        socket.on('disconnect', () => {
            console.log('User disconnected')
        })
    })

    const PORT = 4000
    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`)
    })
})