'use client'

import MainLayout from "@/layouts/MainLayout";
import EmployerDashboard from "@/components/employer/EmployerDashboard";
import React from 'react';

export default function Page() {
  return (
    <MainLayout>
      <EmployerDashboard />
    </MainLayout>
  )
};
