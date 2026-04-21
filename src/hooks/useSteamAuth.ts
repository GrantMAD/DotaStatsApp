import { useContext } from 'react';
import { SteamAuthContext } from '../context/SteamAuthContext';

export const useSteamAuth = () => {
  const context = useContext(SteamAuthContext);
  if (context === undefined) {
    throw new Error('useSteamAuth must be used within a SteamAuthProvider');
  }
  return context;
};
