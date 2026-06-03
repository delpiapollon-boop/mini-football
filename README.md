# Mini Football Matchmaking System - Complete Setup Guide

## 📋 Project Overview

A full-stack web application for managing mini football (5v5) matchmaking with:
- **11 pitches** for simultaneous games
- **5 time slots** per day (6:30pm - 11pm)
- **Advanced matchmaking** logic for 5 different booking scenarios
- **Vendor admin control** with team/player management
- **Dark industrial UI** built with React & Tailwind CSS
- **PostgreSQL database** with complete schema
- **Node.js/Express API** with JWT authentication

---

## 🗂️ Project Structure

```
mini-football/
├── backend/                    # Node.js/Express API
│   ├── server.js              # Main server file
│   ├── package.json
│   ├── .env.example           # Environment template
│   ├── config/
│   │   └── database.js        # PostgreSQL connection
│   ├── routes/
│   │   ├── auth.js            # Authentication
│   │   ├── teams.js           # Teams CRUD
│   │   ├── players.js         # Players CRUD
│   │   ├── matches.js         # Matches & matchmaking
│   │   ├── pitches.js         # Pitches & time slots
│   │   └── requests.js        # Match requests
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── utils/
│   │   └── validators.js      # Input validation
│   ├── scripts/
│   │   ├── migrate.js         # Database setup
│   │   └── seed.js            # Test data
│   └── BACKEND_SETUP.md       # Backend documentation
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── pages/            # Route pages
│   │   ├── components/       # Reusable components
│   │   ├── App.jsx           # Main app component
│   │   ├── store.js          # Zustand state
│   │   └── api.js            # API client
│   ├── package.json
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── public/index.html
│   └── FRONTEND_SETUP.md     # Frontend documentation
│
├── docs/                       # Documentation
│   ├── API.md                # API documentation
│   ├── DATABASE.md           # Database schema
│   └── DEPLOYMENT.md         # Production deployment
│
└── README.md                  # This file
```

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- Git

### Backend Setup

```bash
# 1. Create directory
mkdir mini-football && cd mini-football

# 2. Set up backend
git clone <repo> backend
cd backend
npm install
cp .env.example .env

# 3. Update .env with your PostgreSQL credentials
# DB_PASSWORD=your_password
# JWT_SECRET=your_secret_key

# 4. Run database migration
npm run migrate

# 5. Start backend
npm run dev
# API running on http://localhost:5000
```

### Frontend Setup (in new terminal)

```bash
# 1. Navigate to frontend
cd frontend
npm install

# 2. Start development server
npm start
# App opens at http://localhost:3000
```

### First Login

```
Email: vendor@minifootball.com
Password: demo123
```

---

## 📚 Feature Breakdown

### Scenario 1: Full Group (10 people)
```
→ Vendor creates 2 matches on same time slot
→ One match per team (5v5 each)
→ Both teams must be selected/created
```

### Scenario 2: Two Teams Requesting Match
```
→ Team A requests match with preferred times
→ Team B also requests match
→ Vendor suggests match between them
→ Both teams accept/decline invitation
→ Confirmed matches appear on calendar
```

### Scenario 3: Team + Vendor Contacts
```
→ Team A requests match (no rival available)
→ Vendor creates opponent using contacts
→ Creates temporary team or selects players
→ Sends match invitation to Team A
→ Match confirmed once Team A accepts
```

### Scenario 4: Solo Players
```
→ Individual verified players request match
→ Vendor finds available matches to add them
→ Suggests skill-matched teams
→ Player joins match and confirms
```

### Scenario 5: Incomplete Team + Fillers
```
→ Team has 3 players, needs 2 more
→ Vendor finds/creates fillers
→ Temporary players added to match
→ Match confirmed when team accepts
```

---

## 🔐 Authentication & Authorization

### Vendor Admin
- Full access to all features
- Can create/edit/delete teams, players, matches
- View all skill levels (hidden from teams)
- Manage all pitch bookings
- Input match results

### Verified Teams (Future Enhancement)
- Request matches
- View own bookings
- Accept/decline invitations
- View own match history
- Cannot see other teams' skill levels

### Verified Players (Future Enhancement)
- Request to join matches
- Accept/decline invitations
- View own appearances
- Cannot see skill levels

---

## 💾 Database Schema

### Core Tables
| Table | Purpose |
|-------|---------|
| `users` | System users (vendor) |
| `vendor_profile` | Vendor business details |
| `teams` | Teams (verified or temporary) |
| `players` | Individual players in database |
| `pitches` | The 11 playing fields |
| `time_slots` | Available time slots (5/day) |
| `matches` | Scheduled matches |
| `match_players` | Players assigned to matches |
| `match_acceptances` | Team acceptance tracking |
| `match_requests` | Teams/players requesting matches |
| `match_history` | Last 10 matches per team |

### Key Relationships
```
vendor_profile (1) ─→ (n) teams
vendor_profile (1) ─→ (n) players
vendor_profile (1) ─→ (n) pitches
vendor_profile (1) ─→ (n) matches

pitches (n) ─→ (n) time_slots = matches
teams (n) ─→ (n) players = team_members
matches (1) ─→ (n) match_players
matches (1) ─→ (n) match_acceptances
matches (1) ─→ (1) time_slot
```

---

## 🔌 API Endpoints Summary

### Authentication
```
POST   /api/auth/register     # Register vendor
POST   /api/auth/login        # Login
GET    /api/auth/verify       # Verify token
```

### Teams
```
GET    /api/teams             # All teams
GET    /api/teams/:id         # Team details
POST   /api/teams             # Create team
PUT    /api/teams/:id         # Update team
DELETE /api/teams/:id         # Delete team
POST   /api/teams/:id/members # Add members
```

### Players
```
GET    /api/players           # All players
GET    /api/players/:id       # Player details
POST   /api/players           # Create player
PUT    /api/players/:id       # Update player
DELETE /api/players/:id       # Delete player
```

### Matches
```
GET    /api/matches           # All matches (with filters)
GET    /api/matches/:id       # Match details
POST   /api/matches           # Create match
PUT    /api/matches/:id       # Update/complete match
DELETE /api/matches/:id       # Cancel match
POST   /api/matches/check-overlap # Detect conflicts
```

### Pitches & Time Slots
```
GET    /api/pitches           # All pitches
GET    /api/pitches/:id/available # Available slots
```

### Requests
```
GET    /api/requests          # All requests
POST   /api/requests          # Create request
POST   /api/requests/suggestions # Get suggestions
PUT    /api/requests/:id      # Update request
DELETE /api/requests/:id      # Cancel request
```

---

## 🎨 UI/UX Design

### Color Palette
- **Backgrounds**: Slate-900, Slate-800
- **Borders**: Slate-700
- **Text Primary**: Slate-100
- **Text Secondary**: Slate-400
- **Accent**: Amber-500 (primary actions)
- **Status**: Emerald-400 (success), Red-500 (error)

### Typography
- **Display**: Space Grotesk (headers)
- **Body**: Inter (content)
- **Mono**: IBM Plex Mono (labels, codes)

### Components
- Sidebar navigation with active state
- Topbar with user menu
- Stat boxes with icons
- Calendar grid for pitch scheduling
- Match cards with status indicators
- Form inputs with validation
- Notification toasts

---

## 🔄 Development Workflow

### Backend Development
```bash
cd backend
npm run dev                # Restart on file changes
npm run migrate           # Apply schema changes
npm run seed             # Load test data
```

### Frontend Development
```bash
cd frontend
npm start                 # Hot reload on changes
npm run build            # Production build
```

### Database Management
```bash
# Connect to PostgreSQL
psql -U postgres -d mini_football

# View tables
\dt

# Run migrations
npm run migrate

# Reset database
psql -U postgres -d mini_football -f scripts/reset.sql
```

---

## 📋 Environment Configuration

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=mini_football

# Security
JWT_SECRET=your_super_secret_key

# Application
TIMEZONE=Europe/Nicosia
```

### Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

---

## 🧪 Testing Workflow

### Vendor Admin Workflow
1. **Register** at login page
2. **View Dashboard** - see overview stats
3. **Create Teams** - invite teams with skill levels
4. **Create Players** - add contacts/regulars database
5. **Create Matches** - select pitch, date, time, teams
6. **Handle Requests** - view pending team/player requests
7. **Input Results** - mark winners after games
8. **View History** - check team 10-match records

### Common Tasks
```
Create Temporary Player:
  POST /api/players
  { fullName, skillLevel, status: "temporary" }

Create Match with Overlaps Check:
  POST /api/matches/check-overlap
  { pitchId, matchDate, timeSlotId }
  → Check hasOverlap response
  → If false, proceed with match creation

Get Skill-Matched Opponents:
  POST /api/requests/suggestions
  { teamId, skillLevel: "3" }
  → Returns teams with skill 2, 3, or 4

Complete Match & Update History:
  PUT /api/matches/:id
  { status: "completed", result: "Team A won" }
  → Automatically updates match_history table
```

---

## 🚀 Deployment

### Heroku Deployment (Backend)
```bash
# 1. Create app
heroku create mini-football-api

# 2. Add database
heroku addons:create heroku-postgresql:hobby-dev

# 3. Set environment variables
heroku config:set JWT_SECRET=your_secret

# 4. Deploy
git push heroku main

# 5. Run migrations
heroku run npm run migrate
```

### Vercel Deployment (Frontend)
```bash
# 1. Connect GitHub repo to Vercel
# 2. Set environment variable
REACT_APP_API_URL=https://mini-football-api.herokuapp.com/api

# 3. Auto-deploys on git push
```

### Docker Deployment
```bash
# Build images
docker-compose build

# Run containers
docker-compose up

# Access
http://localhost:3000  # Frontend
http://localhost:5000  # API
```

---

## 📖 Documentation Files

- **BACKEND_SETUP.md** - Backend installation & API details
- **FRONTEND_SETUP.md** - Frontend installation & component guide
- **API.md** - Detailed API documentation (TODO)
- **DATABASE.md** - Database schema & queries (TODO)
- **DEPLOYMENT.md** - Production deployment guide (TODO)

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Backend (port 5000)
lsof -i :5000
kill -9 <PID>

# Frontend (port 3000)
lsof -i :3000
kill -9 <PID>
```

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres

# Reset connection pool
npm run db:reset
```

### JWT Authentication Fails
- Clear localStorage in browser
- Verify JWT_SECRET matches backend
- Check token expiration: `jwt.io`

### CORS Errors
- Verify `REACT_APP_API_URL` matches backend URL
- Check backend CORS middleware configuration

---

## 📊 Performance Metrics

### Target Performance
- Dashboard load: < 1 second
- Calendar render: < 500ms
- Match creation: < 2 seconds
- API response: < 200ms (average)
- Database query: < 50ms (average)

### Optimization Tips
- Memoize expensive components
- Lazy-load pages with React.lazy()
- Pagination for large lists
- Database indexes on foreign keys
- API response caching in Zustand

---

## 🎯 Roadmap

### Phase 1 (Current) ✅
- [x] Backend API structure
- [x] Database schema
- [x] Frontend scaffolding
- [x] Authentication system
- [x] Dashboard & navigation

### Phase 2 (Active Development)
- [ ] Teams management page (full CRUD)
- [ ] Players management page (full CRUD)
- [ ] Matches creation & management
- [ ] Request queue & processing
- [ ] Calendar with drag-and-drop

### Phase 3 (Enhancement)
- [ ] WebSocket for real-time updates
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Team/player public profiles
- [ ] Mobile app (React Native)

### Phase 4 (Scaling)
- [ ] Multi-vendor support
- [ ] Payment integration
- [ ] AI-powered team balancing
- [ ] Mobile app (iOS/Android)
- [ ] Video highlight clips

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -am 'Add feature'`
3. Push branch: `git push origin feature/feature-name`
4. Open Pull Request

---

## 📞 Support

For issues or questions:
- Check documentation files
- Review API endpoints
- Test with Postman/Insomnia
- Check browser console for errors
- Review server logs: `npm run dev`

---

## 📄 License

[Your License Here]

---

**Ready to get started? Begin with [BACKEND_SETUP.md](./backend/BACKEND_SETUP.md)**
