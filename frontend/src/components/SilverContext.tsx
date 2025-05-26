import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.MODE === 'development'
  ? 'http://localhost:4000' // Backend port for local development
  : import.meta.env.VITE_API_URL || 'https://l4cy74gnlb.execute-api.us-east-1.amazonaws.com/Prod'; // Changed to VITE_API_URL

export interface SilverState {
  name: string;
  title: string;
  state: 'corrupted' | 'redeemed';
  appearance: {
    eyes: string;
    aura: string;
    form: string;
  };
  description: string;
  dialogue: {
    corrupted: string[];
    redeemed: string[];
  };
}

interface SilverContextType {
  silverState: SilverState;
  updateSilverState: (newState: 'corrupted' | 'redeemed') => void;
  absorbEmeralds: (emeralds: number) => Promise<any>;
  drainWords: (words: number) => Promise<any>;
}

const SilverContext = createContext<SilverContextType | undefined>(undefined);

export const SilverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [silverState, setSilverState] = useState<SilverState>({
    name: "Silver",
    title: "Princess of Wordvile",
    state: "corrupted",
    appearance: {
      eyes: "purple",
      aura: "dangerous purple mist",
      form: "ethereal, floating"
    },
    description: "A powerful being corrupted by Menchuba, capable of creating and draining words.",
    dialogue: {
      corrupted: [],
      redeemed: []
    }
  });

  useEffect(() => {
    // Fetch initial Silver state from backend
    const fetchSilverState = async () => {
      try {
        const response = await axios.get<Partial<SilverState>>(`${API_BASE}/silver/state`); // Add type for response data
        setSilverState(prevState => ({ ...prevState, ...response.data })); // Merge with prevState
      } catch (error) {
        console.error('Error fetching Silver state:', error);
      }
    };

    fetchSilverState();
  }, []);

  const updateSilverState = (newState: 'corrupted' | 'redeemed') => {
    setSilverState(prevState => ({ ...prevState, state: newState }));
    // Optionally, you might want to POST the state change to the backend here
    // Example: axios.post(`${API_BASE}/silver/state`, { state: newState });
  };

  const absorbEmeralds = async (emeralds: number) => {
    try {
      const response = await axios.post<SilverState>(`${API_BASE}/silver/absorb`, { emeralds }); // Expect SilverState in response
      if (response.data && response.data.name) { // Basic check for a valid SilverState object
        setSilverState(response.data);
      }
      return response.data;
    } catch (error) {
      console.error('Error absorbing emeralds:', error);
      throw error;
    }
  };

  const drainWords = async (words: number) => {
    try {
      const response = await axios.post<SilverState>(`${API_BASE}/silver/drain`, { words }); // Expect SilverState in response
      if (response.data && response.data.name) { // Basic check for a valid SilverState object
        setSilverState(response.data);
      }
      return response.data;
    } catch (error) {
      console.error('Error draining words:', error);
      throw error;
    }
  };

  return (
    <SilverContext.Provider value={{ silverState, updateSilverState, absorbEmeralds, drainWords }}>
      {children}
    </SilverContext.Provider>
  );
};

export const useSilver = () => {
  const context = useContext(SilverContext);
  if (!context) {
    throw new Error('useSilver must be used within a SilverProvider');
  }
  return context;
};
