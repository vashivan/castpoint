'use client'

import { use } from "react";
import MainLayout from "@/layouts/MainLayout";
import EmployerJobForm from "@/components/employer/EmployerJobForm";
import React from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <MainLayout>
      <EmployerJobForm jobId={Number(id)} />
    </MainLayout>
  )
};
