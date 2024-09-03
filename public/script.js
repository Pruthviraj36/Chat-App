(function () {
    // Retrieve the username from localStorage
    const username = localStorage.getItem('username') || 'Anonymous';

    const socket = io();

    document.getElementById('sendButton').addEventListener('click', function () {
        const input = document.getElementById('messageInput');
        const messageText = input.value.trim();

        if (messageText) {
            socket.emit('chat message', {
                username: username,
                text: messageText
            });
            input.value = '';
        }
    });

    document.getElementById('messageInput').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.getElementById('sendButton').click();
        }
    });

    socket.on('chat message', (msg) => {
        const messageType = msg.username === username ? 'user' : 'received';
        addMessage(msg.username, msg.text, msg.timestamp, messageType);
    });

    function addMessage(username, text, timestamp, type) {
        const chatBox = document.getElementById('chatBox');
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', type);

        const messageTextElement = document.createElement('div');
        messageTextElement.classList.add('message-text');
        messageTextElement.textContent = text;

        const messageInfoElement = document.createElement('div');
        messageInfoElement.classList.add('message-info');
        messageInfoElement.textContent = `${username} - ${timestamp}`;

        messageElement.appendChild(messageTextElement);
        messageElement.appendChild(messageInfoElement);
        chatBox.appendChild(messageElement);

        // Scroll to the bottom
        chatBox.scrollTop = chatBox.scrollHeight;
    }
})();
