const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// We will uncomment these once we create the route files!
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const userRoutes = require('./routes/user.routes');
const opportunityRoutes = require('./routes/opportunity.routes');
const recruitRoutes = require('./routes/recruit.routes');
const translateRoutes = require('./routes/translate.routes');

const app = express();

// Middleware
// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow any origin that Vercel or localhost might generate
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', postRoutes);
app.use('/api', userRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/recruit', recruitRoutes);
app.use('/api/translate', translateRoutes);

// A simple health-check route to test the server
app.get('/health', (req, res) => {
    res.status(200).json({ message: "Magic Engine is running! 🚀" });
});

module.exports = app;