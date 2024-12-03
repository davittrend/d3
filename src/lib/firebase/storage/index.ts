import { FirebaseAccountStorage } from './accounts';
import { FirebaseBoardStorage } from './boards';
import type { DatabaseStorage } from './types';

class FirebaseStorage implements DatabaseStorage {
  private static instance: DatabaseStorage | null = null;
  
  private constructor() {
    this.accounts = new FirebaseAccountStorage();
    this.boards = new FirebaseBoardStorage();
  }

  public readonly accounts: FirebaseAccountStorage;
  public readonly boards: FirebaseBoardStorage;

  static getInstance(): DatabaseStorage {
    if (!this.instance) {
      this.instance = new FirebaseStorage();
    }
    return this.instance;
  }
}

export const storage = FirebaseStorage.getInstance();
export * from './types';