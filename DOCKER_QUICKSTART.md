# 🚀 DOCKER QUICK START - Copy & Paste These Commands

## Step 1: Install Docker Desktop (One Time)

### Mac
```bash
# Install using Homebrew
brew install docker

# Or download from:
# https://www.docker.com/products/docker-desktop
```

### Windows
```bash
# Download and install Docker Desktop:
# https://www.docker.com/products/docker-desktop

# Or use Windows Package Manager:
choco install docker-desktop
```

### Linux
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker
```

### Verify Installation
```bash
docker --version
docker-compose --version
```

---

## Step 2: Download All Files

All files are ready in `/mnt/user-data/outputs/`

**Option A: Clone from GitHub** (if you have a repo)
```bash
git clone <your-repo-url> mini-football
cd mini-football
```

**Option B: Download ZIP** (from outputs folder)
1. Download all files
2. Extract to a folder: `mini-football/`
3. Open terminal in that folder

---

## Step 3: ONE COMMAND TO RUN EVERYTHING

```bash
docker-compose up
```

Wait 2-3 minutes... you'll see output like:
```
✓ mini-football-db listening on 5432
✓ mini-football-api listening on 5000
✓ mini-football-frontend listening on 3000
```

---

## Step 4: Open the App

Go to: **http://localhost:3000**

Login with:
```
Email: admin@demo.com
Password: demo123
```

---

## 🎉 That's It! 

The entire system is now running:
- ✅ **Frontend**: http://localhost:3000 (React app)
- ✅ **Backend API**: http://localhost:5000 (Node.js)
- ✅ **Database**: PostgreSQL (automatic)

---

## Common Commands

### Stop everything
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Stop and completely clean (reset database)
```bash
docker-compose down -v
```

### Rebuild and restart (after code changes)
```bash
docker-compose up --build
```

### Connect to database directly
```bash
docker-compose exec db psql -U minifootball -d mini_football
```

---

## 🐛 If Something Goes Wrong

### "docker-compose: command not found"
You probably have an older version. Try:
```bash
docker compose up  # (no hyphen)
```

### Port already in use?
```bash
# Check what's using the port
lsof -i :3000    # or :5000 or :5432

# Kill the process
kill -9 <PID>

# Or change the port in docker-compose.yml
# Change "3000:3000" to "3001:3000"
```

### Database won't start?
```bash
docker-compose restart db
docker-compose logs db
```

### Frontend shows "Loading..." forever?
```bash
# Clear browser cache
# Press Ctrl+Shift+Delete and clear everything

# Or open in incognito mode
```

### Changes not showing up?
```bash
# Restart the service
docker-compose restart backend

# Or full rebuild
docker-compose up --build
```

---

## 📊 What Just Happened?

Docker created 3 containers:

1. **PostgreSQL Database**
   - Automatically created schema
   - 11 pitches auto-created
   - 5 time slots auto-created
   - Ready for data

2. **Node.js Backend**
   - API running on port 5000
   - 32 endpoints ready
   - Connected to database
   - Auto-migrations ran

3. **React Frontend**
   - App running on port 3000
   - Nginx serving optimized build
   - Connected to backend
   - Ready to use

All networking, environment variables, and dependencies are handled automatically.

---

## 🎯 Next Steps

1. **Explore the app** - Create teams, players, matches
2. **Test match creation** - All 5 scenarios available
3. **Check the database** - See tables and data
4. **Make code changes** - Changes auto-reflect (with restart)
5. **Deploy to production** - When ready

---

## 📖 Full Documentation

For detailed information:
- `DOCKER_SETUP.md` - Comprehensive Docker guide
- `README.md` - Project overview
- `BACKEND_SETUP.md` - API details
- `FRONTEND_SETUP.md` - Frontend development

---

## 🚀 You're Done!

Your mini football matchmaking system is now running with:
- ✅ 11 pitches
- ✅ 5 time slots/day
- ✅ Team/player management
- ✅ All 5 booking scenarios
- ✅ Dark professional UI
- ✅ Database & API
- ✅ Ready to customize

**Everything works. Start using it!** ⚽
