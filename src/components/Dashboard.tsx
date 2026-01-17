import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Phone, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import type { Lead } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    noAnswer: 0,
    appointmentScheduled: 0,
    agreed: 0,
    notInterested: 0,
    totalClients: 0,
    totalTasks: 0,
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      const { count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      const { count: totalTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true });

      const allLeads = leads || [];

      setStats({
        totalLeads: totalLeads || 0,
        newLeads: allLeads.filter(l => l.status === 'new' && (l.call_status === 'pending' || !l.call_status)).length,
        noAnswer: allLeads.filter(l => l.call_status === 'no_answer').length,
        appointmentScheduled: allLeads.filter(l => l.call_status === 'appointment_scheduled').length,
        agreed: allLeads.filter(l => l.call_status === 'agreed').length,
        notInterested: allLeads.filter(l => l.call_status === 'not_interested').length,
        totalClients: totalClients || 0,
        totalTasks: totalTasks || 0,
      });

      setRecentLeads(allLeads);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl">Ładowanie...</div>
      </div>
    );
  }

  const statCards = [
    { title: 'Wszystkie Leady', value: stats.totalLeads, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { title: 'Nowe Leady', value: stats.newLeads, icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { title: 'Nie Odebrali', value: stats.noAnswer, icon: Phone, color: 'from-yellow-500 to-orange-500' },
    { title: 'Umówione Spotkania', value: stats.appointmentScheduled, icon: Clock, color: 'from-violet-500 to-purple-500' },
    { title: 'Zgody', value: stats.agreed, icon: CheckCircle, color: 'from-green-500 to-teal-500' },
    { title: 'Niezainteresowani', value: stats.notInterested, icon: XCircle, color: 'from-red-500 to-pink-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-slate-400">Witaj w Shepherd CRM</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={stat.title}
            className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300 animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-4xl font-bold text-white">{stat.value}</span>
            </div>
            <h3 className="text-sm font-medium text-slate-300">{stat.title}</h3>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Ostatnie Leady</h2>
        <div className="space-y-3">
          {recentLeads.length === 0 ? (
            <p className="text-slate-400 text-center py-4">Brak leadów</p>
          ) : (
            recentLeads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{lead.name}</h4>
                    {lead.phone && (
                      <p className="text-sm text-slate-400">{lead.phone}</p>
                    )}
                    {lead.category && (
                      <span className="inline-block mt-2 px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs">
                        {lead.category}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">
                      {new Date(lead.created_at).toLocaleDateString('pl-PL')}
                    </p>
                    {lead.call_status && (
                      <span
                        className={`inline-block mt-2 px-2 py-1 rounded-lg text-xs ${
                          lead.call_status === 'agreed'
                            ? 'bg-green-500/20 text-green-300'
                            : lead.call_status === 'not_interested'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}
                      >
                        {lead.call_status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
