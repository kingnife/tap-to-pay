import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConsumerProfile, TeamMember, UserRole } from '../types';
import { taplinkApi } from '../lib/api/taplinkApi';

export type AppView = 'landing' | 'consumer' | 'operator' | 'terminal_pos';

interface AuthContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  
  // Consumer Auth
  consumer: ConsumerProfile;
  isConsumerLoggedIn: boolean;
  loginAsConsumer: (consumerId: string) => void;
  logoutConsumer: () => void;
  
  // Operator Auth
  currentStaff: TeamMember | null;
  isOperatorLoggedIn: boolean;
  loginAsStaff: (memberId: string) => void;
  logoutOperator: () => void;
  hasOperatorPermission: (permission: string) => boolean;

  // Global Network state
  isNetworkOffline: boolean;
  toggleNetworkOffline: () => void;
  syncOfflineQueue: () => { syncedCount: number };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [consumer, setConsumer] = useState<ConsumerProfile>(taplinkApi.getActiveConsumer());
  const [isConsumerLoggedIn, setIsConsumerLoggedIn] = useState<boolean>(true);
  
  const [team, setTeam] = useState<TeamMember[]>(taplinkApi.getTeam());
  const [currentStaff, setCurrentStaff] = useState<TeamMember | null>(team[0] || null);
  const [isOperatorLoggedIn, setIsOperatorLoggedIn] = useState<boolean>(true);

  const [isNetworkOffline, setIsNetworkOffline] = useState<boolean>(taplinkApi.getIsNetworkOffline());

  useEffect(() => {
    const unsubscribe = taplinkApi.subscribe(() => {
      setConsumer(taplinkApi.getActiveConsumer());
      setTeam(taplinkApi.getTeam());
      setIsNetworkOffline(taplinkApi.getIsNetworkOffline());
    });
    return unsubscribe;
  }, []);

  const loginAsConsumer = (consumerId: string) => {
    taplinkApi.setActiveConsumer(consumerId);
    setConsumer(taplinkApi.getActiveConsumer());
    setIsConsumerLoggedIn(true);
  };

  const logoutConsumer = () => {
    setIsConsumerLoggedIn(false);
  };

  const loginAsStaff = (memberId: string) => {
    const member = taplinkApi.getTeam().find(m => m.id === memberId);
    if (member) {
      setCurrentStaff(member);
      setIsOperatorLoggedIn(true);
    }
  };

  const logoutOperator = () => {
    setIsOperatorLoggedIn(false);
    setCurrentStaff(null);
  };

  const hasOperatorPermission = (permission: string): boolean => {
    if (!currentStaff) return false;
    if (currentStaff.role === 'owner') return true;
    return currentStaff.permissions.includes('all') || currentStaff.permissions.includes(permission);
  };

  const toggleNetworkOffline = () => {
    const status = taplinkApi.toggleGlobalOffline();
    setIsNetworkOffline(status);
  };

  const syncOfflineQueue = () => {
    const result = taplinkApi.syncOfflineQueue();
    return { syncedCount: result.syncedCount };
  };

  return (
    <AuthContext.Provider
      value={{
        currentView,
        setCurrentView,
        consumer,
        isConsumerLoggedIn,
        loginAsConsumer,
        logoutConsumer,
        currentStaff,
        isOperatorLoggedIn,
        loginAsStaff,
        logoutOperator,
        hasOperatorPermission,
        isNetworkOffline,
        toggleNetworkOffline,
        syncOfflineQueue
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
