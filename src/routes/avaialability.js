// src/routes/availability.js
import express from 'express'
const router = express.Router();
import postgresHelper from '../database/postgres.js';
import moment from "moment-timezone";
import compereDate from '../lib/moment.js';

// POST /api/availability - Save a new availability slot
router.post('/', async (req, res) => {
    // 1. Server-side validation
    const { username, date, startTime, endTime } = req.body;

    if (!username || !date || !startTime || !endTime) {
        return res.status(400).json({ error: 'All fields (username, date, start time, end time) are required.' });
    }

    if (startTime >= endTime) {
        return res.status(400).json({ error: 'End time must be after start time.' });
    }

    let dateIsCompare=compereDate(date);
    if(dateIsCompare==false) return res.status(400).json({ error: ' please select date in future' });
    try {
        // 2. Find or create the user
        let userResult = await postgresHelper.readQuery('select id FROM users where username = $1', [username]);
        let userId;
        console.log('user result',userResult)

        if(userResult.length==0) throw new Error('this id is not found first register')

        if (userResult.length > 0)  userId = userResult[0].id

        // 3. Save the availability slot
        const result = await postgresHelper.readQuery(
            `insert into availability_slots (user_id, availability_date, start_time, end_time)
             VALUES ($1, $2, $3, $4) returning id`,
            [userId, date, startTime, endTime]
        );

        // // 4. Send the successful response
        res.status(201).json({
            message: 'Availability slot saved successfully.',
            slot: result[0].id,
            userId: userId // Also send back the user ID for potential future use
        });

    } catch (err) {
        console.log('Database error:', err[0]);
        // Check for unique constraint violation
        if (err.code === '23505') {
            return res.status(409).json({ error: 'This slot has already been defined for this user.' });
        }
        res.status(500).json({ error: err.message });
    }
});

export default router;