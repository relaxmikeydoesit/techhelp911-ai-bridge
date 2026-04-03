// --- 1. Global State ---
let chatHistory = []; 

// --- 2. The Master Chat Function ---
async function sendMessage() {
    const input = document.getElementById('user-input');
    const body = document.getElementById('chat-body');
    const text = input.value.trim();
    
    if (!text) return;

    body.innerHTML += `<div class="msg user-msg">${text}</div>`;
    input.value = '';
    body.scrollTop = body.scrollHeight;

    const typingId = 'typing-' + Date.now();
    body.innerHTML += `<div id="${typingId}" class="msg ai-msg">...</div>`;

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: text, history: chatHistory })
        });

        const data = await response.json();
        const rawAiMessage = data.text || "I'm having trouble connecting!";

        // 1. Create a version for the UI (with links)
        const formattedMessage = rawAiMessage.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, function(match, text, url) {
            return `<a href="${url}" target="_blank" class="chat-link">${text}</a>`;
        });

        // 2. Show the formatted version to the user
        document.getElementById(typingId).innerHTML = formattedMessage;

        // 3. Save the RAW version to history
        chatHistory.push({ role: "user", parts: [{ text: text }] });
        chatHistory.push({ role: "model", parts: [{ text: rawAiMessage }] });

    } catch (error) {
        const typingElem = document.getElementById(typingId);
        if (typingElem) typingElem.innerText = "🚨 Connection lost.";
    }

    body.scrollTop = body.scrollHeight;
} // <--- THIS BRACE was missing or in the wrong place!

// --- 3. Utility Functions ---

function handleKey(e) { 
    if (e.key === 'Enter') sendMessage(); 
}

function toggleChat() {
    const win = document.getElementById('chat-window');
    if (!win) return;
    
    win.classList.toggle('chat-hidden');
    
    if (win.classList.contains('chat-hidden')) {
        win.classList.remove('expanded');
        const expandBtn = document.getElementById('expand-btn');
        if(expandBtn) expandBtn.innerText = '⛶';
    }
}

function expandChat() {
    const win = document.getElementById('chat-window');
    const btn = document.getElementById('expand-btn');
    if (!win) return;

    win.classList.toggle('expanded');
    btn.innerText = win.classList.contains('expanded') ? '❐' : '⛶';
}