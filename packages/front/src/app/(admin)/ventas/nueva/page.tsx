import { Suspense } from 'react';
import NuevaVentaClient from './nueva-venta-client';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense>
      <NuevaVentaClient />
    </Suspense>
  );
}
