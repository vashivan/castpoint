// src/components/ui/RouteLoader.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
// import { useTransition } from 'react';

export default function RouteLoader() {
  const pathname = usePathname();
  // const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 400); // затримка для ефекту

    return () => clearTimeout(timeout);
  }, [pathname]);

  return loading ? (
    <div className="fixed inset-x-0 top-0 z-[60] h-1 animate-pulse bg-pink">
    </div>
  ) : null;
}
