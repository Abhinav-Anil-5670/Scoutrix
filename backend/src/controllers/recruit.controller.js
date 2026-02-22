const User = require('../models/user.model');
const PDFDocument = require('pdfkit');

// @desc    Generate AI Shortlist and output as PDF
// @route   POST /api/recruit/shortlist
exports.generateShortlist = async (req, res) => {
    try {
        if (req.user.role !== 'recruiter') {
            return res.status(403).json({ message: 'Only recruiters can generate shortlists.' });
        }

        const { sport, minAge, maxAge, region, minSpi, numProfiles } = req.body;

        // Build query for athletes matching criteria
        const query = { role: 'athlete' };
        if (sport && sport !== 'All') query.sport = sport;
        if (region) query.location = new RegExp(region, 'i');

        // Age filtering
        if (minAge || maxAge) {
            query.age = {};
            if (minAge) query.age.$gte = Number(minAge);
            if (maxAge) query.age.$lte = Number(maxAge);
        }

        // SPI Score filtering
        if (minSpi) {
            query.sportScore = { $gte: Number(minSpi) };
        }

        // Fetch matching profiles, sort by SPI score (descending), limit to requested number
        const limit = numProfiles ? Number(numProfiles) : 10;
        const athletes = await User.find(query)
            .sort({ sportScore: -1 }) // Highest SPI first
            .limit(limit)
            .select('name email age sport playerRole subRole style location metaScore sportScore profileImage');

        // Create PDF Document
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers for PDF download
        res.setHeader('Content-disposition', `attachment; filename=Scoutrix_Shortlist_${Date.now()}.pdf`);
        res.setHeader('Content-type', 'application/pdf');

        // Pipe PDF to response
        doc.pipe(res);

        // --- PDF Formatting ---

        // Header Title
        doc.fontSize(24).fillColor('#e11d48').text('Scoutrix Automated Shortlist', { align: 'center' }); // Dark Pink/Red
        doc.moveDown(0.5);

        // Recruiter Info
        doc.fontSize(12).fillColor('#475569').text(`Generated for: ${req.user.name} (${req.user.organization || 'Independent Recruiter'})`, { align: 'center' });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);

        // Search Criteria Section
        doc.fontSize(14).fillColor('#1e293b').text('Search Criteria Parameters:', { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(12).fillColor('#334155');
        doc.text(`• Target Sport: ${sport || 'Any'}`);
        doc.text(`• Target Region: ${region || 'Any'}`);
        if (minAge || maxAge) doc.text(`• Age Range: ${minAge || 'Any'} - ${maxAge || 'Any'}`);
        doc.text(`• Minimum Verified SPI Score: ${minSpi || 'None'}`);
        doc.text(`• Total Profiles Found: ${athletes.length}`);
        doc.moveDown(2);

        // Divider
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#cbd5e1').stroke();
        doc.moveDown(2);

        if (athletes.length === 0) {
            doc.fontSize(14).fillColor('#dc2626').text('No athletes found matching these criteria.', { align: 'center' });
        } else {
            // Render each athlete
            athletes.forEach((athlete, index) => {
                // If nearing bottom of page, add a new page
                if (doc.y > 700) doc.addPage();

                // Rank & Name
                doc.fontSize(16).fillColor('#0284c7').text(`#${index + 1} - ${athlete.name}`); // Dark Blue
                doc.moveDown(0.2);

                // Meta Info
                doc.fontSize(11).fillColor('#475569').text(`${athlete.sport} • ${athlete.playerRole || 'Player'} • ${athlete.location}`);
                if (athlete.age) doc.text(`Age: ${athlete.age}`);

                doc.moveDown(0.5);

                // Scores Box (Simulated via indented text)
                doc.fontSize(12).fillColor('#059669').text(`Verified MetaScore: ${athlete.metaScore || 'Unranked'}`, { indent: 20 }); // Dark Emerald
                doc.fillColor('#d97706').text(`Verified SPI Score: ${athlete.sportScore || 'N/A'}`, { indent: 20 }); // Dark Amber

                doc.moveDown(0.5);

                // Action Link
                doc.fontSize(11).fillColor('#db2777').text(`Contact Athlete: ${athlete.email}`, { link: `mailto:${athlete.email}`, underline: true }); // Dark Pink

                doc.moveDown(1.5);

                // Subtle divider between athletes
                if (index < athletes.length - 1) {
                    doc.moveTo(50, doc.y).lineTo(300, doc.y).strokeColor('#e2e8f0').stroke();
                    doc.moveDown(1);
                }
            });
        }

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server error generating shortlist report' });
        }
    }
};
