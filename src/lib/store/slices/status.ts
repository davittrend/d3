import { StateCreator } from 'zustand';
import type { StatusSlice, Store } from '../types';

export const createStatusSlice: StateCreator<Store, [], [], StatusSlice> = (set) => ({
  initialized: false,
  loading: false,
  error: null,
  
  setInitialized: (initialized) => set({ initialized }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
});