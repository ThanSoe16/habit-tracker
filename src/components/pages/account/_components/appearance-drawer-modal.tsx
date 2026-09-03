'use client';

import { Monitor, Moon, Palette, Rows3, Sparkles, Sun } from 'lucide-react';
import {
  AccentColor,
  InterfaceDensity,
  Theme,
  useUserStore,
} from '@/store/use-user-store';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldTitle,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface AppearanceDrawerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const THEME_OPTIONS: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: 'system', label: 'Use device setting', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

const ACCENT_OPTIONS: Array<{ value: AccentColor; label: string; swatch: string }> = [
  { value: 'orange', label: 'Sunset Orange', swatch: 'bg-orange-500' },
  { value: 'indigo', label: 'Focus Indigo', swatch: 'bg-indigo-500' },
  { value: 'emerald', label: 'Calm Emerald', swatch: 'bg-emerald-500' },
  { value: 'rose', label: 'Warm Rose', swatch: 'bg-rose-500' },
  { value: 'violet', label: 'Energy Violet', swatch: 'bg-violet-500' },
];

export function AppearanceDrawerModal({
  isOpen,
  onOpenChange,
}: AppearanceDrawerModalProps) {
  const { theme, setTheme, appearanceSettings, updateAppearanceSettings } = useUserStore();

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-lg">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2 font-black">
            <Palette className="text-primary" />
            Appearance
          </DrawerTitle>
          <DrawerDescription>
            Personalize the whole dashboard. Changes are applied immediately and saved to your
            profile.
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-2">
          <FieldGroup>
            <Field>
              <FieldContent>
                <FieldTitle>Color mode</FieldTitle>
                <FieldDescription>Follow your device or choose a permanent mode.</FieldDescription>
              </FieldContent>
              <Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
                <SelectTrigger className="w-full" aria-label="Color mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {THEME_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <Icon />
                          {option.label}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldContent>
                <FieldTitle>Accent color</FieldTitle>
                <FieldDescription>
                  Used for primary actions, navigation, focus rings and charts.
                </FieldDescription>
              </FieldContent>
              <Select
                value={appearanceSettings.accentColor}
                onValueChange={(value) =>
                  updateAppearanceSettings({ accentColor: value as AccentColor })
                }
              >
                <SelectTrigger className="w-full" aria-label="Accent color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ACCENT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={`size-3 rounded-full ${option.swatch}`} />
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldContent>
                <FieldTitle>Interface density</FieldTitle>
                <FieldDescription>
                  Compact mode fits more information on smaller screens.
                </FieldDescription>
              </FieldContent>
              <Select
                value={appearanceSettings.density}
                onValueChange={(value) =>
                  updateAppearanceSettings({ density: value as InterfaceDensity })
                }
              >
                <SelectTrigger className="w-full" aria-label="Interface density">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="comfortable">
                      <Sparkles /> Comfortable
                    </SelectItem>
                    <SelectItem value="compact">
                      <Rows3 /> Compact
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field orientation="horizontal" className="rounded-2xl border bg-muted/40 p-4">
              <FieldContent>
                <FieldTitle>Reduce motion</FieldTitle>
                <FieldDescription>
                  Minimizes transitions, animated effects and smooth scrolling.
                </FieldDescription>
              </FieldContent>
              <Switch
                checked={appearanceSettings.reduceMotion}
                onCheckedChange={(checked) =>
                  updateAppearanceSettings({ reduceMotion: checked })
                }
                aria-label="Reduce motion"
              />
            </Field>

            <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 text-card-foreground">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold">Live preview</span>
                <span className="text-xs text-muted-foreground">Your accent is active now.</span>
              </div>
              <Button type="button" size="sm">
                <Sparkles data-icon="inline-start" />
                Primary
              </Button>
            </div>
          </FieldGroup>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button type="button">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
