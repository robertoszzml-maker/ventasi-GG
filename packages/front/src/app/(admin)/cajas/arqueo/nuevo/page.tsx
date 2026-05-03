import { Suspense } from 'react';
import NuevoArqueoClient from './nuevo-arqueo-client';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense>
      <NuevoArqueoClient />
    </Suspense>
  );
}
