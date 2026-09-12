'use client'

import MainLayout from "@/layouts/MainLayout";
import AdminJobsModeration from "@/components/employer/AdminJobsModeration";
import React from 'react';

export default function Page() {
  return (
    <MainLayout>
      <AdminJobsModeration />
    </MainLayout>
  )
};
