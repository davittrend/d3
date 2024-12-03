import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { database } from '../firebase/database';
import { ref, onValue, off } from 'firebase/database';
import { toast } from 'sonner';
import { createAccountsSlice } from './slices/accounts';
import { createBoardsSlice } from './slices/boards';
import { createStatusSlice } from './slices/status';
import type { Store } from './types';

export const useStore = create<Store>()(
  persist(
    (...args) => ({
      ...createAccountsSlice(...args),
      ...createBoardsSlice(...args),
      ...createStatusSlice(...args),

      initializeStore: async (userId: string) => {
        const [set, get] = args;
        const store = get();
        if (store.initialized) return;

        try {
          set({ loading: true, error: null });

          // Set up accounts listener
          const accountsRef = ref(database, `users/${userId}/accounts`);
          onValue(accountsRef, 
            (snapshot) => {
              const accounts = [];
              snapshot.forEach((child) => {
                accounts.push({
                  id: child.key,
                  ...child.val()
                });
              });
              store.setAccounts(accounts);
            },
            (error) => {
              console.error('Account sync error:', error);
              store.setError('Failed to sync accounts');
              toast.error('Failed to sync accounts');
            }
          );

          // Set up boards listener
          const boardsRef = ref(database, `users/${userId}/boards`);
          onValue(boardsRef,
            (snapshot) => {
              snapshot.forEach((child) => {
                store.setBoards(child.key!, child.val());
              });
            },
            (error) => {
              console.error('Boards sync error:', error);
              store.setError('Failed to sync boards');
              toast.error('Failed to sync boards');
            }
          );

          store.setInitialized(true);
          toast.success('Store initialized successfully');
        } catch (error) {
          console.error('Store initialization error:', error);
          store.setError('Failed to initialize store');
          toast.error('Failed to initialize store');
          throw error;
        } finally {
          store.setLoading(false);
        }
      },

      cleanup: () => {
        const [set, get] = args;
        const state = get();
        const userId = state.accounts[0]?.id;
        if (userId) {
          off(ref(database, `users/${userId}/accounts`));
          off(ref(database, `users/${userId}/boards`));
        }
        set({ initialized: false });
      }
    }),
    {
      name: 'pinterest-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedAccountId: state.selectedAccountId
      })
    }
  )
);

// Selector hooks
export const useAccounts = () => useStore(state => ({
  accounts: state.accounts,
  selectedAccountId: state.selectedAccountId,
  setSelectedAccount: state.setSelectedAccount,
  addAccount: state.addAccount,
  removeAccount: state.removeAccount
}));

export const useBoards = () => useStore(state => ({
  boards: state.boards,
  setBoards: state.setBoards,
  removeBoards: state.removeBoards
}));

export const useStatus = () => useStore(state => ({
  initialized: state.initialized,
  loading: state.loading,
  error: state.error,
  setError: state.setError
}));