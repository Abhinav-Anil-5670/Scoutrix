const User = require('../models/user.model');
const nodemailer = require('nodemailer');
const { recalculateScoutScore } = require('../utils/scoringEngine');





// @desc    Toggle Save/Unsave an Athlete
// @route   POST /api/users/save/:athleteId
exports.toggleSavePlayer = async (req, res) => {
    try {
        const recruiterId = req.user._id; // From authMiddleware
        const athleteId = req.params.athleteId; // From the URL

        // 1. Fetch the recruiter and the target athlete
        const recruiter = await User.findById(recruiterId);
        const athlete = await User.findById(athleteId);

        // 2. Validate the athlete exists and is actually an athlete
        if (!athlete || athlete.role !== 'athlete') {
            return res.status(404).json({ message: 'Athlete not found' });
        }

        // 3. Check if the athlete is already in the recruiter's saved list
        const isSaved = recruiter.savedPlayers.includes(athleteId);

        if (isSaved) {
            // If already saved, remove them (Unsave)
            recruiter.savedPlayers = recruiter.savedPlayers.filter(
                (id) => id.toString() !== athleteId
            );
        } else {
            // If not saved, add them
            recruiter.savedPlayers.push(athleteId);
        }

        // 4. Save the updated recruiter document
        await recruiter.save();

        // Recalculate the athlete's score to reflect the new Validation points
        recalculateScoutScore(athleteId);

        res.status(200).json({ 
            message: isSaved ? 'Player removed from saved list' : 'Player saved successfully',
            savedPlayers: recruiter.savedPlayers 
        });

    } catch (error) {
        console.error("Save Player Error:", error);
        res.status(500).json({ message: 'Server error saving player' });
    }
};

// @desc    Get a Recruiter's Saved Players Dashboard
// @route   GET /api/users/saved
exports.getSavedPlayers = async (req, res) => {
    try {
        // Find the recruiter and fully populate the saved players' details
        const recruiter = await User.findById(req.user._id).populate(
            'savedPlayers', 
            'name location sport playerRole subRole style bio trustScore' // Fields we want to show on the dashboard
        );

        res.status(200).json(recruiter.savedPlayers);
    } catch (error) {
        console.error("Fetch Saved Players Error:", error);
        res.status(500).json({ message: 'Server error fetching saved players' });
    }
};

// @desc    Send a trial invite email to an athlete
// @route   POST /api/users/invite/:athleteId
exports.sendTrialInvite = async (req, res) => {
    try {
        // 1. Move the transporter INSIDE the function so it reads the .env variables at RUNTIME
        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 465,
            secure: true, 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const athleteId = req.params.athleteId;
        const recruiterId = req.user._id;

        // 2. Fetch both users
        const athlete = await User.findById(athleteId);
        const recruiter = await User.findById(recruiterId);

        if (!athlete || athlete.role !== 'athlete') {
            return res.status(404).json({ message: 'Athlete not found' });
        }

        const { customMessage, trialDate } = req.body;
        const dateString = trialDate ? `We would like to see you on: ${trialDate}` : 'We will reach out with specific dates soon.';

        // 3. Construct the Email
const mailOptions = {
  from: "abhinavanil800@gmail.com",
  to: athlete.email,
  subject: `🎉 Trial Invitation from ${recruiter.organization}!`,
  html: `
  <body style="margin:0;padding:0;background:#d9e2b7;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
  <tr>
  <td align="center" style="padding:30px 0;">

  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;">

  <!-- HEADER -->
  <tr>
  <td align="center" style="padding:40px 40px 10px 40px;">
      <h1 style="margin:0;font-size:38px;color:#080808;">SCOUTRIX</h1>
      <p style="margin:8px 0 0;color:#6b7280;letter-spacing:2px;font-weight:600;">
        OFFICIAL TRIAL INVITATION
      </p>
  </td>
  </tr>

  <!-- BODY TEXT -->
  <tr>
  <td style="padding:10px 50px 10px 50px;">
      <h2 style="margin-top:20px;font-size:26px;color:#111827;">
        Hello ${athlete.name},
      </h2>

      <p style="font-size:17px;line-height:1.7;color:#4b5563;">
        Great news! <strong>${recruiter.name}</strong> from 
        <strong>${recruiter.organization}</strong> has reviewed your Scoutrix
        profile and AI Stat Card and were highly impressed by your performance
        as a <strong>${athlete.playerRole}</strong>.
      </p>

      <p style="font-size:17px;line-height:1.7;color:#4b5563;">
        You’ve officially been invited to attend a professional trial.
      </p>
  </td>
  </tr>

  <!-- SCOUT MESSAGE CARD -->
  <tr>
  <td style="padding:20px 50px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2fff4;border-radius:18px;">
      <tr>
        <td style="padding:26px;">
          <p style="margin:0 0 10px;font-size:13px;font-weight:800;color:#16a34a;letter-spacing:1px;">
            MESSAGE FROM THE SCOUT
          </p>
          <p style="margin:0;font-size:18px;color:#1f2937;font-style:italic;line-height:1.6;">
            "${customMessage || 'We look forward to seeing you in action!'}"
          </p>
        </td>
      </tr>
    </table>
  </td>
  </tr>

  <!-- DETAILS CARD -->
  <tr>
  <td style="padding:10px 50px 40px 50px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:16px 0;border-bottom:1px solid #e5e7eb;font-weight:600;">
          🗓️ Trial Date
        </td>
        <td align="right" style="padding:16px 0;border-bottom:1px solid #e5e7eb;color:#475569;">
          ${trialDate || 'Dates TBD soon'}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 0;border-bottom:1px solid #e5e7eb;font-weight:600;">
          📞 Recruiter Contact
        </td>
        <td align="right" style="padding:16px 0;border-bottom:1px solid #e5e7eb;color:#475569;">
          ${recruiter.phoneNumber}
        </td>
      </tr>
    </table>
  </td>
  </tr>

  <!-- CTA -->
  <tr>
  <td align="center" style="padding:0 50px 50px 50px;">
    <a href="mailto:${recruiter.email}" 
       style="display:inline-block;background:#16a34a;color:#ffffff;
       padding:18px 34px;border-radius:50px;font-size:18px;
       text-decoration:none;font-weight:600;">
       Confirm Attendance
    </a>
  </td>
  </tr>

  <!-- FOOTER -->
  <tr>
  <td style="background:#0b0707;color:#ffffff;padding:35px;text-align:center;">
      <p style="margin:0;font-size:14px;color:#ffffffcc;">
        Powered by the Scoutrix AI Scouting Network
      </p>
  </td>
  </tr>

  </table>
  </td>
  </tr>
  </table>
  </body>
  `
};

        // 4. Send the Email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: `Invite successfully sent to ${athlete.name}!` });

    } catch (error) {
        console.error("Email Error:", error);
        res.status(500).json({ message: 'Server error sending invite' });
    }
};

// @desc    Search and filter athletes dynamically (For Recruiters)
// @route   GET /api/users/search
exports.searchAthletes = async (req, res) => {
    try {
        // 1. Create a shallow copy of the incoming query parameters
        const reqQuery = { ...req.query };

        // 2. Define the "Special Fields" that require custom MongoDB math/regex logic
        const specialFields = ['location', 'minAge', 'maxAge', 'minScore', 'limit', 'page'];

        // 3. Delete those special fields from our reqQuery copy
        // What remains in reqQuery are exact-match filters (sport, playerRole, subRole, style, etc.)
        specialFields.forEach(param => delete reqQuery[param]);

        // 4. Initialize the database query with the remaining dynamic exact matches
        let query = { ...reqQuery, role: 'athlete' };

        // 5. Now handle the special fields we extracted from the original req.query
        
        // Location (Case-insensitive partial match)
        if (req.query.location) {
            query.location = { $regex: req.query.location, $options: 'i' };
        }

        // Age Range
        if (req.query.minAge || req.query.maxAge) {
            query.age = {};
            if (req.query.minAge) query.age.$gte = Number(req.query.minAge);
            if (req.query.maxAge) query.age.$lte = Number(req.query.maxAge);
        }

        // Scoutrix MetaScore Threshold
        if (req.query.minScore) {
            query['scoutScore.metaScore'] = { $gte: Number(req.query.minScore) };
        }

        // 6. Execute the dynamic query!
        const athletes = await User.find(query)
            .sort({ 'scoutScore.metaScore': -1 }) // Highest score first
            .select('-password') // Never send passwords to the frontend
            .limit(Number(req.query.limit) || 50); // Optional limit parameter

        res.status(200).json({
            success: true,
            count: athletes.length,
            data: athletes
        });

    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ message: "Error searching athletes" });
    }
};