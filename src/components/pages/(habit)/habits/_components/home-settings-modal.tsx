'use client';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { HabitPreferences } from '@/components/settings/habit-preferences';
import { SettingsLoading, SettingsSaveStatus } from '@/components/settings/settings-controls';
import { useUserStore } from '@/store/use-user-store';

export function HomeSettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const isLoaded = useUserStore((state) => state.isLoaded);
  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent className="mx-auto max-h-[90dvh] max-w-lg">
        <DrawerHeader>
          <DrawerTitle>Habit view settings</DrawerTitle>
          <DrawerDescription>Customize the layout of your habit home page.</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4">
          <SettingsSaveStatus />
          {isLoaded ? (
            <FieldGroup className="py-4">
              <HabitPreferences />
            </FieldGroup>
          ) : (
            <SettingsLoading />
          )}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
