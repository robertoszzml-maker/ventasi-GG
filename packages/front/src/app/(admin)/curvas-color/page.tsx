import { CurvasColorTable } from '@/components/tables/curvas-color-table';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function CurvasColorPage() {
  return (
    <>
      <div className="flex items-center justify-between pb-4">
        <PageTitle title="Curvas de Color" />
        <Link href="/curvas-color/crear">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Crear
          </Button>
        </Link>
      </div>
      <CurvasColorTable />
    </>
  );
}
