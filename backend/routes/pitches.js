const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Get all pitches
router.get('/', async (req, res) => {
  try {
    const { vendorId } = req.user;

    const result = await db.query(
      'SELECT * FROM pitches WHERE vendor_id = $1 ORDER BY pitch_number ASC',
      [vendorId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Get pitches error:', err);
    res.status(500).json({ error: 'Failed to fetch pitches' });
  }
});

// Get time slots
router.get('/slots', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM time_slots ORDER BY slot_order ASC'
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Get time slots error:', err);
    res.status(500).json({ error: 'Failed to fetch time slots' });
  }
});

// Get available slots for a specific date and pitch
router.get('/:pitchId/available', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { pitchId, date } = req.query;

    if (!pitchId || !date) {
      return res.status(400).json({ error: 'Pitch ID and date required' });
    }

    // Verify pitch ownership
    const pitchResult = await db.query(
      'SELECT * FROM pitches WHERE id = $1 AND vendor_id = $2',
      [pitchId, vendorId]
    );

    if (pitchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pitch not found' });
    }

    // Get all slots
    const slotsResult = await db.query(
      'SELECT * FROM time_slots ORDER BY slot_order ASC'
    );

    // Get booked slots
    const bookedResult = await db.query(
      `SELECT time_slot_id FROM matches 
       WHERE pitch_id = $1 AND match_date = $2 
       AND status IN ('pending_acceptance', 'confirmed')`,
      [pitchId, date]
    );

    const bookedSlotIds = bookedResult.rows.map(row => row.time_slot_id);

    const availableSlots = slotsResult.rows.map(slot => ({
      ...slot,
      available: !bookedSlotIds.includes(slot.id)
    }));

    res.json(availableSlots);
  } catch (err) {
    console.error('Get available slots error:', err);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

// Update pitch status
router.put('/:id', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { id } = req.params;
    const { status } = req.body;

    // Verify ownership
    const pitchResult = await db.query(
      'SELECT * FROM pitches WHERE id = $1 AND vendor_id = $2',
      [id, vendorId]
    );

    if (pitchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pitch not found' });
    }

    const result = await db.query(
      'UPDATE pitches SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update pitch error:', err);
    res.status(500).json({ error: 'Failed to update pitch' });
  }
});

module.exports = router;
