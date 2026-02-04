
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Business } from '../types';

interface StatsPanelProps {
  data: Business[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

export const StatsPanel: React.FC<StatsPanelProps> = ({ data }) => {
  const industryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(b => {
      const industry = b.primary_naics_description || 'Other';
      counts[industry] = (counts[industry] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: name.substring(0, 25) + (name.length > 25 ? '...' : ''), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [data]);

  const zipCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(b => {
      counts[b.zip_code] = (counts[b.zip_code] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Businesses</p>
          <p className="text-2xl font-bold text-slate-900">{data.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unique Industries</p>
          <p className="text-2xl font-bold text-slate-900">{new Set(data.map(d => d.naics)).size}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Top 5 Industries</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={industryCounts} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {industryCounts.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Zip Code Distribution</h3>
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={zipCounts}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {zipCounts.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {zipCounts.map((zip, idx) => (
                <div key={zip.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-slate-600">{zip.name} ({zip.value})</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
