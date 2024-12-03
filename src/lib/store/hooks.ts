import { useStore } from './index';
import type { PinterestAccount, PinterestBoard } from '@/types/pinterest';

export function useSelectedAccount(): PinterestAccount | undefined {
  return useStore(state => 
    state.selectedAccountId 
      ? state.accounts.find(a => a.id === state.selectedAccountId)
      : undefined
  );
}

export function useAccountBoards(accountId: string | null): PinterestBoard[] {
  return useStore(state => 
    accountId ? state.boards[accountId] || [] : []
  );
}

export function useIsInitialized(): boolean {
  return useStore(state => state.initialized);
}

export function useIsLoading(): boolean {
  return useStore(state => state.loading);
}

export function useStoreError(): string | null {
  return useStore(state => state.error);
}