// api/bot.js
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/bot', async (req, res) => {
    try {
        const { prompt } = req.body;

        // ==========================================================
        // --- PASTE YOUR GOOGLE AI STUDIO CODE LOGIC HERE ---
        //
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        //
        // ==========================================================

        res.status(200).json({ reply: text });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong!' });
    }
});

module.exports = app;