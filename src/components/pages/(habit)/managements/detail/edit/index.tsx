'use client';
import { Flex } from '@radix-ui/themes';
import HabitEditForm from './_components/habit-edit-form';
import { useHabitDetail } from '@/features/habits/services/list-queries';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const EditHabit = ({ id }: { id: string }) => {
  const { data: habit, isPending, isError, refetch: fetchFromSupabase } = useHabitDetail(id);
  const isLoaded = !isPending;
  const loadError = isError ? 'Could not load the habit.' : null;
  if (!id.trim()) return <p>This habit is unavailable.</p>;
  if (!isLoaded) return <Skeleton className="h-32 w-full" aria-label="Loading habit" />;
  return (
    <Flex direction="column" gap="4">
      {loadError && (
        <Flex direction="column" gap="2">
          <p role="alert">
            {loadError} {habit && 'Your current form has been kept.'}
          </p>
          <Button
            onClick={() => {
              void fetchFromSupabase();
            }}
          >
            Retry
          </Button>
        </Flex>
      )}
      {habit ? (
        <HabitEditForm key={id} habit={habit} />
      ) : (
        !loadError && <p>This habit is unavailable.</p>
      )}
    </Flex>
  );
};
export default EditHabit;
