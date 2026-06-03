import { create } from 'zustand';

export const useStore = create((set) => ({
  // Auth
  user: null,
  token: null,
  isAuthenticated: false,
  
  setAuth: (user, token) => set({ 
    user, 
    token, 
    isAuthenticated: !!token 
  }),
  
  logout: () => set({ 
    user: null, 
    token: null, 
    isAuthenticated: false 
  }),
  
  // Data
  teams: [],
  players: [],
  matches: [],
  pitches: [],
  requests: [],
  
  setTeams: (teams) => set({ teams }),
  setPlayers: (players) => set({ players }),
  setMatches: (matches) => set({ matches }),
  setPitches: (pitches) => set({ pitches }),
  setRequests: (requests) => set({ requests }),
  
  // UI
  sidebarOpen: true,
  notifications: [],
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { id: Date.now(), ...notification }]
  })),
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id)
  })),
  
  // Filters
  selectedDate: new Date().toISOString().split('T')[0],
  selectedPitch: null,
  selectedMatchStatus: 'all',
  
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedPitch: (pitch) => set({ selectedPitch: pitch }),
  setSelectedMatchStatus: (status) => set({ selectedMatchStatus: status }),
}));
