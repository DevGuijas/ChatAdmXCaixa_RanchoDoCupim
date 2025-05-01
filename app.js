const express = require('express');
const http = require('http');
const path = require('path');
const multer = require('multer');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let messages = [];

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

app.use(express.static(path.join(__dirname, 'public')));

app.post('/upload', upload.single('image'), (req, res) => {
    const role = req.body.role || 'Desconhecido';
    const imageUrl = '/uploads/' + req.file.filename;
    const msg = { role: role, image: imageUrl };
    messages.push(msg);
    io.emit('chatMessage', msg);
    res.json({ success: true });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

io.on('connection', (socket) => {
    console.log('Um usuário conectou');
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
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
