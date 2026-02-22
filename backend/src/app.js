const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// We will uncomment these once we create the route files!
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const userRoutes = require('./routes/user.routes');
const opportunityRoutes = require('./routes/opportunity.routes');
const recruitRoutes = require('./routes/recruit.routes');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
})); // Allows frontend to talk to backend
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', postRoutes);
app.use('/api', userRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/recruit', recruitRoutes);

// A simple health-check route to test the server
app.get('/health', (req, res) => {
    res.status(200).json({ message: "Magic Engine is running! 🚀" });
});

module.exports = app;