const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { verifyToken } = require('./firebase');
const { getFinancialAdvice } = require('./aiService');
const { calculateHealthScore, calculateSimulation } = require('./financeController');

const app = express();
app.use(cors());
app.use(express.json());

// Uncomment below to apply auth middle to API routes
// app.use('/api', verifyToken);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, financialData } = req.body;
        // In reality, map financialData with DB doc tied to req.user.uid
        const advice = await getFinancialAdvice(message, financialData);
        res.json({ reply: advice });
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ error: 'Failed to process chat query' });
    }
});

app.post('/api/health-score', (req, res) => {
    try {
        const data = req.body;
        const scoreData = calculateHealthScore(data);
        res.json(scoreData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to calculate health score' });
    }
});

app.post('/api/simulate', (req, res) => {
    try {
        const { currentSavings, monthlySavings, months } = req.body;
        const projection = calculateSimulation(currentSavings, monthlySavings, months);
        res.json({ projection });
    } catch (error) {
        res.status(500).json({ error: 'Failed to run simulation' });
    }
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Catch-all to serve index.html for SPA-like direct links
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// For local testing
if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

// Export for Vercel
module.exports = app;
