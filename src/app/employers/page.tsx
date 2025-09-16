'use client'

import MainLayout from '../../layouts/MainLayout';
import WaitListForm from '../../components/layout/EmployersWaitingList';
import React from 'react';

export default function Page() {
  return (
    <MainLayout>
      <WaitListForm />
    </MainLayout>

  );
}