import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Filter, Search, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import type { Lead } from '../types';

type LeadFilter = 'all' | 'new' | 'no_answer' | 'appointment' | 'agreed' | 'not_interested';

interface LeadsProps {
  filter?: LeadFilter;
}

export default function Leads({ filter = 'all' }: LeadsProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [leads, filter, searchQuery]);

  const loadLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...leads];

    if (searchQuery) {
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.phone?.includes(searchQuery)
      );
    }

    switch (filter) {
      case 'new':
        filtered = filtered.filter(
          (l) => l.status === 'new' && (!l.call_status || l.call_status === 'pending')
        );
        break;
      case 'no_answer':
        filtered = filtered.filter((l) => l.call_status === 'no_answer');
        break;
      case 'appointment':
        filtered = filtered.filter((l) => l.call_status === 'appointment_scheduled');
        break;
      case 'agreed':
        filtered = filtered.filter((l) => l.call_status === 'agreed');
        break;
      case 'not_interested':
        filtered = filtered.filter((l) => l.call_status === 'not_interested');
        break;
    }

    setFilteredLeads(filtered);
  };

  const getFilterTitle = () => {
    switch (filter) {
      case 'all':
        return 'Wszystkie Leady';
      case 'new':
        return 'Nowe Leady';
      case 'no_answer':
        return 'Nie Odebrał';
      case 'appointment':
        return 'Umówiona Rozmowa';
      case 'agreed':
        return 'Zgodził Się';
      case 'not_interested':
        return 'Nie Jest Zainteresowany';
      default:
        return 'Leady';
    }
  };

  const getStatusBadge = (lead: Lead) => {
    const status = lead.call_status;
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: 'Oczekujący', className: 'bg-blue-500/20 text-blue-300' },
      no_answer: { label: 'Nie Odebrał', className: 'bg-yellow-500/20 text-yellow-300' },
      appointment_scheduled: { label: 'Umówiona Rozmowa', className: 'bg-violet-500/20 text-violet-300' },
      agreed: { label: 'Zgodził Się', className: 'bg-green-500/20 text-green-300' },
      not_interested: { label: 'Nie Jest Zainteresowany', className: 'bg-red-500/20 text-red-300' },
    };

    const config = statusMap[status || 'pending'] || statusMap.pending;
    return (
      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl">Ładowanie leadów...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-2">
            {getFilterTitle()}
          </h1>
          <p className="text-slate-400">
            Wyświetlono {filteredLeads.length} z {leads.length} leadów
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-medium hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-5 h-5" />
          Dodaj Lead
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Szukaj po nazwie, email, telefon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all">
          <Filter className="w-5 h-5" />
          Filtry
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-slate-400">Brak leadów do wyświetlenia</p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{lead.name}</h3>
                    {getStatusBadge(lead)}
                  </div>
                  {lead.category && (
                    <span className="inline-block px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-medium">
                      {lead.category}
                    </span>
                  )}
                </div>
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-medium hover:scale-105 transition-all">
                  Akcje
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lead.phone && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">{lead.phone}</span>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-4 h-4 text-violet-400" />
                    <span className="text-sm">{lead.email}</span>
                  </div>
                )}
                {lead.location && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span className="text-sm">{lead.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <span className="text-sm">
                    {new Date(lead.created_at).toLocaleDateString('pl-PL')}
                  </span>
                </div>
              </div>

              {lead.notes && (
                <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-slate-300">{lead.notes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
