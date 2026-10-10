import { identityRevision, assertIdentityRevision } from '@/lib/supabase/identity-scope';
import { nativeStorage } from '@/lib/native/sqlite-storage';
import { useNativeStatus } from '@/lib/native/status';
import { useGoalsStore } from '../store/use-goals-store';
import { emptyGoalsSnapshot, reconcileGoals, syncManualGoals } from './manual-sync';

export async function runNativeGoalsSync() {
  const status = useNativeStatus.getState();
  if (!status.userId || status.syncing || !useGoalsStore.getState().ready) return;
  const revision = identityRevision();
  useNativeStatus.setState({ syncing: true, syncError: null });
  try {
    if (!navigator.onLine) throw new Error('You are offline. Connect to sync your goals.');
    await nativeStorage.flush();
    assertIdentityRevision(revision);
    const state = useGoalsStore.getState();
    const submitted = { goals: state.goals, settings: state.settings };
    const remote = await syncManualGoals(
      status.userId,
      submitted,
      state.cloudSnapshot ?? emptyGoalsSnapshot,
    );
    assertIdentityRevision(revision);
    useGoalsStore.setState({
      ...reconcileGoals(useGoalsStore.getState(), submitted, remote),
      cloudSnapshot: { goals: remote.goals, settings: remote.settings },
      lastSyncedAt: new Date().toISOString(),
    });
    await nativeStorage.flush();
    assertIdentityRevision(revision);
  } catch {
    if (identityRevision() === revision) {
      useNativeStatus.setState({
        syncError: navigator.onLine
          ? 'Could not finish syncing. Your local changes are kept. Check your connection and sign-in, then retry.'
          : 'You are offline. Your local changes are kept.',
      });
    }
  } finally {
    if (identityRevision() === revision) useNativeStatus.setState({ syncing: false });
  }
}
