// --- 1. Global State ---
let chatHistory = []; 

// --- 2. The Master Chat Function ---
async function sendMessage() {
    const input = document.getElementById('user-input');
    const body = document.getElementById('chat-body');
    const text = input.value.trim();
    
    // Don't send empty messages
    if (!text) return;

    // A. Update UI: Show User Message
    body.innerHTML += `<div class="msg user-msg">${text}</div>`;
    input.value = ''; // Clear input
    body.scrollTop = body.scrollHeight;

    // B. Update UI: Show Typing Indicator
    const typingId = 'typing-' + Date.now();
    body.innerHTML += `<div id="${typingId}" class="msg ai-msg">...</div>`;
    body.scrollTop = body.scrollHeight;

    try {
        // C. Talk to the Bridge (Passing History)
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt: text, 
                history: chatHistory 
            })
        });

        const data = await response.json();
        const aiMessage = data.text || "I'm having trouble connecting to my brain!";

        // D. Update UI: Replace "..." with AI response
        document.getElementById(typingId).innerText = aiMessage;

        // E. CRITICAL: Save this exchange to History
        chatHistory.push({ role: "user", parts: [{ text: text }] });
        chatHistory.push({ role: "model", parts: [{ text: aiMessage }] });

    } catch (error) {
        document.getElementById(typingId).innerText = "🚨 Connection to Bridge lost.";
    }
    
    body.scrollTop = body.scrollHeight;
}

// --- 3. Utility Functions ---

function handleKey(e) { 
    if (e.key === 'Enter') sendMessage(); 
}

function toggleChat() {
    const win = document.getElementById('chat-window');
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