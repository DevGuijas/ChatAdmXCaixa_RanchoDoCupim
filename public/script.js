const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const imageInput = document.getElementById('imageUpload');
const messages = document.getElementById('messages');
const roleSelect = document.getElementById('role');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const role = roleSelect.value;
    const text = input.value.trim();

    if (text) {
        const msg = { role, text };
        socket.emit('chatMessage', msg);
        input.value = '';
    }

    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        const formData = new FormData();
        formData.append('image', file);
        formData.append('role', role);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success && data.imageUrl) {
                socket.emit('chatMessage', {
                    role,
                    image: data.imageUrl
                });
            }
            imageInput.value = '';
        })
        .catch(err => {
            console.error('Erro ao enviar imagem:', err);
        });
    }
});

socket.on('chatMessage', (msg) => {
    addMessage(msg);
});

socket.on('chatHistory', (history) => {
    history.forEach(msg => addMessage(msg));
});

function addMessage(msg) {
    const item = document.createElement('li');

    // Aplica classe de cor com base no papel
    if (msg.role === 'Caixa') {
        item.classList.add('message-caixa');
    } else if (msg.role === 'Administração') {
        item.classList.add('message-admin');
    }

    item.innerHTML = `<strong>${msg.role}:</strong> `;
    if (msg.text) item.innerHTML += msg.text;
    if (msg.image) item.innerHTML += `<br><img src="${msg.image}" style="max-width: 100%; border-radius: 8px;">`;

    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
}