const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Get all matches
router.get('/', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { date, status, pitchId } = req.query;

    let query = `
      SELECT m.*, 
             ts.start_time, ts.end_time,
             p.pitch_name,
             ta.full_name as team_a_leader,
             tb.full_name as team_b_leader
      FROM matches m
      LEFT JOIN time_slots ts ON m.time_slot_id = ts.id
      LEFT JOIN pitches p ON m.pitch_id = p.id
      LEFT JOIN players ta ON m.team_a_id = ta.id
      LEFT JOIN players tb ON m.team_b_id = tb.id
      WHERE m.vendor_id = $1
    `;
    const params = [vendorId];

    if (date) {
      query += ` AND m.match_date = $${params.length + 1}`;
      params.push(date);
    }

    if (status) {
      query += ` AND m.status = $${params.length + 1}`;
      params.push(status);
    }

    if (pitchId) {
      query += ` AND m.pitch_id = $${params.length + 1}`;
      params.push(pitchId);
    }

    query += ` ORDER BY m.match_date DESC, ts.slot_order ASC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get matches error:', err);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Get single match with details
router.get('/:id', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { id } = req.params;

    const matchResult = await db.query(
      `SELECT m.*, ts.start_time, ts.end_time, p.pitch_name
       FROM matches m
       LEFT JOIN time_slots ts ON m.time_slot_id = ts.id
       LEFT JOIN pitches p ON m.pitch_id = p.id
       WHERE m.id = $1 AND m.vendor_id = $2`,
      [id, vendorId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const match = matchResult.rows[0];

    // Get all players in the match
    const playersResult = await db.query(
      'SELECT * FROM match_players WHERE match_id = $1',
      [id]
    );

    // Get acceptances
    const acceptancesResult = await db.query(
      'SELECT * FROM match_acceptances WHERE match_id = $1',
      [id]
    );

    res.json({
      ...match,
      players: playersResult.rows,
      acceptances: acceptancesResult.rows
    });
  } catch (err) {
    console.error('Get match error:', err);
    res.status(500).json({ error: 'Failed to fetch match' });
  }
});

// Check for overlaps
router.post('/check-overlap', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { pitchId, matchDate, timeSlotId } = req.body;

    const result = await db.query(
      `SELECT COUNT(*) as overlap_count FROM matches
       WHERE pitch_id = $1 AND match_date = $2 AND time_slot_id = $3
       AND status IN ('pending_acceptance', 'confirmed')`,
      [pitchId, matchDate, timeSlotId]
    );

    const hasOverlap = parseInt(result.rows[0].overlap_count) > 0;
    res.json({ hasOverlap });
  } catch (err) {
    console.error('Check overlap error:', err);
    res.status(500).json({ error: 'Failed to check overlap' });
  }
});

// Create match
router.post('/', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { pitchId, matchDate, timeSlotId, teamA, teamB, createdBy } = req.body;

    if (!pitchId || !matchDate || !timeSlotId) {
      return res.status(400).json({ error: 'Pitch, date, and time slot required' });
    }

    // Check for overlaps
    const overlapCheck = await db.query(
      `SELECT COUNT(*) as count FROM matches
       WHERE pitch_id = $1 AND match_date = $2 AND time_slot_id = $3
       AND status IN ('pending_acceptance', 'confirmed')`,
      [pitchId, matchDate, timeSlotId]
    );

    if (parseInt(overlapCheck.rows[0].count) > 0) {
      return res.status(409).json({ error: 'Time slot already booked for this pitch' });
    }

    // Create match
    const matchResult = await db.query(
      `INSERT INTO matches (vendor_id, pitch_id, match_date, time_slot_id, 
                           team_a_id, team_a_name, team_b_id, team_b_name, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending_acceptance')
       RETURNING *`,
      [vendorId, pitchId, matchDate, timeSlotId, 
       teamA?.id, teamA?.name, 
       teamB?.id, teamB?.name, 
       createdBy || 'vendor']
    );

    const matchId = matchResult.rows[0].id;

    // Add players to match
    if (teamA?.playerIds) {
      for (const playerId of teamA.playerIds) {
        await db.query(
          'INSERT INTO match_players (match_id, player_id, team_side) VALUES ($1, $2, $3)',
          [matchId, playerId, 'A']
        );
      }
    }

    if (teamB?.playerIds) {
      for (const playerId of teamB.playerIds) {
        await db.query(
          'INSERT INTO match_players (match_id, player_id, team_side) VALUES ($1, $2, $3)',
          [matchId, playerId, 'B']
        );
      }
    }

    // Create acceptance records for both teams
    if (teamA?.id) {
      await db.query(
        'INSERT INTO match_acceptances (match_id, team_id) VALUES ($1, $2)',
        [matchId, teamA.id]
      );
    }

    if (teamB?.id) {
      await db.query(
        'INSERT INTO match_acceptances (match_id, team_id) VALUES ($1, $2)',
        [matchId, teamB.id]
      );
    }

    res.status(201).json(matchResult.rows[0]);
  } catch (err) {
    console.error('Create match error:', err);
    res.status(500).json({ error: 'Failed to create match' });
  }
});

// Update match status
router.put('/:id', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { id } = req.params;
    const { status, result } = req.body;

    // Verify ownership
    const matchResult = await db.query(
      'SELECT * FROM matches WHERE id = $1 AND vendor_id = $2',
      [id, vendorId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const updateResult = await db.query(
      `UPDATE matches SET status = COALESCE($1, status), 
                         result = COALESCE($2, result),
                         updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, result, id]
    );

    // If match completed, update history
    if (status === 'completed') {
      const match = updateResult.rows[0];
      
      if (match.team_a_id) {
        await db.query(
          `INSERT INTO match_history (team_id, match_id, opponent_team_id, opponent_team_name, 
                                      match_date, pitch_name, result)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [match.team_a_id, id, match.team_b_id, match.team_b_name, 
           match.match_date, `Pitch ${match.pitch_id}`, match.result]
        );
      }

      if (match.team_b_id) {
        await db.query(
          `INSERT INTO match_history (team_id, match_id, opponent_team_id, opponent_team_name, 
                                      match_date, pitch_name, result)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [match.team_b_id, id, match.team_a_id, match.team_a_name, 
           match.match_date, `Pitch ${match.pitch_id}`, match.result]
        );
      }
    }

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error('Update match error:', err);
    res.status(500).json({ error: 'Failed to update match' });
  }
});

// Cancel match
router.delete('/:id', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { id } = req.params;

    // Verify ownership
    const matchResult = await db.query(
      'SELECT * FROM matches WHERE id = $1 AND vendor_id = $2',
      [id, vendorId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    await db.query(
      'UPDATE matches SET status = $1 WHERE id = $2',
      ['cancelled', id]
    );

    res.json({ message: 'Match cancelled successfully' });
  } catch (err) {
    console.error('Cancel match error:', err);
    res.status(500).json({ error: 'Failed to cancel match' });
  }
});

module.exports = router;
