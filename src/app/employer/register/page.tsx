'use client'

import MainLayout from "@/layouts/MainLayout";
import EmployerRegisterForm from "@/components/employer/EmployerRegisterForm";
import React from 'react';

export default function Page() {
  return (
    <MainLayout>
      <EmployerRegisterForm />
    </MainLayout>
  )
};
