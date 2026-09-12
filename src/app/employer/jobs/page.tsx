'use client'

import MainLayout from "@/layouts/MainLayout";
import EmployerJobsList from "@/components/employer/EmployerJobsList";
import React from 'react';

export default function Page() {
  return (
    <MainLayout>
      <EmployerJobsList />
    </MainLayout>
  )
};
