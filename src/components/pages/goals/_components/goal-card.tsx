'use client';

import { CalendarDays, Check, ListPlus, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/shared/dialog/confirmation-dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { EditGoalValues, Goal, GoalSavingValues, GoalStatus } from '@/features/goals/types';
import { cn } from '@/utils/cn';
import { EditGoalForm } from './edit-goal-form';
import { GoalSavingsSection } from './goal-savings-section';

const statusLabels: Record<GoalStatus, string> = {
  idea: 'Idea',
  planning: 'Planning',
  in_progress: 'In progress',
  completed: 'Completed',
};

type GoalCardProps = {
  goal: Goal;
  onAddSubIdea: (goalId: string, text: string) => void;
  onToggleSubIdea: (goalId: string, subIdeaId: string) => void;
  onComplete: (goalId: string, note: string, energyScore: number) => void;
  onReopen: (goalId: string) => void;
  onDelete: (goalId: string) => void;
  onUpdateDetails: (goalId: string, values: EditGoalValues) => void;
  onAddSaving: (goalId: string, values: GoalSavingValues) => void;
  onStatusChange: (goalId: string, status: Exclude<GoalStatus, 'completed'>) => void;
};

export function GoalCard({
  goal,
  onAddSubIdea,
  onToggleSubIdea,
  onComplete,
  onReopen,
  onDelete,
  onUpdateDetails,
  onAddSaving,
  onStatusChange,
}: GoalCardProps) {
  const [subIdeaText, setSubIdeaText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [completionNote, setCompletionNote] = useState(goal.completionNote);
  const [energyScore, setEnergyScore] = useState(goal.energyScore ?? 5);

  const progress = useMemo(() => {
    if (goal.subIdeas.length === 0) return 0;
    return Math.round(
      (goal.subIdeas.filter((subIdea) => subIdea.isDone).length / goal.subIdeas.length) * 100,
    );
  }, [goal.subIdeas]);

  const addSubIdea = () => {
    onAddSubIdea(goal.id, subIdeaText);
    setSubIdeaText('');
  };

  const complete = () => {
    const note = completionNote.trim();
    if (!note) return;
    onComplete(goal.id, note, energyScore);
    setShowCompleteForm(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
          {statusLabels[goal.status]}
        </Badge>
        {goal.targetDate && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {goal.targetDate}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {isEditing && (
          <EditGoalForm
            goal={goal}
            onCancel={() => setIsEditing(false)}
            onSave={(values) => {
              onUpdateDetails(goal.id, values);
              setIsEditing(false);
            }}
          />
        )}

        {goal.places.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {goal.places.map((place) => (
              <Badge key={place} variant="outline">
                {place}
              </Badge>
            ))}
          </div>
        )}

        <GoalSavingsSection goal={goal} onAddSaving={onAddSaving} />

        <Separator />

        {goal.status !== 'completed' && (
          <ToggleGroup
            type="single"
            value={goal.status}
            onValueChange={(value) => {
              if (value && value !== 'completed') {
                onStatusChange(goal.id, value as Exclude<GoalStatus, 'completed'>);
              }
            }}
            variant="outline"
            size="sm"
            className="w-full flex-wrap justify-start"
          >
            <ToggleGroupItem value="idea">Idea</ToggleGroupItem>
            <ToggleGroupItem value="planning">Planning</ToggleGroupItem>
            <ToggleGroupItem value="in_progress">In progress</ToggleGroupItem>
          </ToggleGroup>
        )}

        <section className="flex flex-col gap-3" aria-label="Sub-ideas">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">Sub-ideas</p>
            <span className="text-xs font-medium text-muted-foreground">{progress}% ready</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {goal.subIdeas.length > 0 ? (
            <div className="flex flex-col gap-2">
              {goal.subIdeas.map((subIdea) => (
                <button
                  key={subIdea.id}
                  type="button"
                  onClick={() => onToggleSubIdea(goal.id, subIdea.id)}
                  className="flex w-full items-start gap-3 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                >
                  <span
                    className={cn(
                      'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
                      subIdea.isDone
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border',
                    )}
                    aria-hidden="true"
                  >
                    {subIdea.isDone && <Check className="size-3" />}
                  </span>
                  <span className={cn(subIdea.isDone && 'text-muted-foreground line-through')}>
                    {subIdea.text}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
              Add loose ideas, steps, links, or places here.
            </p>
          )}
        </section>

        {goal.status !== 'completed' && (
          <div className="flex gap-2">
            <Input
              value={subIdeaText}
              onChange={(event) => setSubIdeaText(event.target.value)}
              placeholder="Add another sub-idea"
              maxLength={160}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addSubIdea();
                }
              }}
            />
            <Button
              type="button"
              size="icon-lg"
              variant="outline"
              aria-label="Add sub-idea"
              onClick={addSubIdea}
            >
              <ListPlus />
            </Button>
          </div>
        )}

        {goal.status === 'completed' ? (
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-3">
            <p className="text-sm font-semibold text-foreground">Completion note</p>
            <p className="mt-1 text-sm text-muted-foreground">{goal.completionNote}</p>
            {goal.energyScore && (
              <p className="mt-2 text-xs font-semibold text-primary">
                Energy boost: {goal.energyScore}/5
              </p>
            )}
          </div>
        ) : showCompleteForm ? (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-3">
            <Textarea
              value={completionNote}
              onChange={(event) => setCompletionNote(event.target.value)}
              placeholder="I did it, and I want to remember..."
            />
            <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
              Energy boost
              <Input
                type="number"
                min={1}
                max={5}
                value={energyScore}
                showCharacterCount={false}
                onChange={(event) => setEnergyScore(Number(event.target.value))}
              />
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                className="flex-1"
                disabled={!completionNote.trim()}
                onClick={complete}
              >
                <Check data-icon="inline-start" />
                Save completion
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCompleteForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditing((editing) => !editing)}
          >
            <Pencil data-icon="inline-start" />
            Edit
          </Button>
          {goal.status === 'completed' ? (
            <Button type="button" variant="outline" size="sm" onClick={() => onReopen(goal.id)}>
              <RotateCcw data-icon="inline-start" />
              Reopen
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={() => setShowCompleteForm(true)}>
              <Check data-icon="inline-start" />
              Complete
            </Button>
          )}
          <Button type="button" variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 data-icon="inline-start" />
            Delete
          </Button>
        </div>
      </div>
      <ConfirmationDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete goal?"
        desc={`Delete "${goal.title}" and all of its ideas and saved money entries? This cannot be undone.`}
        confirmText="Delete goal"
        onPress={() => {
          onDelete(goal.id);
          setDeleteOpen(false);
        }}
      />
    </div>
  );
}
