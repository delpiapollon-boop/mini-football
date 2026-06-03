import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';

const CalendarView = ({ selectedDate, onDateChange, matches, pitches }) => {
  const date = new Date(selectedDate);
  const weekStart = startOfWeek(date);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const timeSlots = [
    { label: '6:30 PM', time: '18:30' },
    { label: '7:30 PM', time: '19:30' },
    { label: '8:30 PM', time: '20:30' },
    { label: '9:30 PM', time: '21:30' },
    { label: '10:00 PM', time: '22:00' },
  ];

  const getMatchForSlot = (pitch, dayDate, timeSlot) => {
    return matches.find(
      (m) =>
        m.pitch_id === pitch.id &&
        m.match_date === dayDate.toISOString().split('T')[0] &&
        m.start_time === timeSlot.time
    );
  };

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onDateChange(format(addDays(date, -7), 'yyyy-MM-dd'))}
          className="p-2 hover:bg-slate-700 rounded transition"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="font-mono text-sm text-slate-300">
          {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </span>
        <button
          onClick={() => onDateChange(format(addDays(date, 7), 'yyyy-MM-dd'))}
          className="p-2 hover:bg-slate-700 rounded transition"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="w-20 text-left px-2 py-2 text-slate-400 font-mono text-xs">
                Time
              </th>
              {weekDays.map((day, idx) => (
                <th key={idx} className="px-2 py-2 text-center">
                  <div className="text-slate-400 font-mono text-xs">
                    {format(day, 'EEE')}
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      day.toISOString().split('T')[0] === selectedDate
                        ? 'text-amber-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, slotIdx) => (
              <tr key={slotIdx} className="border-t border-slate-700">
                <td className="px-2 py-3 text-slate-400 font-mono text-xs">
                  {slot.label}
                </td>
                {weekDays.map((day, dayIdx) => {
                  const dayStr = day.toISOString().split('T')[0];
                  const cellMatches = matches.filter(
                    (m) => m.pitch_id && m.match_date === dayStr && m.start_time === slot.time
                  );

                  return (
                    <td key={dayIdx} className="px-2 py-3">
                      {cellMatches.length === 0 ? (
                        <div className="text-xs text-slate-600 text-center">—</div>
                      ) : (
                        <div className="space-y-1">
                          {cellMatches.map((match) => (
                            <div
                              key={match.id}
                              className={`px-2 py-1 rounded text-xs font-mono truncate ${
                                match.status === 'confirmed'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : match.status === 'pending_acceptance'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                              title={`${match.team_a_name} vs ${match.team_b_name}`}
                            >
                              {match.pitch_name}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CalendarView;
