// PlayersPage.jsx
export { default as PlayersPage } from './PlayersPage';

// Create a simple placeholder for now
import React from 'react';

export const PlayersPageComponent = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-slate-100 font-display">Players</h1>
    <p className="text-slate-400 mt-4">Players management coming soon...</p>
  </div>
);

export const MatchesPageComponent = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-slate-100 font-display">Matches</h1>
    <p className="text-slate-400 mt-4">Matches management coming soon...</p>
  </div>
);

export const MatchesCreatePageComponent = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-slate-100 font-display">Create Match</h1>
    <p className="text-slate-400 mt-4">Match creation coming soon...</p>
  </div>
);

export const RequestsPageComponent = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-slate-100 font-display">Match Requests</h1>
    <p className="text-slate-400 mt-4">Requests management coming soon...</p>
  </div>
);
