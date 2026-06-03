# Mini Football Matchmaking - Frontend Setup Guide

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Backend API running (see BACKEND_SETUP.md)

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

Create `.env.local`:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

### Start Development Server

```bash
npm start
```

App will open at `http://localhost:3000`

---

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx          # Authentication
│   │   ├── DashboardPage.jsx       # Main dashboard
│   │   ├── TeamsPage.jsx           # Team management
│   │   ├── PlayersPage.jsx         # Player management
│   │   ├── MatchesPage.jsx         # Match listing
│   │   ├── MatchesCreatePage.jsx   # Match creation
│   │   └── RequestsPage.jsx        # Request handling
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx         # Navigation
│   │   │   └── Topbar.jsx          # Header
│   │   ├── CalendarView.jsx        # Pitch calendar
│   │   └── NotificationCenter.jsx  # Alerts
│   │
│   ├── api.js                      # API client
│   ├── store.js                    # State management (Zustand)
│   └── App.jsx                     # Main app component
│
├── tailwind.config.js              # Tailwind config
├── package.json
└── public/
    └── index.html
```

---

## Key Features Implemented

### ✅ Completed
- **Authentication**: Login/Register with JWT
- **Dashboard**: Overview stats, quick actions, calendar preview
- **Sidebar Navigation**: Dark industrial UI with smooth transitions
- **Topbar**: User menu, notifications
- **Calendar View**: Pitch scheduling with time slots
- **State Management**: Zustand for global state
- **API Integration**: Axios client with interceptors
- **Responsive Design**: Mobile-first, dark theme

### 🔨 In Progress (Stubs Ready)
- **Teams Management**: Full CRUD, skill levels, history
- **Players Management**: Player database, status tracking
- **Matches Management**: Create, edit, cancel, results
- **Match Requests**: Queue, suggestions, acceptance flow
- **Notifications**: Real-time alerts

---

## Design Philosophy

### Dark Industrial Theme
- **Background**: Deep slate (#0f172a)
- **Cards**: Slate-800 with slate-700 borders
- **Accents**: Amber-500 for primary actions, emerald/red for status
- **Typography**: Inter (body), Space Grotesk (headers), IBM Plex Mono (labels)

### Animation & Micro-interactions
- Subtle fade-in on page load
- Slide transitions for modals
- Hover state feedback on interactive elements
- Loading states with spinners

---

## Development Workflow

### 1. Adding a New Page

Create new page in `src/pages/YourPage.jsx`:
```jsx
import React from 'react';
import { useStore } from '../store';

const YourPage = () => {
  const { user } = useStore();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-slate-100 font-display">
        Your Page Title
      </h1>
      {/* Content */}
    </div>
  );
};

export default YourPage;
```

Add route in `App.jsx`:
```jsx
<Route path="/your-path" element={<YourPage />} />
```

Add nav item in `components/layout/Sidebar.jsx`:
```jsx
{ icon: YourIcon, label: 'Your Page', path: '/your-path', id: 'your-id' }
```

### 2. Calling API Endpoints

```jsx
import { teamsAPI, playersAPI, matchesAPI } from '../api';

// Usage in component
useEffect(() => {
  const loadData = async () => {
    try {
      const response = await teamsAPI.getAll();
      setTeams(response.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };
  loadData();
}, []);
```

### 3. Global State Management

```jsx
import { useStore } from '../store';

const MyComponent = () => {
  const { user, setAuth, logout, addNotification } = useStore();

  const handleAction = () => {
    addNotification({
      type: 'success',
      title: 'Success!',
      message: 'Action completed'
    });
  };

  return <>{/* JSX */}</>;
};
```

---

## Styling Guide

### Colors
```css
/* Backgrounds */
.bg-slate-900    /* Page background */
.bg-slate-800    /* Cards */
.bg-slate-700    /* Hover states */

/* Text */
.text-slate-100  /* Main text */
.text-slate-400  /* Secondary text */

/* Accents */
.text-amber-400  /* Primary actions */
.text-emerald-400 /* Success */
.text-red-400    /* Errors */
```

### Common Patterns

Button:
```jsx
<button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg transition">
  Click me
</button>
```

Card:
```jsx
<div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
  {/* Content */}
</div>
```

Stat Box:
```jsx
<div className="bg-slate-800 border border-amber-500/30 bg-amber-500/10 rounded-lg p-4">
  <p className="text-slate-400 text-xs font-mono">Label</p>
  <p className="text-3xl font-bold text-slate-100 mt-2">Value</p>
</div>
```

---

## API Integration Checklist

### Teams Page
- [ ] GET all teams with skill levels
- [ ] POST create team
- [ ] PUT update team
- [ ] DELETE team
- [ ] Show 10-match history
- [ ] Display win/loss record

### Players Page
- [ ] GET all players (with/without temporary)
- [ ] POST create player
- [ ] PUT update player
- [ ] DELETE player
- [ ] Track appearances

### Matches Page
- [ ] GET all matches with filters
- [ ] Calendar view with overlap warnings
- [ ] POST create match with team/player assignment
- [ ] PUT update result
- [ ] DELETE cancel match
- [ ] Skill-matched opponent suggestions

### Requests Page
- [ ] GET pending requests queue
- [ ] Show team/player request details
- [ ] POST suggest matches
- [ ] Vendor match confirmation
- [ ] Send notifications to teams

---

## Testing

### Manual Testing Checklist
- [ ] Login/logout flow
- [ ] Navigate all pages
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Dark mode consistency
- [ ] API error handling
- [ ] Token expiration handling

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Deployment

### Build for Production
```bash
npm run build
```

Creates optimized build in `build/` directory.

### Deployment Options

**Vercel** (Recommended for React):
```bash
npm install -g vercel
vercel
```

**Netlify**:
```bash
npm run build
# Drag build/ folder to Netlify
```

**Docker**:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t mini-football-frontend .
docker run -p 80:80 mini-football-frontend
```

---

## Troubleshooting

**API Connection Error**:
- Check `REACT_APP_API_URL` in `.env.local`
- Verify backend is running on correct port
- Check CORS headers from backend

**Login fails**:
- Check credentials in backend
- Verify JWT_SECRET matches backend
- Clear browser cache/localStorage

**Styles not working**:
- Run `npm install` to update Tailwind
- Check `tailwind.config.js` includes all paths
- Restart dev server after config changes

**Build fails**:
- Clear `node_modules/` and reinstall
- Check for syntax errors
- Verify all imports are correct

---

## Performance Tips

- Use React DevTools Profiler to find bottlenecks
- Lazy-load pages with `React.lazy()` for future optimization
- Memoize expensive components with `React.memo()`
- Use pagination for large lists (matches, teams)
- Cache API responses in Zustand store

---

## Next Steps

1. **Implement remaining pages** fully with forms and data tables
2. **Add WebSocket** for real-time match updates
3. **Email notifications** via backend
4. **Advanced filtering** on matches and requests
5. **Team/Player profiles** with detailed stats
6. **Analytics dashboard** with charts
7. **Dark/Light mode toggle**
8. **Internationalization** (multi-language)

---

## Support & Resources

- **Tailwind CSS**: https://tailwindcss.com
- **React Router**: https://reactrouter.com
- **Zustand**: https://github.com/pmndrs/zustand
- **Lucide Icons**: https://lucide.dev
- **Axios**: https://axios-http.com
