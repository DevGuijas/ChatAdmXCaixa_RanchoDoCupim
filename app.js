
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let messages = [];

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
    console.log('Um usuário conectou');

    // Enviar o histórico para o novo usuário
    socket.emit('chatHistory', messages);

    socket.on('chatMessage', (msg) => {
        messages.push(msg);
        io.emit('chatMessage', msg);
    });

    socket.on('disconnect', () => {
        console.log('Um usuário desconectou');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor de Chat rodando em http://localhost:${PORT}`);
});
