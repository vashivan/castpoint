'use client'

import CastpointLoader from '../ui/loader';
import { useAuth } from '../../context/AuthContext';
import React from 'react';
import MainLayout from '../../layouts/MainLayout';

import dynamic from 'next/dynamic';
import AuthenticatedHome from './AuthenticatedHome';

const UserProfilePage = dynamic(() => import('./ProfilePage'), { ssr: false });


export default function HomePage() {
  const { user, isLogged, isLoading } = useAuth();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex flex-col items-center justify-center space-y-6 px-6 py-20 bg-gradient-to-tr from-purple-500 via-pink-400 to-orange-300">
          <CastpointLoader />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {isLogged && user ? (
        <AuthenticatedHome />
      ) : (
        <section className="min-h-screen px-6 py-20 flex flex-col items-center justify-center text-center bg-gradient-to-tr from-purple-500 via-pink-400 to-orange-300">
          <h1 className="text-5xl md:text-7xl font-bold tracking-wide bg-gradient-to-r from-pink-800 via-purple-400 to-orange-500 text-transparent bg-clip-text mb-8">
            Castpoint
            <hr className="my-4 border-white/20 mb-0" />
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold tracking-wide bg-gradient-to-r from-pink-800 via-purple-400 to-orange-500 text-transparent bg-clip-text mt-0 mb-8">
            Where Artists Find Direction
          </h2>

          <p className="max-w-3xl text-lg md:text-xl text-yellow-100/70 mb-12">
            We’re a collective of professional dancers and performers working around the globe. We know the hustle — auditions, contracts, travel, and the unknowns of each new job. That’s why we built Castpoint: a platform to help artists like us find work, share real experiences, and build a strong, supportive community.
          </p>

          <div className="max-w-4xl w-full text-left bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-xl space-y-6">
            <h2 className="text-3xl font-bold text-center text-yellow-100/70">About Us</h2>
            <p>
              We’re a team of artists — dancers, performers, and creatives — with years of experience working on international contracts.
            </p>
            <p>
              We’ve faced the chaos of searching for reliable gigs, navigating visa rules, dealing with dodgy employers, and figuring out life in foreign countries. So we decided to create Castpoint — a space made <em>by artists, for artists</em>.
            </p>
            <ul className="list-disc list-inside ml-5 space-y-1">
              <li>Find and apply for job opportunities</li>
              <li>Share reviews about employers and venues</li>
              <li>Connect with fellow artists worldwide</li>
              <li>Get insider tips and real-life hacks for working and living abroad</li>
            </ul>
            <p>
              Let’s make the performing world more transparent, supportive, and empowering.
            </p>
          </div>
        </section>
      )}
    </MainLayout>
  );
}
