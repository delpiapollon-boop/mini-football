const db = require('../config/database');

const schema = `
-- ENUM TYPES
CREATE TYPE user_role AS ENUM ('vendor', 'team', 'player');
CREATE TYPE match_status AS ENUM ('pending_acceptance', 'confirmed', 'completed', 'cancelled');
CREATE TYPE request_status AS ENUM ('pending', 'matched', 'cancelled');
CREATE TYPE skill_level AS ENUM ('1', '2', '3', '4', '5');
CREATE TYPE player_status AS ENUM ('active', 'inactive', 'temporary');
CREATE TYPE team_status AS ENUM ('active', 'inactive');

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VENDOR PROFILE (ONE ADMIN)
CREATE TABLE IF NOT EXISTS vendor_profile (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  business_name VARCHAR(255),
  phone VARCHAR(20),
  timezone VARCHAR(50) DEFAULT 'Europe/Nicosia',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- PITCHES (11 total)
CREATE TABLE IF NOT EXISTS pitches (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL,
  pitch_name VARCHAR(50) NOT NULL,
  pitch_number INTEGER NOT NULL,
  status team_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendor_profile(id) ON DELETE CASCADE,
  UNIQUE(vendor_id, pitch_number)
);

-- TIME SLOTS (5 per day)
CREATE TABLE IF NOT EXISTS time_slots (
  id SERIAL PRIMARY KEY,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TEAMS
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL,
  team_name VARCHAR(255) NOT NULL,
  team_leader_name VARCHAR(255),
  skill_level skill_level NOT NULL,
  status team_status DEFAULT 'active',
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  is_temporary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendor_profile(id) ON DELETE CASCADE
);

-- TEAM MEMBERS (players in a team)
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL,
  player_id INTEGER,
  player_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- PLAYERS
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  skill_level skill_level NOT NULL,
  status player_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendor_profile(id) ON DELETE CASCADE
);

-- MATCHES
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL,
  pitch_id INTEGER NOT NULL,
  match_date DATE NOT NULL,
  time_slot_id INTEGER NOT NULL,
  team_a_id INTEGER,
  team_a_name VARCHAR(255),
  team_b_id INTEGER,
  team_b_name VARCHAR(255),
  status match_status DEFAULT 'pending_acceptance',
  result VARCHAR(50),
  created_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendor_profile(id) ON DELETE CASCADE,
  FOREIGN KEY (pitch_id) REFERENCES pitches(id),
  FOREIGN KEY (time_slot_id) REFERENCES time_slots(id),
  FOREIGN KEY (team_a_id) REFERENCES teams(id) ON DELETE SET NULL,
  FOREIGN KEY (team_b_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- MATCH PLAYERS (tracks which players in each match)
CREATE TABLE IF NOT EXISTS match_players (
  id SERIAL PRIMARY KEY,
  match_id INTEGER NOT NULL,
  player_id INTEGER,
  player_name VARCHAR(255),
  team_side CHAR(1) NOT NULL CHECK (team_side IN ('A', 'B')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL
);

-- MATCH REQUESTS (teams/players requesting matches)
CREATE TABLE IF NOT EXISTS match_requests (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL,
  team_id INTEGER,
  player_id INTEGER,
  request_type VARCHAR(50) NOT NULL,
  preferred_slots VARCHAR(255),
  status request_status DEFAULT 'pending',
  suggested_match_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendor_profile(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (suggested_match_id) REFERENCES matches(id) ON DELETE SET NULL
);

-- MATCH ACCEPTANCES (tracks which teams have accepted/declined)
CREATE TABLE IF NOT EXISTS match_acceptances (
  id SERIAL PRIMARY KEY,
  match_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  accepted BOOLEAN,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  UNIQUE(match_id, team_id)
);

-- MATCH HISTORY (last 10 matches per team)
CREATE TABLE IF NOT EXISTS match_history (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL,
  match_id INTEGER NOT NULL,
  opponent_team_id INTEGER,
  opponent_team_name VARCHAR(255),
  match_date DATE,
  pitch_name VARCHAR(50),
  result VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (opponent_team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- INDEXES for performance
CREATE INDEX idx_matches_pitch_date ON matches(pitch_id, match_date);
CREATE INDEX idx_matches_vendor ON matches(vendor_id);
CREATE INDEX idx_teams_vendor ON teams(vendor_id);
CREATE INDEX idx_players_vendor ON players(vendor_id);
CREATE INDEX idx_match_requests_vendor ON match_requests(vendor_id);
CREATE INDEX idx_match_requests_status ON match_requests(status);
CREATE INDEX idx_match_acceptances_match ON match_acceptances(match_id);
`;

async function runMigration() {
  try {
    console.log('Starting database migration...');
    await db.query(schema);
    console.log('Database schema created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = schema;
