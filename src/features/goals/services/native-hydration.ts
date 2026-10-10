import {
  partitionIdentityStores,
  setIdentityScope,
  identityRevision,
} from '@/lib/supabase/identity-scope';
import { partitionStore } from '@/lib/supabase/partition-store';
import { useNativeStatus } from '@/lib/native/status';
import { useGoalsStore } from '../store/use-goals-store';

let hydrationGeneration = 0;

export async function hydrateNativeGoals(userId: string | null) {
  const generation = ++hydrationGeneration;
  setIdentityScope(userId);
  const revision = identityRevision();
  useNativeStatus.setState({
    userId,
    loading: true,
    syncing: false,
    syncError: null,
    hydrationError: false,
  });
  let hydration: void | Promise<void> = undefined;
  partitionIdentityStores(() => {
    // Rehydrate signed-out state too, cancelling any older account's pending hydration.
    hydration = partitionStore(useGoalsStore, `native-goals:${userId ?? 'signed-out'}`, true);
  });
  await hydration;
  if (generation !== hydrationGeneration || revision !== identityRevision()) return;
  if (userId && !useNativeStatus.getState().hydrationError) {
    useGoalsStore.setState({ ready: true });
  }
  useNativeStatus.setState({ loading: false });
}
