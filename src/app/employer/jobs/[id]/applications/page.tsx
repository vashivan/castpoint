'use client'

import { use } from "react";
import MainLayout from "@/layouts/MainLayout";
import EmployerApplicationsList from "@/components/employer/EmployerApplicationsList";
import React from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <MainLayout>
      <EmployerApplicationsList jobId={Number(id)} />
    </MainLayout>
  )
};
