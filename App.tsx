import React, { useState, useRef, useEffect } from 'react';
import { Settings, Mic, MicOff, Play, Square, Headphones, Activity, Globe, MessageSquare, AlertCircle, RefreshCw, ChevronLeft, Lock, Key, ArrowRight, ShieldCheck } from 'lucide-react';
import { Language, SessionConfig, MessageLog } from './types';
import { useLiveTranslator } from './hooks/useLiveTranslator';
import { Visualizer } from './components/Visualizer';

// ALEA Brand Color
const ALEA_RED = '#EC1D24';
const ACCESS_PIN = "1409";

const App: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [authError, setAuthError] = useState(false);
  
  // App Config State
  const [userApiKey, setUserApiKey] = useState("");
  const [isSetup, setIsSetup] = useState(true);
  const [config, setConfig] = useState<SessionConfig>({
    languageA: Language.ITALIAN,
    languageB: Language.ENGLISH,
    splitAudio: false
  });
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Load API Key from local storage if available
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setUserApiKey(storedKey);
    }
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ACCESS_PIN) {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
      setPinInput("");
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setUserApiKey(newVal);
    localStorage.setItem('gemini_api_key', newVal);
  };

  const handleTranscription = (text: string, isUser: boolean) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      source: isUser ? 'user' : 'ai',
      text,
      timestamp: new Date()
    }]);
  };

  const { 
    connect, 
    disconnect, 
    connectionState, 
    isMuted, 
    toggleMute, 
    volume,
    errorMessage
  } = useLiveTranslator({
    languageA: config.languageA,
    languageB: config.languageB,
    splitAudio: config.splitAudio,
    onTranscription: handleTranscription,
    apiKey: userApiKey
  });

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleStartSession = () => {
    setIsSetup(false);
    connect();
  };

  const handleStopSession = () => {
    disconnect();
    setIsSetup(true);
    setLogs([]);
  };

  const handleRetry = () => {
    disconnect();
    connect();
  };

  // 1. PIN Authentication Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white text-slate-900 relative overflow-hidden">
        {/* Subtle Red background element */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#EC1D24] opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="max-w-xs w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-2xl z-10 flex flex-col items-center">
          <div className="p-4 bg-red-50 rounded-full mb-6">
            <Lock className="w-8 h-8 text-[#EC1D24]" />
          </div>
          <h2 className="text-xl font-bold mb-2">ALEA Safe</h2>
          <p className="text-slate-500 text-sm mb-6 text-center">Inserisci codice di accesso</p>
          
          <form onSubmit={handlePinSubmit} className="w-full space-y-4">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className={`w-full bg-gray-50 border ${authError ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-center text-2xl tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#EC1D24] transition-all`}
              placeholder="••••"
              autoFocus
            />
            {authError && <p className="text-[#EC1D24] text-xs text-center">Codice errato</p>}
            
            <button 
              type="submit"
              className="w-full bg-[#EC1D24] hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-200"
            >
              Sblocca <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Configuration & Setup Screen
  if (isSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white text-slate-900 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#EC1D24] opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#EC1D24] opacity-5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-8 shadow-2xl z-10">
          
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#EC1D24] flex items-center justify-center shadow-lg shadow-red-200">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">ALEA Translate</h1>
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Configurazione Interprete</p>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Language Selection */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                  <Globe className="w-4 h-4" /> Speaker A (Input)
                </label>
                <select 
                  value={config.languageA}
                  onChange={(e) => setConfig({...config, languageA: e.target.value as Language})}
                  className="w-full bg-white text-slate-900 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#EC1D24]"
                >
                  {Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                <div className="bg-white border border-gray-200 p-2 rounded-full shadow-sm text-slate-400">
                  <RefreshCw className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
                  <Globe className="w-4 h-4" /> Speaker B (Translation)
                </label>
                <select 
                  value={config.languageB}
                  onChange={(e) => setConfig({...config, languageB: e.target.value as Language})}
                  className="w-full bg-white text-slate-900 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#EC1D24]"
                >
                  {Object.values(Language).filter(l => l !== config.languageA).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* API Key */}
            <div className="pt-2">
               <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                 <Key className="w-3 h-3" /> Gemini API Key
               </label>
               <input 
                  type="password"
                  value={userApiKey}
                  onChange={handleApiKeyChange}
                  placeholder="Paste your API key here..."
                  className="w-full bg-gray-50 border border-gray-200 text-slate-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EC1D24]"
               />
               <p className="text-[10px] text-slate-400 mt-1">Leave empty if using environment variable.</p>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartSession}
              disabled={!userApiKey && !process.env.API_KEY}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95 ${
                !userApiKey && !process.env.API_KEY 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#EC1D24] hover:bg-red-700 text-white shadow-red-200'
              }`}
            >
              <Mic className="w-5 h-5" /> Start Interpretation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Active Session Screen
  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button onClick={handleStopSession} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-slate-500 transition-colors">
               <ChevronLeft className="w-5 h-5" />
             </button>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#EC1D24] animate-pulse"></div>
               <span className="font-bold text-slate-900 tracking-tight">ALEA Live</span>
             </div>
          </div>

          <div className="flex items-center gap-2">
             <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
               connectionState === 'connected' ? 'bg-green-50 text-green-700 border-green-200' :
               connectionState === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
               'bg-yellow-50 text-yellow-700 border-yellow-200'
             }`}>
               {connectionState === 'connected' ? 'Active' : connectionState}
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col relative overflow-hidden">
        
        {/* FIXED Visualizer & Status Area */}
        <div className="flex-shrink-0 bg-white p-4 border-b border-gray-100 z-20 shadow-sm">
           {/* Languages Display */}
           <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-3 text-sm text-slate-900 font-semibold">
                 <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-gray-200 text-[#EC1D24]">
                      <span className="text-xs">A</span>
                   </div>
                   <span>{config.languageA}</span>
                 </div>
                 <ArrowRight className="w-4 h-4 text-gray-300" />
                 <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-gray-200 text-[#EC1D24]">
                      <span className="text-xs">B</span>
                   </div>
                   <span>{config.languageB}</span>
                 </div>
              </div>
              
              <button 
                onClick={toggleMute}
                className={`p-2 rounded-full transition-all ${
                  isMuted 
                    ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                    : 'bg-white text-slate-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
           </div>

           {/* Audio Wave */}
           <Visualizer isActive={connectionState === 'connected' && !isMuted} volume={volume} color={ALEA_RED} />
           
           {/* Error Banner (Fixed if visible) */}
           {errorMessage && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMessage}</span>
              </div>
              <button onClick={handleRetry} className="text-xs bg-white border border-red-200 px-3 py-1 rounded hover:bg-red-50 font-semibold">
                Retry
              </button>
            </div>
          )}
        </div>

        {/* SCROLLABLE Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 relative bg-slate-50">
           {/* Gradient Mask to fade top messages */}
           <div className="fixed left-0 right-0 h-8 bg-gradient-to-b from-slate-50 to-transparent pointer-events-none z-10" style={{top: 'calc(16rem)'}}></div>

           <div className="space-y-4 pb-4 max-w-5xl mx-auto">
             {logs.length === 0 && (
               <div className="h-64 flex flex-col items-center justify-center text-slate-400 opacity-60">
                 <MessageSquare className="w-12 h-12 mb-2 text-gray-300" />
                 <p className="text-sm">Conversation will appear here...</p>
               </div>
             )}
             
             {logs.map((log) => (
               <div key={log.id} className={`flex flex-col ${log.source === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                 <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
                   log.source === 'user' 
                     ? 'bg-[#EC1D24] text-white rounded-br-none' 
                     : 'bg-white text-slate-800 border border-gray-200 rounded-bl-none'
                 }`}>
                   <p className="text-sm leading-relaxed">{log.text}</p>
                 </div>
                 <span className={`text-[10px] mt-1 mx-1 font-medium ${log.source === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>
                   {log.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </span>
               </div>
             ))}
             <div ref={logsEndRef} />
           </div>
        </div>

      </main>
    </div>
  );
};

export default App;