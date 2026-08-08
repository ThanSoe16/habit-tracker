import EditGymProfilePage from '@/components/pages/(workout)/managements/edit-personal-info';
import { Suspense } from 'react';

export default function EditPersonalInfoPageRoute() {
  return (
    <Suspense>
      <EditGymProfilePage />
    </Suspense>
  );
}
