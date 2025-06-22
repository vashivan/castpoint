'use client'

import VacanciesPage from '../../pages/VacanciesPage';
import React from 'react';
import ProvidersWrapper from '../ProvidersWrapper';

export default function Page() {
  return (
    <ProvidersWrapper>
      <VacanciesPage />
    </ProvidersWrapper>
  );
}
