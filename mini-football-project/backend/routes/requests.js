const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Get all pending requests
router.get('/', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { status } = req.query;

    let query = `
      SELECT mr.*, 
             t.team_name, t.skill_level as team_skill, 
             p.full_name as player_name, p.skill_level as player_skill
      FROM match_requests mr
      LEFT JOIN teams t ON mr.team_id = t.id
      LEFT JOIN players p ON mr.player_id = p.id
      WHERE mr.vendor_id = $1
    `;
    const params = [vendorId];

    if (status) {
      query += ` AND mr.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY mr.created_at DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get requests error:', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Create match request (team or player)
router.post('/', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { teamId, playerId, requestType, preferredSlots } = req.body;

    if (!requestType || (!teamId && !playerId)) {
      return res.status(400).json({ error: 'Request type and team/player ID required' });
    }

    const result = await db.query(
      `INSERT INTO match_requests (vendor_id, team_id, player_id, request_type, preferred_slots, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [vendorId, teamId || null, playerId || null, requestType, preferredSlots || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Get skill-matched suggestions for opponent
router.post('/suggestions', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { teamId, skillLevel, requestType } = req.body;

    let query = `
      SELECT t.id, t.team_name, t.skill_level, t.status
      FROM teams t
      WHERE t.vendor_id = $1 
      AND t.skill_level IN ($2, $3, $4)
      AND t.status = 'active'
    `;
    
    const skillVariations = [
      Math.max(1, parseInt(skillLevel) - 1),
      skillLevel,
      Math.min(5, parseInt(skillLevel) + 1)
    ];

    const params = [vendorId, ...skillVariations];

    if (teamId) {
      query += ` AND t.id != $${params.length + 1}`;
      params.push(teamId);
    }

    query += ` ORDER BY RANDOM() LIMIT 5`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Suggestions error:', err);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Get suggested players to fill squad
router.post('/player-suggestions', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { skillLevel, count } = req.body;

    const neededCount = count || 5;

    const query = `
      SELECT id, full_name, skill_level, status
      FROM players
      WHERE vendor_id = $1 
      AND skill_level IN ($2, $3, $4)
      AND status = 'active'
      ORDER BY RANDOM()
      LIMIT $5
    `;

    const skillVariations = [
      Math.max(1, parseInt(skillLevel) - 1),
      skillLevel,
      Math.min(5, parseInt(skillLevel) + 1)
    ];

    const result = await db.query(query, [vendorId, ...skillVariations, neededCount]);
    res.json(result.rows);
  } catch (err) {
    console.error('Player suggestions error:', err);
    res.status(500).json({ error: 'Failed to get player suggestions' });
  }
});

// Update request status
router.put('/:id', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { id } = req.params;
    const { status, suggestedMatchId } = req.body;

    // Verify ownership
    const requestResult = await db.query(
      'SELECT * FROM match_requests WHERE id = $1 AND vendor_id = $2',
      [id, vendorId]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const result = await db.query(
      `UPDATE match_requests SET status = $1, suggested_match_id = COALESCE($2, suggested_match_id),
                                updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, suggestedMatchId || null, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update request error:', err);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Cancel request
router.delete('/:id', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { id } = req.params;

    // Verify ownership
    const requestResult = await db.query(
      'SELECT * FROM match_requests WHERE id = $1 AND vendor_id = $2',
      [id, vendorId]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    await db.query(
      'UPDATE match_requests SET status = $1 WHERE id = $2',
      ['cancelled', id]
    );

    res.json({ message: 'Request cancelled successfully' });
  } catch (err) {
    console.error('Cancel request error:', err);
    res.status(500).json({ error: 'Failed to cancel request' });
  }
});

module.exports = router;
