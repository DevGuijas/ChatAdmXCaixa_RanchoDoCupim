
const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const roleSelect = document.getElementById('role');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
        const msg = {
            role: roleSelect.value,
            text: input.value
        };
        socket.emit('chatMessage', msg);
        input.value = '';
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
    item.innerHTML = `<strong>${msg.role}:</strong> ${msg.text}`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
}
