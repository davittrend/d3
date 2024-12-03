import { StateCreator } from 'zustand';
import type { BoardsSlice, Store } from '../types';

export const createBoardsSlice: StateCreator<Store, [], [], BoardsSlice> = (set) => ({
  boards: {},
  
  setBoards: (accountId, boards) => set((state) => ({
    boards: {
      ...state.boards,
      [accountId]: boards
    }
  })),
  
  removeBoards: (accountId) => set((state) => {
    const { [accountId]: _, ...rest } = state.boards;
    return { boards: rest };
  })
});