// src/components/ui/RouteLoader.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react';
import CastpointLoader from './loader';

export default function RouteLoader() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 400); // затримка для ефекту

    return () => clearTimeout(timeout);
  }, [pathname]);

  return loading ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <CastpointLoader />
    </div>
  ) : null;
}
