const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Groq Client
// If key is missing, it will throw an error when used, handled in try/catch below.
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/', async (req, res) => {
    const { message } = req.body;

    if (!process.env.GROQ_API_KEY) {
        console.error('GROQ_API_KEY is missing in .env');
        return res.json({ reply: "I'm sorry, I'm not fully configured yet. (Missing API Key)" });
    }

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are "D-Cure Assistant", a helpful and friendly AI for a dental clinic called DCURE.
                    
                    Your Role:
                    - Help patients with general dental inquiries (e.g., "Does a cleaning hurt?", "Whitening costs").
                    - Guide them to "Book Appointment" or "Check Status" for specific actions.
                    - Clinic Hours: Mon-Sat, 9:00 AM - 9:00 PM.
                    - Location: Vadodara, Gujarat.
                    
                    Constraints:
                    - Keep answers concise (under 3 sentences where possible).
                    - Do NOT provide medical diagnoses. Always recommend booking a consultation.
                    - Be polite and professional.`
                },
                { role: 'user', content: message }
            ],
            model: 'llama-3.3-70b-versatile', // Updated supported model
        });

        const reply = completion.choices[0]?.message?.content || "I didn't catch that. Could you rephrase?";
        res.json({ reply });

    } catch (err) {
        console.error('Groq API Error:', err.message);
        res.status(500).json({ reply: "I'm having trouble thinking right now. Please try again later." });
    }
});

module.exports = router;
