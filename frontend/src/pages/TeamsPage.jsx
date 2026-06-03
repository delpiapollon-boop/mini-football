// TeamsPage.jsx
import React, { useState, useEffect } from 'react';
import { teamsAPI } from '../api';
import { Plus, Users } from 'lucide-react';

export const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const res = await teamsAPI.getAll();
      setTeams(res.data);
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-100 font-display">Teams</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-900 font-bold rounded hover:bg-amber-600 transition">
          <Plus size={20} /> New Team
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users size={20} className="text-amber-400" />
          <h2 className="text-lg font-bold text-slate-100">Team List</h2>
          <span className="text-slate-400 text-sm">({teams.length})</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No teams yet</div>
        ) : (
          <div className="grid gap-4">
            {teams.map((team) => (
              <div key={team.id} className="bg-slate-700/50 rounded p-4 border border-slate-600 hover:border-amber-400/50 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-100">{team.team_name}</h3>
                    <p className="text-xs text-slate-400 mt-1">Leader: {team.team_leader_name}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                      <span>Skill: {team.skill_level}/5</span>
                      <span>Status: {team.status}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-amber-400 font-bold">Level {team.skill_level}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsPage;
