import HabitDetail from "@/components/pages/habits/detail";

export default async function HabitDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HabitDetail id={id} />;
}
