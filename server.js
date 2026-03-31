require('dotenv').config();
const express = require('express');
const { GoogleGenAI } = require("@google/genai"); 
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(__dirname)); 

// 1. Double-check initialization
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.post('/chat', async (req, res) => {
    try {
        // We expect 'prompt' and 'history' from chat.js
        const { prompt, history = [] } = req.body; 

        // 2. The Bridge Call
        const response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: [...history, { role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: `**ROLE:** You are AIden, the TechHelp911 receptionist. Introduce yourself as AIden and warmly greet client. 
                **GOAL:** Collect Name, Email, and User's Question. When you have the info, please put it into the Magic Link below
                **IMPORTANT:** Ensure that the link given to the client is clickable.
                **MAGIC LINK:** https://docs.google.com/forms/d/e/1FAIpQLSfSyWOCaTOYbx8lXiha1SpUVR_uuBmzXASSXEZWI6v11z6A-Q/viewform?usp=pp_url&entry.491432691=I+agree.&entry.2005620554=USER_NAME&entry.1045781291=USER@EXAMPLE.COM&entry.839337160=USER_QUESTION 
                **UNFILLED-LINK:** https://forms.gle/heDiXdQjWvPVK5DAA` ,
                
                temperature: 0,
                maxOutputTokens: 3150 
            }
        });

        // 3. Success! Send back to frontend
        res.json({ text: response.text });
        
    } catch (error) {
        // 4. THE DIAGNOSIS: This prints the real reason in your terminal
        console.error("--- BRAIN CONNECTION ERROR ---");
        console.error("Message:", error.message);
        if (error.cause) console.error("Cause:", error.cause);
        
        res.status(500).json({ 
            error: "Brain not responding", 
            details: error.message 
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ TechHelp911 Bridge active at http://localhost:3000`);
});