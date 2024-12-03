import type { PinterestAccount, PinterestBoard } from '@/types/pinterest';

export interface AccountsSlice {
  accounts: PinterestAccount[];
  selectedAccountId: string | null;
  setAccounts: (accounts: PinterestAccount[]) => void;
  setSelectedAccount: (accountId: string | null) => void;
  addAccount: (account: PinterestAccount) => void;
  removeAccount: (accountId: string) => void;
}

export interface BoardsSlice {
  boards: Record<string, PinterestBoard[]>;
  setBoards: (accountId: string, boards: PinterestBoard[]) => void;
  removeBoards: (accountId: string) => void;
}

export interface StatusSlice {
  initialized: boolean;
  loading: boolean;
  error: string | null;
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface Store extends AccountsSlice, BoardsSlice, StatusSlice {
  initializeStore: (userId: string) => Promise<void>;
  cleanup: () => void;
}