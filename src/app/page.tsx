'use client'

import dynamic from 'next/dynamic';

const HomePage = dynamic(() => import('../components/layout/HomePage'), { ssr: false }); // 


export default function Page() {
  return (
    <HomePage />
  )
}
