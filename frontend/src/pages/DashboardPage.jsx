import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { matchesAPI, pitchesAPI } from '../api';
import {
  Calendar,
  Plus,
  AlertCircle,
  Zap,
  Users,
  CheckCircle,
  Clock
} from 'lucide-react';
import CalendarView from '../components/CalendarView';

const DashboardPage = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [matchesRes, pitchesRes] = await Promise.all([
        matchesAPI.getAll({ date: selectedDate }),
        pitchesAPI.getAll(),
      ]);

      setMatches(matchesRes.data);
      setPitches(pitchesRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const todayMatches = matches.filter((m) => m.status === 'confirmed');
  const pendingMatches = matches.filter((m) => m.status === 'pending_acceptance');
  const completedMatches = matches.filter((m) => m.status === 'completed');

  const stats = [
    {
      label: 'Matches Today',
      value: todayMatches.length,
      icon: Zap,
      color: 'amber',
    },
    {
      label: 'Pending Acceptance',
      value: pendingMatches.length,
      icon: Clock,
      color: 'blue',
    },
    {
      label: 'Completed',
      value: completedMatches.length,
      icon: CheckCircle,
      color: 'emerald',
    },
    {
      label: 'Available Pitches',
      value: pitches.filter((p) => p.status === 'active').length,
      icon: Users,
      color: 'slate',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 font-display">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, {user?.email}</p>
        </div>
        <button
          onClick={() => navigate('/matches/create')}
          className="flex items-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg transition"
        >
          <Plus size={20} />
          New Match
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const colorMap = {
            amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            slate: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
          };

          return (
            <div
              key={idx}
              className={`bg-slate-800 border ${colorMap[stat.color]} rounded-lg p-4 flex items-start justify-between animate-fade-in`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div>
                <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-slate-100 mt-2">{stat.value}</p>
              </div>
              <Icon size={24} className="opacity-50" />
            </div>
          );
        })}
      </div>

      {/* Calendar and Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar size={20} className="text-amber-400" />
              <h2 className="text-lg font-bold text-slate-100">Pitch Schedule</h2>
            </div>
            <CalendarView
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              matches={matches}
              pitches={pitches}
            />
          </div>
        </div>

        {/* Upcoming matches */}
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-4">Upcoming Matches</h3>
            {todayMatches.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No matches today</p>
            ) : (
              <div className="space-y-3">
                {todayMatches.slice(0, 5).map((match) => (
                  <div
                    key={match.id}
                    className="p-3 bg-slate-700/50 rounded border border-slate-600 hover:border-amber-400/50 transition cursor-pointer"
                  >
                    <div className="text-xs text-amber-400 font-mono mb-1">
                      {match.pitch_name} • {match.start_time}
                    </div>
                    <div className="text-sm text-slate-100">
                      <span className="font-semibold">{match.team_a_name}</span>
                      <span className="text-slate-500 mx-2">vs</span>
                      <span className="font-semibold">{match.team_b_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/matches')}
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700 rounded transition"
              >
                → View All Matches
              </button>
              <button
                onClick={() => navigate('/requests')}
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700 rounded transition"
              >
                → Match Requests
              </button>
              <button
                onClick={() => navigate('/teams')}
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700 rounded transition"
              >
                → Manage Teams
              </button>
              <button
                onClick={() => navigate('/players')}
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-amber-400 hover:bg-slate-700 rounded transition"
              >
                → Manage Players
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
