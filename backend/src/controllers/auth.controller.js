const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper function to generate a JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user (Athlete or Recruiter)
// @route   POST /api/auth/register
// @desc    Register a new user (Athlete or Recruiter)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        // Explicitly extract ONLY the allowed fields to prevent stat-stuffing
        const {
            name, email, password, role, location, phoneNumber, age,
            sport, playerRole, subRole, style, bio, height, weight, // Athlete specific
            organization // Recruiter specific
        } = req.body;

        // 1. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Hash the password manually here in the controller
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Build user object — only add fields that are actually provided
        // (recruiters have no sport/age/playerRole etc.)
        const userData = {
            name,
            email,
            password: hashedPassword,
            role,
            location,
            phoneNumber,
        };
        if (age) userData.age = Number(age);
        if (sport) userData.sport = sport;
        if (playerRole) userData.playerRole = playerRole;
        if (subRole) userData.subRole = subRole;
        if (style) userData.style = style;
        if (bio) userData.bio = bio;
        if (height) userData.height = height;
        if (weight) userData.weight = weight;
        if (organization) userData.organization = organization;

        // 3. Create the user in the database
        const user = await User.create(userData);


        // 4. Return success response with cookie
        if (user) {
            const token = generateToken(user._id);

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                sport: user.sport,
                playerRole: user.playerRole,
                subRole: user.subRole,
                style: user.style,
                bio: user.bio,
                location: user.location,
                phoneNumber: user.phoneNumber,
                age: user.age,
                height: user.height,
                weight: user.weight,
                scoutScore: user.scoutScore,
                token
            });
        } else {
            res.status(400).json({ message: 'Invalid user data received' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};
// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user by email
        const user = await User.findOne({ email });

        // 2. Check if user exists AND if the password matches using bcrypt
        if (user && (await bcrypt.compare(password, user.password))) {

            // Generate token ONCE
            const token = generateToken(user._id);

            // Set the token in an HTTP-only cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                sport: user.sport,
                playerRole: user.playerRole,
                subRole: user.subRole,
                style: user.style,
                bio: user.bio,
                location: user.location,
                phoneNumber: user.phoneNumber,
                age: user.age,
                height: user.height,
                weight: user.weight,
                scoutScore: user.scoutScore,
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Clear the auth cookie and log user out
// @route   POST /api/auth/logout
exports.logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0), // Immediately expire the cookie
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.status(200).json({ message: 'Logged out successfully' });
};