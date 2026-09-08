'use client';
import { Flex } from '@radix-ui/themes';
import HabitEditForm from './_components/habit-edit-form';
import { useHabitStore } from '@/store/use-habit-store';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const EditHabit = ({ id }: { id: string }) => {
  const { habits, isLoaded, loadError, fetchFromSupabase } = useHabitStore();
  if (!id.trim()) return <p>This habit is unavailable.</p>;
  if (!isLoaded) return <Skeleton className="h-32 w-full" aria-label="Loading habit" />;
  const habit = habits.find((item) => item.id === id);
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
