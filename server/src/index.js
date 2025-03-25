require('dotenv').config();
require('./db');

const cors = require('cors');
const PORT = process.env.PORT || 3001;

const express = require('express');
const app = express();

app.use(cors());
app.use(express.json());

const authRouter = require('./routers/auth.router');
const userRouter = require('./routers/users.router');
const noteRouter = require('./routers/notes.router');

// Apply authentication middleware
const { authenticateToken } = require('./middlewares/auth.middleware');
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
module.exports = app;