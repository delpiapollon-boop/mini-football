# Mini Football Matchmaking - Backend Setup Guide

## Prerequisites

- Node.js 14+ and npm
- PostgreSQL 12+
- Git

## Installation

### 1. Clone and Install Dependencies

```bash
cd mini-football-backend
npm install
```

### 2. Database Setup

#### Create PostgreSQL Database

```bash
psql -U postgres

CREATE DATABASE mini_football;
CREATE USER minifootball WITH PASSWORD 'your_secure_password';
ALTER ROLE minifootball WITH CREATEDB;
ALTER DATABASE mini_football OWNER TO minifootball;
```

#### Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and update:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=minifootball
DB_PASSWORD=your_secure_password
DB_NAME=mini_football
JWT_SECRET=your_very_secure_random_string
```

#### Run Migration

```bash
npm run migrate
```

This will create all required tables and indexes.

### 3. Start Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run on `http://localhost:5000`

---

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register vendor admin
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team details
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/:id/members` - Add members
- `DELETE /api/teams/:teamId/members/:memberId` - Remove member

### Players
- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get player details
- `POST /api/players` - Create player
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get match details
- `POST /api/matches` - Create match
- `PUT /api/matches/:id` - Update match/input result
- `DELETE /api/matches/:id` - Cancel match
- `POST /api/matches/check-overlap` - Check pitch overlap

### Pitches
- `GET /api/pitches` - Get all pitches
- `GET /api/pitches/:pitchId/available` - Get available time slots
- `PUT /api/pitches/:id` - Update pitch status

### Match Requests
- `GET /api/requests` - Get all match requests
- `POST /api/requests` - Create match request
- `POST /api/requests/suggestions` - Get skill-matched opponents
- `POST /api/requests/player-suggestions` - Get players to fill squad
- `PUT /api/requests/:id` - Update request status
- `DELETE /api/requests/:id` - Cancel request

---

## Database Schema

### Core Tables
- **users** - System users (vendor admin)
- **vendor_profile** - Vendor business info
- **teams** - Teams (verified or temporary)
- **team_members** - Players in teams
- **players** - Individual players in vendor's database
- **pitches** - The 11 playing fields
- **time_slots** - Available time slots (5 per day)
- **matches** - Scheduled matches
- **match_players** - Players assigned to matches
- **match_acceptances** - Team acceptance tracking
- **match_requests** - Teams/players requesting matches
- **match_history** - Last 10 matches per team

---

## Key Features Implemented

### 1. Overlap Prevention
- System checks pitch + date + time slot combinations
- Prevents double-booking of same pitch/time
- Returns 409 Conflict error if overlap detected

### 2. Skill Level Matching
- Suggestions within ±1 skill level of requesting team
- Vendor can override suggestions
- Skill levels hidden from teams/players in API responses

### 3. Matchmaking Logic
- Support for 5 scenarios:
  1. Full group (10 people) on 2 pitches
  2. Two verified teams matching
  3. Team + vendor contacts
  4. Solo players
  5. Incomplete teams + fillers

### 4. Match History
- Tracks last 10 matches per team
- Shows opponent, date, pitch, result
- Automatically updated when match completed

### 5. User Roles
- **Vendor**: Full access to all data and operations
- **Teams**: Limited to their own matches and requests
- **Players**: Limited to their own matches

---

## Testing the API

### 1. Register Vendor
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@minifootball.com",
    "password": "securepass123",
    "businessName": "My Football Club"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@minifootball.com",
    "password": "securepass123"
  }'
```

Use the returned `token` in Authorization header for all other requests:
```
Authorization: Bearer <token>
```

### 3. Create Team
```bash
curl -X POST http://localhost:5000/api/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "teamName": "Eagles FC",
    "teamLeaderName": "John Doe",
    "skillLevel": "3",
    "contactEmail": "eagles@email.com",
    "contactPhone": "+357991234567"
  }'
```

---

## Deployment Options

### Docker
```bash
docker build -t mini-football-api .
docker run -p 5000:5000 --env-file .env mini-football-api
```

### Heroku
```bash
heroku create mini-football-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### AWS/DigitalOcean
Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name mini-football-api
pm2 save
```

---

## Troubleshooting

**Connection refused**: Check PostgreSQL is running and credentials in .env
**Port already in use**: Change PORT in .env or kill process: `lsof -i :5000`
**JWT errors**: Regenerate secure secret in .env
**CORS errors**: Check frontend URL in allowed origins

---

## Future Enhancements

- [ ] Real-time notifications (WebSocket)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Payment processing integration
- [ ] Team ratings and reviews
- [ ] Injury/unavailability tracking
- [ ] Advanced analytics and reporting
