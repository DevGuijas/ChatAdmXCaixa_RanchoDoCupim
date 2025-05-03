
const express = require('express');
const http = require('http');
const path = require('path');
const multer = require('multer');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let messages = [];

const users = {
    caixa: "1234",
    adm: "1234"
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username] && users[username] === password) {
        res.json({ success: true, role: username === "caixa" ? "Caixa" : "Administração" });
    } else {
        res.json({ success: false });
    }
});

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
    socket.emit('chatHistory', messages);
    socket.on('chatMessage', (msg) => {
        messages.push(msg);
        io.emit('chatMessage', msg);
    });
});

server.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});