import { StateCreator } from 'zustand';
import type { AccountsSlice, Store } from '../types';

export const createAccountsSlice: StateCreator<Store, [], [], AccountsSlice> = (set) => ({
  accounts: [],
  selectedAccountId: null,
  
  setAccounts: (accounts) => set({ accounts }),
  setSelectedAccount: (accountId) => set({ selectedAccountId: accountId }),
  
  addAccount: (account) => set((state) => ({
    accounts: [...state.accounts, account],
    selectedAccountId: state.selectedAccountId || account.id
  })),
  
  removeAccount: (accountId) => set((state) => ({
    accounts: state.accounts.filter(a => a.id !== accountId),
    selectedAccountId: state.selectedAccountId === accountId
      ? state.accounts.find(a => a.id !== accountId)?.id || null
      : state.selectedAccountId
  }))
});