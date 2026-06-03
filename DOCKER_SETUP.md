# Docker Setup Guide - One Command to Run Everything

## ⚡ Quick Start (2 minutes)

### 1. Install Docker Desktop
- **Mac**: https://www.docker.com/products/docker-desktop
- **Windows**: https://www.docker.com/products/docker-desktop
- **Linux**: `sudo apt-get install docker.io docker-compose`

### 2. Start Everything
```bash
docker-compose up
```

That's it! Wait ~2 minutes for containers to start.

### 3. Access the App
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Database**: postgres://minifootball:minifootball_demo_password@localhost:5432/mini_football

### 4. Login
```
Email: admin@demo.com
Password: demo123
```

---

## 🔧 What Gets Set Up Automatically

✅ PostgreSQL database (15-alpine)  
✅ Node.js backend (port 5000)  
✅ React frontend (port 3000)  
✅ All environment variables  
✅ Database migrations  
✅ Network connectivity between services  
✅ Health checks  
✅ Volume mounting (live reload in dev mode)  

---

## 📋 Commands

### Start all services
```bash
docker-compose up
```

### Start in background
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f
```

### View specific service logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Stop everything
```bash
docker-compose down
```

### Stop and remove data
```bash
docker-compose down -v
```

### Rebuild images
```bash
docker-compose build
```

### Rebuild and restart
```bash
docker-compose up --build
```

### Connect to database
```bash
docker-compose exec db psql -U minifootball -d mini_football
```

### View running containers
```bash
docker ps
```

---

## 🐛 Troubleshooting

### "Port 5000 already in use"
```bash
# Change in docker-compose.yml:
# Change "5000:5000" to "5001:5000"
# Then access backend at http://localhost:5001
```

### "Port 3000 already in use"
```bash
# Change in docker-compose.yml:
# Change "3000:3000" to "3001:3000"
# Then access frontend at http://localhost:3001
```

### Database not connecting
```bash
# Wait 30 seconds for database to be ready
# Check logs:
docker-compose logs db

# Restart database:
docker-compose restart db
```

### Backend not starting
```bash
# Check logs:
docker-compose logs backend

# Rebuild:
docker-compose up --build backend
```

### Frontend stuck on "Loading..."
```bash
# Clear browser cache (Ctrl+Shift+Delete)
# Or open in private/incognito window
# Check frontend logs:
docker-compose logs frontend
```

### Changes not reflecting
```bash
# Backend: Changes auto-reflect (volume mounted)
# Frontend: May need restart
docker-compose restart frontend

# Or rebuild:
docker-compose up --build frontend
```

---

## 🔐 Environment Variables

Current defaults (for demo):
```
DB_USER: minifootball
DB_PASSWORD: minifootball_demo_password
DB_NAME: mini_football
JWT_SECRET: your_super_secret_jwt_key_change_in_production
TIMEZONE: Europe/Nicosia
```

### Change Variables
Edit `docker-compose.yml`:
```yaml
environment:
  JWT_SECRET: your_new_secret_key
  TIMEZONE: Europe/London
```

Then rebuild:
```bash
docker-compose up --build
```

---

## 📊 Database Access

### Via Docker
```bash
docker-compose exec db psql -U minifootball -d mini_football
```

### Via Any SQL Client
```
Host: localhost
Port: 5432
Database: mini_football
User: minifootball
Password: minifootball_demo_password
```

### View Tables
```sql
\dt
```

### Check data
```sql
SELECT * FROM teams;
SELECT * FROM pitches;
SELECT * FROM time_slots;
SELECT * FROM matches;
```

---

## 🚀 Development vs Production

### Development (Current)
- Live file reloading (changes auto-reflect)
- Development dependencies installed
- Verbose logging
- Easier debugging

### Production Deployment
Edit `docker-compose.yml`:
```yaml
environment:
  NODE_ENV: production
  REACT_APP_ENV: production
```

Then:
```bash
docker-compose up --build
```

---

## 📁 Container File Locations

### Backend Container
- Code: `/app/`
- Database migrations: `/app/scripts/migrate.js`
- Environment: `/app/.env`

### Frontend Container
- Source: `/app/`
- Built files: `/usr/share/nginx/html/`

### Database Container
- Data: `/var/lib/postgresql/data/`

---

## 🔍 Checking Services Health

### All services
```bash
docker-compose ps
```

### Specific service
```bash
docker inspect mini-football-api
docker inspect mini-football-db
docker inspect mini-football-frontend
```

---

## 💾 Backup & Restore Database

### Backup
```bash
docker-compose exec db pg_dump -U minifootball mini_football > backup.sql
```

### Restore
```bash
docker-compose exec -T db psql -U minifootball mini_football < backup.sql
```

---

## 🌐 Access from Other Machines

By default, Docker only exposes to `localhost`. To access from another machine:

### Option 1: Change docker-compose.yml
```yaml
ports:
  - "0.0.0.0:5000:5000"  # Backend
  - "0.0.0.0:3000:3000"  # Frontend
  - "0.0.0.0:5432:5432"  # Database
```

Then access via your machine IP:
```
http://192.168.1.100:3000
```

### Option 2: Use ngrok (tunneling)
```bash
# Install ngrok
brew install ngrok

# Expose frontend
ngrok http 3000

# Share the URL with others
```

---

## 📈 Scaling

### Run multiple instances
```bash
docker-compose up --scale backend=2
```

### Use with nginx load balancer
Add to `docker-compose.yml`:
```yaml
nginx-lb:
  image: nginx:alpine
  ports:
    - "80:80"
  volumes:
    - ./nginx-lb.conf:/etc/nginx/nginx.conf
  depends_on:
    - backend
```

---

## 🔄 Continuous Deployment

### Auto-rebuild on file changes (Development)
```bash
docker-compose watch
```

### Or manually trigger rebuilds
```bash
docker-compose build && docker-compose up
```

---

## 🎯 Next Steps After Docker Setup

1. ✅ App running at http://localhost:3000
2. ✅ API running at http://localhost:5000
3. ✅ Database ready with schema
4. Test the application
5. Create test teams & players
6. Create test matches
7. Ready for production deployment

---

## 🚀 Deploy to Production

### Docker Hub
```bash
docker login
docker tag mini-football-api:latest yourusername/mini-football-api:latest
docker push yourusername/mini-football-api:latest
```

### AWS, Google Cloud, or Azure
Use their container registries with this docker-compose file

### Heroku
```bash
heroku container:push web
heroku container:release web
```

---

## 📞 Help & Support

If something doesn't work:

1. **Check logs**: `docker-compose logs -f`
2. **Restart services**: `docker-compose restart`
3. **Clear everything and start fresh**: `docker-compose down -v && docker-compose up --build`
4. **Verify Docker is running**: `docker ps`
5. **Check port availability**: `lsof -i :5000` (Mac/Linux)

---

**You're all set! The entire application is now running in Docker.** 🐳⚽
