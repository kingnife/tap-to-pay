import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { LandingPage } from './components/landing/LandingPage';
import { ConsumerApp } from './components/consumer/ConsumerApp';
import { OperatorDashboard } from './components/operator/OperatorDashboard';
import { TerminalSimulator } from './components/terminal/TerminalSimulator';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView } = useAuth();

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col font-sans antialiased selection:bg-[#FACC15] selection:text-slate-950">
      {/* Universal Taplink Bento Header */}
      <Header />

      {/* Dynamic View Router */}
      <main className="flex-1 pb-12">
        {currentView === 'landing' && (
          <LandingPage
            onExploreConsumer={() => setCurrentView('consumer')}
            onExploreOperator={() => setCurrentView('operator')}
          />
        )}

        {currentView === 'consumer' && <ConsumerApp />}

        {currentView === 'operator' && <OperatorDashboard />}

        {currentView === 'terminal_pos' && <TerminalSimulator />}
      </main>

      {/* Global Bento Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 sm:px-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono font-bold text-slate-800">Taplink Core Engine v3.4.1 (ISO/IEC 14443-A)</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <span className="text-slate-600">Lagos BRT & Metro Corridors • Nigerian Campuses</span>
            <span className="text-slate-600">Licensed Switch Clearing (NIBSS, Interswitch)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
