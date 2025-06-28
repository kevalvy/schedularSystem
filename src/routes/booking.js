// src/routes/booking.js

import express from 'express'
const router = express.Router();
import postgresHelper from '../database/postgres.js';
import moment from 'moment-timezone';

/**
 * GET /book/:username/available-slots
 * Fetches all available (unbooked) time slots for a given user.
 */
router.get('/:username/available-slots', async (req, res) => {
    const { username } = req.params;
    console.log('after completd',username)
    if (!username) {
        return res.status(400).json({ error: 'Username is required.' });
    }

    try {
        // 1. Find the user ID based on the username
        const userResult = await postgresHelper.readQuery('select id from users where username = $1', [username]);
        if (userResult.length == 0) {
            // If the username does not exist, it's an invalid link
            return res.status(404).json({ error: 'Booking link not found. The user does not exist.' });
        }

        const userId = userResult[0].id;
        console.log('after created resu',userId)

        // 2. Query for availability slots that are NOT already booked
        // This is the core logic for "conflict-free time-based booking".
        // We use a LEFT JOIN to check if a corresponding booking exists.
        // If a booking exists (b.id is not NULL), we exclude that slot.
        const availableSlotsQuery = `
            select
                s.availability_date AS date,
                s.start_time,
                s.end_time
            from
                availability_slots s
            left join
                bookings b on s.user_id = b.user_id
                         and s.availability_date = b.booked_date
                        and  s.start_time = b.booked_time
            where
                s.user_id = $1
                and s.availability_date >= CURRENT_DATE -- Only show future dates
                and b.id IS NULL -- Exclude slots that have been booked
            order by
                s.availability_date, s.start_time;
        `;

        const results = await postgresHelper.readQuery(availableSlotsQuery, [userId]);
        for(let result of results){
            result.date = moment(result.date).format('YYYY-MM-DD');
            results['date']=result.date;
           
        }
           res.status(200).json({
            username: username,
            availableSlots: results
        });
      

    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'An internal server error occurred while fetching availability.' });
    }
});

router.post('/create-booking', async (req, res) => {
    // 1. Server-side validation
    const { username, bookedDate, bookedTime, clientName, clientEmail } = req.body;

    if (!username || !bookedDate || !bookedTime || !clientName || !clientEmail) {
        return res.status(400).json({ error: 'All booking fields are required.' });
    }

    // Basic email validation
    if (!clientEmail.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    
    try {
        // 2. Find the user ID based on the username
        const userResult = await postgresHelper.readQuery('select id from users WHERE username = $1', [username]);
        if (userResult.length === 0) {
            return res.status(404).json({ error: 'User not found. Booking cannot be created.' });
        }
        const userId = userResult[0].id;
        console.log('create booking',userResult)
        // 3. Final conflict check: Verify the slot is still available right before booking.
        // This prevents double-booking if two people try to book the same slot simultaneously.
        const conflictCheckQuery = `
            select id from bookings
            where user_id = $1 and booked_date = $2 and booked_time = $3
        `;
        const conflictResult = await postgresHelper.readQuery(conflictCheckQuery, [userId, bookedDate, bookedTime]);

        if (conflictResult.length > 0) {
            // A booking for this slot already exists!
            return res.status(409).json({ error: 'This time slot has just been booked by someone else. Please refresh and select another time.' });
        }
        
        // 4. Check if the slot exists in the availability table
        const availabilityCheckQuery = `
            select id FROM availability_slots
            where user_id = $1 and availability_date = $2 and start_time = $3
        `;
        console.log(userId,bookedDate,bookedTime)
        const availabilityResult = await postgresHelper.readQuery(availabilityCheckQuery, [userId, bookedDate, bookedTime]);
        
        if (availabilityResult.length === 0) {
            return res.status(404).json({ error: 'The selected slot is not available or does not exist.' });
        }

        // 5. Insert the new booking into the 'bookings' table
        const insertBookingQuery = `
            insert into bookings (user_id, booked_date, booked_time, client_name, client_email)
            values ($1, $2, $3, $4, $5)
            returning *;
        `;
        const result = await postgresHelper.writeQuery(insertBookingQuery, [userId, bookedDate, bookedTime, clientName, clientEmail]);
        console.log(result)
        // 6. Send a success response
        res.status(201).json({
            message: 'Booking created successfully!',
            booking: result[0]
        });

    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'An internal server error occurred while creating the booking.' });
    }
});


export default router;