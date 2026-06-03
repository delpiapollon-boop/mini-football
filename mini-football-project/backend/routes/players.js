const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Get all players
router.get('/', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { includeTemporary } = req.query;

    let query = `SELECT * FROM players WHERE vendor_id = $1`;
    const params = [vendorId];

    if (includeTemporary !== 'true') {
      query += ` AND status != 'temporary'`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await db.query(query, params);

    // Get appearance count for each player
    const players = await Promise.all(result.rows.map(async (player) => {
      const countResult = await db.query(
        'SELECT COUNT(*) as appearances FROM match_players WHERE player_id = $1',
        [player.id]
      );
      return {
        ...player,
        appearances: parseInt(countResult.rows[0].appearances)
      };
    }));

    res.json(players);
  } catch (err) {
    console.error('Get players error:', err);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// Get single player
router.get('/:id', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { id } = req.params;

    const playerResult = await db.query(
      'SELECT * FROM players WHERE id = $1 AND vendor_id = $2',
      [id, vendorId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const player = playerResult.rows[0];

    // Get player's match history
    const historyResult = await db.query(
      `SELECT mp.*, m.match_date, m.pitch_id, m.result
       FROM match_players mp
       JOIN matches m ON mp.match_id = m.id
       WHERE mp.player_id = $1
       ORDER BY m.match_date DESC
       LIMIT 10`,
      [id]
    );

    const countResult = await db.query(
      'SELECT COUNT(*) as appearances FROM match_players WHERE player_id = $1',
      [id]
    );

    res.json({
      ...player,
      matchHistory: historyResult.rows,
      appearances: parseInt(countResult.rows[0].appearances)
    });
  } catch (err) {
    console.error('Get player error:', err);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

// Create player
router.post('/', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { fullName, phone, email, skillLevel, status } = req.body;

    if (!fullName || !skillLevel) {
      return res.status(400).json({ error: 'Player name and skill level required' });
    }

    const result = await db.query(
      `INSERT INTO players (vendor_id, full_name, phone, email, skill_level, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [vendorId, fullName, phone, email, skillLevel, status || 'active']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create player error:', err);
    res.status(500).json({ error: 'Failed to create player' });
  }
});

// Update player
router.put('/:id', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { id } = req.params;
    const { fullName, phone, email, skillLevel, status } = req.body;

    // Verify ownership
    const playerResult = await db.query(
      'SELECT * FROM players WHERE id = $1 AND vendor_id = $2',
      [id, vendorId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const result = await db.query(
      `UPDATE players SET 
       full_name = COALESCE($1, full_name),
       phone = COALESCE($2, phone),
       email = COALESCE($3, email),
       skill_level = COALESCE($4, skill_level),
       status = COALESCE($5, status),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [fullName, phone, email, skillLevel, status, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update player error:', err);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

// Delete player
router.delete('/:id', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { id } = req.params;

    // Verify ownership
    const playerResult = await db.query(
      'SELECT * FROM players WHERE id = $1 AND vendor_id = $2',
      [id, vendorId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    await db.query('DELETE FROM players WHERE id = $1', [id]);

    res.json({ message: 'Player deleted successfully' });
  } catch (err) {
    console.error('Delete player error:', err);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

module.exports = router;
