
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// In-memory storage for classes and questions
let classes = {};

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.on('join class', (code) => {
        if (classes[code]) {
            socket.join(code);
            socket.emit('joined', code);
        } else {
            socket.emit('error', 'Class code not found');
        }
    });

    socket.on('ask question', (data) => {
        io.to(data.code).emit('new question', { question: data.question });
    });

    socket.on('create class', (code) => {
        classes[code] = [];
        socket.emit('class created', code);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
