
const socket = io();

let currentRole = null;

const loginContainer = document.getElementById('loginContainer');
const chatContainer = document.getElementById('chatContainer');
const userRoleDisplay = document.getElementById('userRole');
const form = document.getElementById('form');
const input = document.getElementById('input');
const imageInput = document.getElementById('imageUpload');
const messages = document.getElementById('messages');

// Emoji Toggle:
const emojiToggle = document.getElementById('emojiToggle');
const emojiPanel = document.getElementById('emojiPanel');
const inputField = document.getElementById('input');

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
        emojiPanel.style.display = 'none'; // Fecha o painel de emoji.
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

const notificationSound = new Audio('/notification.mp3');

function shouldPlayNotification(senderRole) {
    // Só toca se:
    // 1. A aba NÃO está visível (document.hidden é true).
    // 2. E a mensagem veio do papel diferente do usuário atual.
    return document.hidden && senderRole !== currentRole;
}

function addMessage(msg) {
    const item = document.createElement('li');
    item.classList.add(msg.role === 'Caixa' ? 'message-caixa' : 'message-admin');
    
    item.innerHTML = `<strong>${msg.role}:</strong> `;
    if (msg.text) item.innerHTML += msg.text;
    if (msg.image) item.innerHTML += `<br><img src="${msg.image}" style="max-width: 100%; border-radius: 8px;">`;

    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;

    // Toca o som de notificação se for de outro papel e a aba não estiver visível.
    if (shouldPlayNotification(msg.role)) {
        notificationSound.play().catch(err => console.error("Erro ao tocar som:", err));
    }
}

emojiToggle.addEventListener('click', () => {
    emojiPanel.style.display = emojiPanel.style.display === 'none' ? 'block' : 'none';
});

// Inserir emoji ao clicar:
emojiPanel.addEventListener('click', (e) => {
    if (e.target.tagName === 'SPAN') {
        inputField.value += e.target.textContent;
        inputField.focus();
    }
});