import React from "react";
import { Clock, Pencil } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface HabitReminderProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  time: string;
}

export const HabitReminder: React.FC<HabitReminderProps> = ({
  enabled,
  setEnabled,
  time,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-gray-800 text-[15px] font-bold">
          Set Reminder
        </Label>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          className="data-[state=checked]:bg-primary"
        />
      </div>

      {enabled && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[15px] font-bold text-gray-700">{time}</span>
          </div>
          <button type="button" className="text-gray-400">
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
