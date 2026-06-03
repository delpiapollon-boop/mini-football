const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Get all teams
router.get('/', async (req, res) => {
  try {
    const { vendorId } = req.user;

    const result = await db.query(
      `SELECT t.*, COUNT(tm.id) as member_count FROM teams t
       LEFT JOIN team_members tm ON t.id = tm.team_id
       WHERE t.vendor_id = $1 AND t.is_temporary = FALSE
       GROUP BY t.id
       ORDER BY t.created_at DESC`,
      [vendorId]
    );

    // Get match history for each team (last 10)
    const teams = await Promise.all(result.rows.map(async (team) => {
      const historyResult = await db.query(
        `SELECT * FROM match_history WHERE team_id = $1
         ORDER BY match_date DESC LIMIT 10`,
        [team.id]
      );
      return {
        ...team,
        matchHistory: historyResult.rows,
        winLossRecord: calculateWinLoss(historyResult.rows)
      };
    }));

    res.json(teams);
  } catch (err) {
    console.error('Get teams error:', err);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get single team with members
router.get('/:id', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { id } = req.params;

    const teamResult = await db.query(
      'SELECT * FROM teams WHERE id = $1 AND vendor_id = $2',
      [id, vendorId]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const team = teamResult.rows[0];

    // Get team members
    const membersResult = await db.query(
      'SELECT * FROM team_members WHERE team_id = $1',
      [id]
    );

    // Get match history
    const historyResult = await db.query(
      'SELECT * FROM match_history WHERE team_id = $1 ORDER BY match_date DESC LIMIT 10',
      [id]
    );

    res.json({
      ...team,
      members: membersResult.rows,
      matchHistory: historyResult.rows,
      winLossRecord: calculateWinLoss(historyResult.rows)
    });
  } catch (err) {
    console.error('Get team error:', err);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Create team (invitation only)
router.post('/', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { teamName, teamLeaderName, skillLevel, contactEmail, contactPhone } = req.body;

    if (!teamName || !skillLevel) {
      return res.status(400).json({ error: 'Team name and skill level required' });
    }

    const result = await db.query(
      `INSERT INTO teams (vendor_id, team_name, team_leader_name, skill_level, contact_email, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [vendorId, teamName, teamLeaderName, skillLevel, contactEmail, contactPhone]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create team error:', err);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Update team
router.put('/:id', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { id } = req.params;
    const { teamName, teamLeaderName, skillLevel, contactEmail, contactPhone, status } = req.body;

    // Verify ownership
    const teamResult = await db.query(
      'SELECT * FROM teams WHERE id = $1 AND vendor_id = $2',
      [id, vendorId]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const result = await db.query(
      `UPDATE teams SET 
       team_name = COALESCE($1, team_name),
       team_leader_name = COALESCE($2, team_leader_name),
       skill_level = COALESCE($3, skill_level),
       contact_email = COALESCE($4, contact_email),
       contact_phone = COALESCE($5, contact_phone),
       status = COALESCE($6, status),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [teamName, teamLeaderName, skillLevel, contactEmail, contactPhone, status, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update team error:', err);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Delete team
router.delete('/:id', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { id } = req.params;

    // Verify ownership
    const teamResult = await db.query(
      'SELECT * FROM teams WHERE id = $1 AND vendor_id = $2',
      [id, vendorId]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Delete team (cascade will handle members and history)
    await db.query('DELETE FROM teams WHERE id = $1', [id]);

    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    console.error('Delete team error:', err);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// Add members to team
router.post('/:id/members', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { id } = req.params;
    const { playerIds } = req.body;

    // Verify team ownership
    const teamResult = await db.query(
      'SELECT * FROM teams WHERE id = $1 AND vendor_id = $2',
      [id, vendorId]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Add members
    for (const playerId of playerIds) {
      const playerResult = await db.query(
        'SELECT full_name FROM players WHERE id = $1 AND vendor_id = $2',
        [playerId, vendorId]
      );

      if (playerResult.rows.length > 0) {
        await db.query(
          'INSERT INTO team_members (team_id, player_id, player_name) VALUES ($1, $2, $3)',
          [id, playerId, playerResult.rows[0].full_name]
        );
      }
    }

    res.json({ message: 'Members added to team' });
  } catch (err) {
    console.error('Add members error:', err);
    res.status(500).json({ error: 'Failed to add members' });
  }
});

// Remove member from team
router.delete('/:teamId/members/:memberId', async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { teamId, memberId } = req.params;

    // Verify team ownership
    const teamResult = await db.query(
      'SELECT * FROM teams WHERE id = $1 AND vendor_id = $2',
      [teamId, vendorId]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    await db.query('DELETE FROM team_members WHERE id = $1', [memberId]);

    res.json({ message: 'Member removed from team' });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

function calculateWinLoss(history) {
  let wins = 0, losses = 0, draws = 0;
  history.forEach(match => {
    if (match.result === 'won') wins++;
    else if (match.result === 'lost') losses++;
    else if (match.result === 'draw') draws++;
  });
  return { wins, losses, draws };
}

module.exports = router;
