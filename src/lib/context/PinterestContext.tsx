import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../firebase';
import { toast } from 'sonner';
import type { PinterestAccount, PinterestBoard } from '@/types/pinterest';

interface PinterestContextType {
  accounts: PinterestAccount[];
  boards: Record<string, PinterestBoard[]>;
  selectedAccountId: string | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  setAccounts: (accounts: PinterestAccount[]) => void;
  setBoards: (accountId: string, boards: PinterestBoard[]) => void;
  setSelectedAccount: (accountId: string | null) => void;
  addAccount: (account: PinterestAccount) => void;
  removeAccount: (accountId: string) => void;
  removeBoards: (accountId: string) => void;
  setError: (error: string | null) => void;
  initializeStore: (userId: string) => Promise<void>;
  cleanup: () => void;
}

const PinterestContext = createContext<PinterestContextType | null>(null);

export function PinterestProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<PinterestAccount[]>([]);
  const [boards, setBoards] = useState<Record<string, PinterestBoard[]>>({});
  const [selectedAccountId, setSelectedAccount] = useState<string | null>(
    localStorage.getItem('selectedAccountId')
  );
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist selectedAccountId
  useEffect(() => {
    if (selectedAccountId) {
      localStorage.setItem('selectedAccountId', selectedAccountId);
    } else {
      localStorage.removeItem('selectedAccountId');
    }
  }, [selectedAccountId]);

  const addAccount = (account: PinterestAccount) => {
    setAccounts(prev => [...prev, account]);
    if (!selectedAccountId) {
      setSelectedAccount(account.id);
    }
  };

  const removeAccount = (accountId: string) => {
    setAccounts(prev => prev.filter(a => a.id !== accountId));
    if (selectedAccountId === accountId) {
      setSelectedAccount(accounts.find(a => a.id !== accountId)?.id || null);
    }
    removeBoards(accountId);
  };

  const updateBoards = (accountId: string, newBoards: PinterestBoard[]) => {
    setBoards(prev => ({
      ...prev,
      [accountId]: newBoards
    }));
  };

  const removeBoards = (accountId: string) => {
    setBoards(prev => {
      const { [accountId]: _, ...rest } = prev;
      return rest;
    });
  };

  const initializeStore = async (userId: string) => {
    if (initialized) return;

    try {
      setLoading(true);
      setError(null);

      // Set up accounts listener
      const accountsRef = ref(database, `users/${userId}/accounts`);
      onValue(accountsRef, 
        (snapshot) => {
          const accountsList: PinterestAccount[] = [];
          snapshot.forEach((child) => {
            accountsList.push({
              id: child.key!,
              ...child.val()
            });
          });
          setAccounts(accountsList);
        },
        (error) => {
          console.error('Account sync error:', error);
          setError('Failed to sync accounts');
          toast.error('Failed to sync accounts');
        }
      );

      // Set up boards listener
      const boardsRef = ref(database, `users/${userId}/boards`);
      onValue(boardsRef,
        (snapshot) => {
          const boardsData: Record<string, PinterestBoard[]> = {};
          snapshot.forEach((child) => {
            boardsData[child.key!] = child.val();
          });
          setBoards(boardsData);
        },
        (error) => {
          console.error('Boards sync error:', error);
          setError('Failed to sync boards');
          toast.error('Failed to sync boards');
        }
      );

      setInitialized(true);
      toast.success('Store initialized successfully');
    } catch (error) {
      console.error('Store initialization error:', error);
      setError('Failed to initialize store');
      toast.error('Failed to initialize store');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cleanup = () => {
    const userId = accounts[0]?.id;
    if (userId) {
      off(ref(database, `users/${userId}/accounts`));
      off(ref(database, `users/${userId}/boards`));
    }
    setInitialized(false);
  };

  return (
    <PinterestContext.Provider
      value={{
        accounts,
        boards,
        selectedAccountId,
        initialized,
        loading,
        error,
        setAccounts,
        setBoards: updateBoards,
        setSelectedAccount,
        addAccount,
        removeAccount,
        removeBoards,
        setError,
        initializeStore,
        cleanup
      }}
    >
      {children}
    </PinterestContext.Provider>
  );
}

export function usePinterestContext() {
  const context = useContext(PinterestContext);
  if (!context) {
    throw new Error('usePinterestContext must be used within a PinterestProvider');
  }
  return context;
}

// Selector hooks for specific slices of state
export function useAccounts() {
  const context = usePinterestContext();
  return {
    accounts: context.accounts,
    selectedAccountId: context.selectedAccountId,
    setSelectedAccount: context.setSelectedAccount,
    addAccount: context.addAccount,
    removeAccount: context.removeAccount
  };
}

export function useBoards() {
  const context = usePinterestContext();
  return {
    boards: context.boards,
    setBoards: context.setBoards,
    removeBoards: context.removeBoards
  };
}

export function useStatus() {
  const context = usePinterestContext();
  return {
    initialized: context.initialized,
    loading: context.loading,
    error: context.error,
    setError: context.setError
  };
}