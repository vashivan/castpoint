'use client'

import MainLayout from '../../layouts/MainLayout';
import RegistrationPage from '../../components/layout/RegistrationPage';
import React from 'react';
import RegistrationDesktop from '../../components/layout/RegistrationDesktop';

export default function Page() {
  return (
    <MainLayout>
      <>
        <div className="hidden lg:block">
          <RegistrationDesktop />
        </div>
        <div className="block lg:hidden">
          <RegistrationPage />
        </div>
      </>
    </MainLayout>
  );
}
