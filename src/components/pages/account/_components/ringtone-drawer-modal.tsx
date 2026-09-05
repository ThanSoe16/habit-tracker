'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Play } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { SettingsChoice } from '@/components/settings/settings-controls';
import { useUserStore, type RingtoneType } from '@/store/use-user-store';
import { playAlarmSound } from '@/hooks/use-reminders';
import { uploadMediaToStorage } from '@/features/media/services/supabase';

const options: { value: RingtoneType; label: string }[] = [
  { value: 'chime', label: 'Classic chime' },
  { value: 'marimba', label: 'Marimba' },
  { value: 'radar', label: 'Radar' },
  { value: 'digital', label: 'Digital' },
  { value: 'custom', label: 'Custom audio' },
];
export function RingtoneDrawerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { ringtone, customRingtoneUrl, setRingtone } = useUserStore();
  const [selected, setSelected] = useState(ringtone);
  const [customUrl, setCustomUrl] = useState(customRingtoneUrl);
  const [uploading, setUploading] = useState(false);
  const upload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('audio/') || file.size > 10 * 1024 * 1024) {
      toast.error('Choose an audio file smaller than 10 MB.');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadMediaToStorage(file, file.name);
      if (!url) throw new Error('Upload failed. Please retry.');
      setCustomUrl(url);
      setSelected('custom');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not upload audio.');
    } finally {
      setUploading(false);
    }
  };
  const playable = selected !== 'custom' || !!customUrl;
  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !uploading) onClose();
      }}
    >
      <DrawerContent className="mx-auto max-h-[90dvh] max-w-lg">
        <DrawerHeader>
          <DrawerTitle>Alarm ringtone</DrawerTitle>
          <DrawerDescription>Preview an alert sound, then save your choice.</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4">
          <FieldGroup>
            <SettingsChoice
              label="Sound"
              value={selected}
              onChange={setSelected}
              options={options}
            />
            <Button
              variant="outline"
              disabled={!playable || uploading}
              onClick={() => playAlarmSound(selected, customUrl)}
            >
              <Play data-icon="inline-start" />
              Preview sound
            </Button>
            {selected === 'custom' && (
              <Field>
                <FieldLabel htmlFor="ringtone-upload">Custom audio</FieldLabel>
                <Input
                  id="ringtone-upload"
                  type="file"
                  accept="audio/*"
                  disabled={uploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = '';
                    void upload(file);
                  }}
                />
                <FieldDescription>
                  {uploading
                    ? 'Uploading audio…'
                    : customUrl
                      ? 'Custom audio is ready to save.'
                      : 'Upload an audio file up to 10 MB.'}
                </FieldDescription>
              </Field>
            )}
          </FieldGroup>
        </div>
        <DrawerFooter>
          <Button
            disabled={!playable || uploading}
            onClick={() => {
              setRingtone(selected, customUrl);
              onClose();
            }}
          >
            Save ringtone
          </Button>
          <Button variant="outline" disabled={uploading} onClick={onClose}>
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
