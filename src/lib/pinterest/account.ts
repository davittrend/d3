import { auth } from '@/lib/firebase';
import { storage } from '@/lib/firebase/storage';
import { exchangePinterestCode, fetchPinterestBoards } from './api';
import { toast } from 'sonner';
import type { PinterestAccount } from '@/types/pinterest';

export async function connectPinterestAccount(code: string): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    toast.error('User not authenticated');
    throw new Error('User not authenticated');
  }

  console.log('Starting Pinterest account connection process');

  try {
    // Exchange code for token and user data
    const { token, user } = await exchangePinterestCode(code);
    console.log('Successfully exchanged Pinterest code for token');

    // Create new account object
    const newAccount: PinterestAccount = {
      id: user.username,
      user,
      token,
      lastRefreshed: Date.now(),
    };

    // Save account to Firebase
    const accountResult = await storage.accounts.save(userId, newAccount);
    if (!accountResult.success) {
      throw accountResult.error;
    }
    console.log('Saved Pinterest account to database');

    // Fetch and save boards
    const boards = await fetchPinterestBoards(token.access_token);
    const boardsResult = await storage.boards.save(userId, newAccount.id, boards);
    if (!boardsResult.success) {
      throw boardsResult.error;
    }
    console.log('Saved Pinterest boards to database');

    toast.success('Pinterest account connected successfully!');
  } catch (error) {
    console.error('Failed to connect Pinterest account:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to connect Pinterest account');
    throw error;
  }
}