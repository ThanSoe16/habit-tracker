import EditHabit from '@/components/pages/habits/detail/edit';

export default async function HabitEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditHabit id={id} />;
}
