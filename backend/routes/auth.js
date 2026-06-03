const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { validateEmail } = require('../utils/validators');

const router = express.Router();

// Register (vendor setup)
router.post('/register', async (req, res) => {
  try {
    const { email, password, businessName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user exists
    const userExists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userResult = await db.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, 'vendor']
    );

    const userId = userResult.rows[0].id;

    // Create vendor profile
    await db.query(
      'INSERT INTO vendor_profile (user_id, business_name) VALUES ($1, $2)',
      [userId, businessName || 'Mini Football Vendor']
    );

    // Create 11 pitches for this vendor
    for (let i = 1; i <= 11; i++) {
      await db.query(
        'INSERT INTO pitches (vendor_id, pitch_name, pitch_number) VALUES ($1, $2, $3)',
        [userId, `Pitch ${i}`, i]
      );
    }

    // Create time slots (5 per day)
    const timeSlots = [
      { start: '18:30', end: '19:30', order: 1 },
      { start: '19:30', end: '20:30', order: 2 },
      { start: '20:30', end: '21:30', order: 3 },
      { start: '21:30', end: '22:30', order: 4 },
      { start: '22:00', end: '23:00', order: 5 }
    ];

    for (const slot of timeSlots) {
      await db.query(
        'INSERT INTO time_slots (start_time, end_time, slot_order) VALUES ($1, $2, $3)',
        [slot.start, slot.end, slot.order]
      );
    }

    res.status(201).json({ 
      message: 'Vendor registered successfully',
      userId 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const userResult = await db.query(
      'SELECT u.id, u.email, u.password_hash, u.role, vp.id as vendor_id FROM users u LEFT JOIN vendor_profile vp ON u.id = vp.user_id WHERE u.email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        vendorId: user.vendor_id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '7d' }
    );

    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        vendorId: user.vendor_id
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
