const dotenv = require('dotenv');
require('./db');
const cors = require('cors');
const express = require('express');
const authRouter = require('./routers/auth.router');
const userRouter = require('./routers/users.router');
const noteRouter = require('./routers/notes.router');
const { authenticateToken } = require('./middlewares/auth.middleware');

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();

// CORS configuration remains the same
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://localhost:3000',
            'https://notemate-rho.vercel.app',
            'https://notemate.vercel.app',
            'https://note-mate-delta.vercel.app',
            'https://note-mate-piyush-kumar-agarwal1s-projects.vercel.app',
            'https://note-mate-git-main-piyush-kumar-agarwal1s-projects.vercel.app'
        ];

        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

app.use('/api/auth', authenticateToken, authRouter);
app.use('/api/users', userRouter);
app.use('/api/notes', authenticateToken, noteRouter);

// Simple health check route
app.get('/api', (req, res) => {
    res.json({ message: 'NoteMate API is running' });
});
// Add to server/src/index.js
app.get('/api/debug', (req, res) => {
    res.json({
        environment: process.env.NODE_ENV,
        hostname: req.hostname,
        headers: req.headers
    });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export for Vercel serverless
module.exports = app;