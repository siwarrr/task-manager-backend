const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
dotenv.config();

const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const passport = require('passport');
const projectRoutes = require('./routes/project');
const taskRoutes = require('./routes/task');

require('./config/passport');

connectDB();

const app = express();

app.use(
    cors({
        origin: [
            "https://task-manager-front-neon.vercel.app", 
            "http://localhost:3000" 
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], 
    })
);

app.use(express.json());

app.use(passport.initialize());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
