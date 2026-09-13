'use client'

import MainLayout from "@/layouts/MainLayout";
import Applications from "@/components/employer/Applications";
import React, { Suspense } from 'react';

export default function Page() {
  return (
    <MainLayout>
      <Suspense fallback={<div>Loading applications...</div>}>
        <Applications />
      </Suspense>
    </MainLayout>
  )
};
