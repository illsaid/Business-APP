
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Map as MapIcon, BarChart3, List, Filter, Info, Building2, ExternalLink, X, AlertCircle } from 'lucide-react';
import { fetchBusinesses } from './services/api';
import { Business } from './types';
import { MapContainer } from './components/MapContainer';
import { StatsPanel } from './components/StatsPanel';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZip, setSelectedZip] = useState<string>('All');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchBusinesses(5000);
        setAllBusinesses(data);
      } catch (err) {
        setError('Failed to load business data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredBusinesses = useMemo(() => {
    return allBusinesses.filter(biz => {
      const bizName = biz.business_name?.toLowerCase() || '';
      const dbaName = biz.dba_name?.toLowerCase() || '';
      const industry = biz.primary_naics_description?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();

      const matchesSearch = bizName.includes(search) ||
                          dbaName.includes(search) ||
                          industry.includes(search);
      
      const matchesZip = selectedZip === 'All' || biz.zip_code.startsWith(selectedZip);
      return matchesSearch && matchesZip;
    });
  }, [allBusinesses, searchTerm, selectedZip]);

  const handleBusinessClick = (biz: Business) => {
    setSelectedBusiness(biz);
    if (activeTab === 'list') setActiveTab('map');
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar - Desktop */}
      <aside className="w-80 lg:w-96 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col hidden md:flex">
        <header className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-200">
              <Building2 size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">LA Business Pulse</h1>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Hollywood & West Hollywood Hub
          </p>
        </header>

        <div className="p-4 space-y-4 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search names, DBAs, or industries..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm transition-all focus:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <select
                value={selectedZip}
                onChange={(e) => setSelectedZip(e.target.value)}
                className="w-full bg-slate-50 text-sm font-semibold rounded-xl pl-9 pr-3 py-2.5 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                >
                <option value="All">All Area Codes</option>
                <option value="90046">90046 (Hollywood)</option>
                <option value="90068">90068 (Hollywood Hills)</option>
                <option value="90069">90069 (West Hollywood)</option>
                </select>
            </div>
            <button 
                onClick={() => setShowStats(!showStats)}
                className={`px-3 rounded-xl border transition-all flex items-center justify-center ${showStats ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                title="Toggle Analytics"
            >
                <BarChart3 size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 bg-slate-50/50">
          {showStats ? (
            <div className="mt-4"><StatsPanel data={filteredBusinesses} /></div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{filteredBusinesses.length} Active Records</span>
              </div>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-4">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-sm font-medium animate-pulse">Syncing with LA Open Data...</p>
                </div>
              ) : filteredBusinesses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                    <AlertCircle size={40} className="text-slate-300 mb-4" />
                    <h3 className="text-sm font-bold text-slate-600 uppercase mb-1">No matching businesses</h3>
                    <p className="text-xs text-slate-400">Try adjusting your search or zip code filter.</p>
                    <button 
                        onClick={() => {setSearchTerm(''); setSelectedZip('All');}}
                        className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                        Reset All Filters
                    </button>
                </div>
              ) : filteredBusinesses.map((biz) => (
                <button
                  key={biz.location_account}
                  onClick={() => handleBusinessClick(biz)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    selectedBusiness?.location_account === biz.location_account
                      ? 'bg-white border-indigo-500 shadow-md scale-[1.02] ring-1 ring-indigo-500/10'
                      : 'bg-white border-slate-100 hover:border-indigo-300 hover:shadow-sm'
                  }`}
                >
                  <h3 className="font-bold text-slate-900 leading-tight mb-1 truncate">{biz.business_name}</h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-2 font-medium">
                    {biz.street_address} • {biz.zip_code}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <div className="px-2 py-0.5 bg-indigo-50 text-[9px] font-bold text-indigo-600 rounded-md uppercase tracking-wide">
                        {biz.primary_naics_description || 'General Business'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-white p-4 border-b border-slate-200 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <Building2 className="text-indigo-600" size={20} />
            <span className="font-bold text-lg tracking-tight">LA Biz Pulse</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab(activeTab === 'map' ? 'list' : 'map')} className="p-2 bg-slate-100 rounded-xl text-slate-600">
                {activeTab === 'map' ? <List size={20} /> : <MapIcon size={20} />}
            </button>
            <button onClick={() => setShowStats(!showStats)} className="p-2 bg-slate-100 rounded-xl text-slate-600">
                <BarChart3 size={20} />
            </button>
          </div>
        </header>

        {/* View Selection Toggle (Floating) */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] bg-white/90 backdrop-blur rounded-full shadow-xl border border-slate-200 p-1 hidden md:flex">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === 'map' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <MapIcon size={16} /> Map
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <List size={16} /> Explorer
          </button>
        </div>

        {/* Map View */}
        <div className={`flex-1 relative ${activeTab === 'map' ? 'block' : 'hidden md:block'}`}>
            <MapContainer 
                businesses={filteredBusinesses} 
                onMarkerClick={handleBusinessClick} 
                selectedBusiness={selectedBusiness} 
            />
            
            {/* Business Info Drawer / Card (Mobile & Overlay) */}
            {selectedBusiness && activeTab === 'map' && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 z-[1000] animate-in slide-in-from-bottom-4 fade-in">
                    <button 
                        onClick={() => setSelectedBusiness(null)}
                        className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                        <X size={18} />
                    </button>
                    <div className="flex gap-4 items-start">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 flex-shrink-0 shadow-inner">
                            <Building2 size={28} />
                        </div>
                        <div className="pr-8">
                            <h2 className="text-xl font-black text-slate-900 leading-tight">{selectedBusiness.business_name}</h2>
                            {selectedBusiness.dba_name && (
                                <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mt-1 italic">
                                    DBA: {selectedBusiness.dba_name.replace(/\|/g, ', ')}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-2 gap-y-5 gap-x-6">
                        <div>
                            <p className="text-[10px] uppercase font-black text-slate-300 tracking-widest mb-1">Location</p>
                            <p className="text-sm font-bold text-slate-700 leading-snug">{selectedBusiness.street_address}</p>
                            <p className="text-xs text-slate-400 font-medium">{selectedBusiness.city}, CA {selectedBusiness.zip_code}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-slate-300 tracking-widest mb-1">Classification</p>
                            <p className="text-sm font-bold text-slate-700 leading-snug">{selectedBusiness.primary_naics_description || 'General Business'}</p>
                            <p className="text-[10px] text-slate-400 font-mono">CODE: {selectedBusiness.naics}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-slate-300 tracking-widest mb-1">Council</p>
                            <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] font-black">LA</span>
                                District {selectedBusiness.council_district || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-slate-300 tracking-widest mb-1">Active Since</p>
                            <p className="text-sm font-bold text-slate-700">
                                {selectedBusiness.location_start_date ? new Date(selectedBusiness.location_start_date).toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'}) : 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                        <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedBusiness.business_name} ${selectedBusiness.street_address} ${selectedBusiness.zip_code}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                        >
                            Open in Maps <ExternalLink size={14} />
                        </a>
                        <button 
                            className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-colors active:scale-95"
                            onClick={() => setSelectedBusiness(null)}
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* List View (Mobile Explorer) */}
        <div className={`flex-1 overflow-y-auto p-4 md:hidden bg-slate-50 ${activeTab === 'list' ? 'block' : 'hidden'}`}>
             <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Search thousands of businesses..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-3xl focus:ring-2 focus:ring-indigo-500 text-sm shadow-xl shadow-slate-200/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="flex items-center justify-between mb-4 px-2">
                 <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{filteredBusinesses.length} Results</h2>
                 <button onClick={() => {setSearchTerm(''); setSelectedZip('All');}} className="text-[10px] font-black text-indigo-600 uppercase">Clear All</button>
            </div>

            <div className="space-y-4 pb-24">
                {filteredBusinesses.map(biz => (
                    <div 
                        key={biz.location_account} 
                        className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm active:scale-95 transition-transform" 
                        onClick={() => handleBusinessClick(biz)}
                    >
                        <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-slate-900 text-base leading-tight pr-4">{biz.business_name}</h3>
                             <div className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">#{biz.zip_code}</div>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">{biz.street_address}</p>
                        <div className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50/50 border border-indigo-100 inline-block px-3 py-1 rounded-xl">
                            {biz.primary_naics_description || 'General'}
                        </div>
                    </div>
                ))}
                
                {filteredBusinesses.length === 0 && !loading && (
                    <div className="py-20 text-center">
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No matching businesses found</p>
                    </div>
                )}
            </div>
        </div>

        {/* Global Stats Modal (Mobile) */}
        {showStats && (
            <div className="fixed inset-0 z-[2000] bg-white md:hidden overflow-y-auto animate-in slide-in-from-bottom flex flex-col">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                    <h2 className="text-lg font-black flex items-center gap-2">
                        <BarChart3 className="text-indigo-600" size={20} />
                        Analytics Dashboard
                    </h2>
                    <button onClick={() => setShowStats(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={28} />
                    </button>
                </div>
                <div className="p-6">
                    <StatsPanel data={filteredBusinesses} />
                </div>
            </div>
        )}
      </main>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-6 right-6 z-[3000] bg-rose-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm animate-in fade-in slide-in-from-right-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <AlertCircle size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm leading-tight">Sync Failure</p>
            <p className="text-xs opacity-90 mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:bg-white/10 rounded-full">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
