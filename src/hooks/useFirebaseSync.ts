import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { usePinterestContext } from '@/lib/context/PinterestContext';
import { toast } from 'sonner';

export function useFirebaseSync() {
  const { user } = useAuth();
  const initialized = useRef(false);
  const { initializeStore, cleanup } = usePinterestContext();

  useEffect(() => {
    if (user && !initialized.current) {
      const init = async () => {
        try {
          await initializeStore(user.uid);
          initialized.current = true;
          console.log('Firebase sync initialized for user:', user.uid);
        } catch (error) {
          console.error('Failed to initialize Firebase sync:', error);
          toast.error('Failed to start real-time updates');
        }
      };

      init();
    }

    return () => {
      if (initialized.current) {
        cleanup();
        initialized.current = false;
        console.log('Firebase sync cleaned up');
      }
    };
  }, [user?.uid, initializeStore, cleanup]);
}