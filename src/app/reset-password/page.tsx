'use client'

// import MainLayout from '../../layouts/MainLayout';
import ResetPassword from '../../components/layout/ResetPassword';
import React from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string; email?: string };
}) {
  const token = typeof searchParams?.token === 'string' ? searchParams.token : '';
  const email = typeof searchParams?.email === 'string' ? searchParams.email : '';
  return <ResetPassword token={token} email={email} />;
}