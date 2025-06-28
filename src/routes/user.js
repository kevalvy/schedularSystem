// src/routes/users.js

import express from 'express';
const router = express.Router();
import postgresHelper from '../database/postgres.js';

/**
 * POST /api/users
 * Creates a new user in the 'users' table.
 */
router.post('/', async (req, res) => {
    const { username } = req.body;

    // Server-side validation
    if (!username || typeof username !== 'string' || username.trim() === '') {
        return res.status(400).json({ error: 'Username is required and must be a non-empty string.' });
    }

    const trimmedUsername = username.trim();

    try {
        // Check if user already exists
        const existingUser = await postgresHelper.readQuery('SELECT id FROM users WHERE username = $1', [trimmedUsername]);
        if (existingUser.length > 0) {
            return res.status(409).json({ error: `User with username '${trimmedUsername}' already exists.` });
        }

        // Insert new user
        const result = await postgresHelper.writeQuery(
            'INSERT INTO users (username) VALUES ($1) RETURNING id, username, created_at',
            [trimmedUsername]
        );

        res.status(201).json({
            message: 'User registered successfully!',
            user: result
        });

    } catch (err) {
        console.error('Database error during user registration:', err);
        // Specifically catch the unique constraint error if it slips past initial check (though it shouldn't if the check above works)
        if (err.code === '23505') { // PostgreSQL unique violation error code
            return res.status(409).json({ error: `User with username '${trimmedUsername}' already exists.` });
        }
        res.status(500).json({ error: 'An internal server error occurred during user registration.' });
    }
});

export default router;