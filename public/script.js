
const socket = io();

let currentRole = null;

const loginContainer = document.getElementById('loginContainer');
const chatContainer = document.getElementById('chatContainer');
const userRoleDisplay = document.getElementById('userRole');
const form = document.getElementById('form');
const input = document.getElementById('input');
const imageInput = document.getElementById('imageUpload');
const messages = document.getElementById('messages');

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    }).then(res => res.json()).then(data => {
        if (data.success) {
            currentRole = data.role;
            userRoleDisplay.textContent = currentRole;
            loginContainer.style.display = 'none';
            chatContainer.style.display = 'flex';
        } else {
            alert('Login inválido!');
        }
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) {
        const msg = { role: currentRole, text };
        socket.emit('chatMessage', msg);
        input.value = '';
    }

    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        const formData = new FormData();
        formData.append('image', file);
        formData.append('role', currentRole);

        fetch('/upload', {
            method: 'POST',
            body: formData
        }).then(res => res.json()).then(data => {
            if (data.success && data.imageUrl) {
                socket.emit('chatMessage', {
                    role: currentRole,
                    image: data.imageUrl
                });
            }
            imageInput.value = '';
        }).catch(err => {
            console.error('Erro ao enviar imagem:', err);
        });
    }
});

socket.on('chatMessage', (msg) => addMessage(msg));
socket.on('chatHistory', (history) => history.forEach(msg => addMessage(msg)));

function addMessage(msg) {
    const item = document.createElement('li');
    item.classList.add(msg.role === 'Caixa' ? 'message-caixa' : 'message-admin');
    
    item.innerHTML = `<strong>${msg.role}:</strong> `;
    if (msg.text) item.innerHTML += msg.text;
    if (msg.image) item.innerHTML += `<br><img src="${msg.image}" style="max-width: 100%; border-radius: 8px;">`;

    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
}