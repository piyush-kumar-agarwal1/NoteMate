import dotenv from 'dotenv';
import './db';
import cors from 'cors';
import express from 'express';
import authRouter from './routers/auth.router';
import userRouter from './routers/users.router';
import noteRouter from './routers/notes.router';
import { authenticateToken } from './middlewares/auth.middleware';

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();

// Configure CORS for both local and production
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://localhost:3000',
            'https://notemate-rho.vercel.app',
            'https://notemate.vercel.app',
            'https://note-mate-delta.vercel.app',
            'https://note-mate-piyush-kumar-agarwal1s-projects.vercel.app',
            'https://note-mate-git-main-piyush-kumar-agarwal1s-projects.vercel.app'
        ];

        // Check if the origin is in the allowedOrigins
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

app.get('/', (req, res) => {
    res.send('NoteMate API is running');
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export for serverless use
export default app;