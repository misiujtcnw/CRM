import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { LayoutDashboard, Users, UserPlus, Settings, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [leadsMenuOpen, setLeadsMenuOpen] = useState(false);
  const [selectedLeadFilter, setSelectedLeadFilter] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', name: 'Klienci', icon: Users },
    { id: 'leads', name: 'Leady', icon: UserPlus },
    { id: 'settings', name: 'Ustawienia', icon: Settings },
  ];

  const leadFilters = [
    { id: 'all', name: 'Wszystkie Leady', filter: null },
    { id: 'new', name: 'Nowe Leady', filter: 'new' },
    { id: 'no_answer', name: 'Nie Odebrał', filter: 'no_answer' },
    { id: 'appointment', name: 'Umówione Rozmowy', filter: 'appointment_scheduled' },
    { id: 'agreed', name: 'Zgodził Się', filter: 'agreed' },
    { id: 'not_interested', name: 'Nie Zainteresowany', filter: 'not_interested' },
  ];

  const getFilterLabel = (filter: string) => {
    const found = leadFilters.find(f => f.filter === filter);
    return found ? found.name : 'Wszystkie Leady';
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return (
          <div className="text-white text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Klienci</h2>
            <p className="text-slate-400">Sekcja w budowie</p>
          </div>
        );
      case 'leads':
        return (
          <div className="text-white text-center py-12">
            <h2 className="text-2xl font-bold mb-4">
              Leady {selectedLeadFilter && `- ${getFilterLabel(selectedLeadFilter)}`}
            </h2>
            <p className="text-slate-400">Sekcja w budowie</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-white text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Ustawienia</h2>
            <p className="text-slate-400">Sekcja w budowie</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Ładowanie...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

      <div className="relative flex h-screen">
        <aside className="w-72 p-6 backdrop-blur-xl bg-white/5 border-r border-white/10 shadow-2xl flex flex-col">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/channels4_profile-removebg-preview.png"
                alt="Shepherd CRM Logo"
                className="w-20 h-20 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Shepherd CRM
                </h1>
                <p className="text-xs text-slate-400">Premium Panel</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              if (item.id === 'leads') {
                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      onClick={() => {
                        setCurrentPage(item.id);
                        setLeadsMenuOpen(!leadsMenuOpen);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium flex-1 text-left">{item.name}</span>
                      {leadsMenuOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {leadsMenuOpen && (
                      <div className="ml-4 space-y-1 mt-2">
                        {leadFilters.map((filter) => (
                          <button
                            key={filter.id}
                            onClick={() => {
                              setCurrentPage('leads');
                              setSelectedLeadFilter(filter.filter);
                            }}
                            className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                              selectedLeadFilter === filter.filter
                                ? 'bg-white/10 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              filter.id === 'new' ? 'bg-green-400' :
                              filter.id === 'no_answer' ? 'bg-yellow-400' :
                              filter.id === 'appointment' ? 'bg-blue-400' :
                              filter.id === 'agreed' ? 'bg-emerald-400' :
                              filter.id === 'not_interested' ? 'bg-red-400' :
                              'bg-slate-400'
                            }`} />
                            <span>{filter.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-slate-400 mb-1">Zalogowany jako</p>
              <p className="text-sm text-white font-medium truncate">{user.email}</p>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-white/10 hover:border-red-500/30 transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Wyloguj się</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8">{renderPage()}</main>
      </div>
    </div>
  );
}

export default App;
