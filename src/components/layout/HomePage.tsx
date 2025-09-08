'use client'

import styles from '../../styles/Intro.module.scss';
import CastpointLoader from '../ui/loader';
import { useAuth } from '../../context/AuthContext';
import React from 'react';
import MainLayout from '../../layouts/MainLayout';
// import dynamic from 'next/dynamic';
import AuthenticatedHome from './AuthenticatedHome';
import Link from 'next/link';
import AboutSection from './AboutSection';
import WhyCastpoint from './WhyCastpoint';
import ReviewsCarousel from './ReviewsCarousel';

// const UserProfilePage = dynamic(() => import('./ProfilePage'), { ssr: false });


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
        <>        
        <div className={styles.intro}>
          <div className={styles.intro_header}>
            <div className={styles.intro_header_text}>
              <h1 className={styles.intro_header_text_1}>Where Artists</h1>
              <h1 className={styles.intro_header_text_2}>find direction</h1>
            </div>
          </div>
          <div className={styles.intro_img}></div>
          <button className={styles.intro_button}>
            <Link href="/signup">
              sign up
            </Link>
          </button>
        </div>
          <AboutSection />
          <WhyCastpoint />
          <div className={styles.couplepic}>
            <h1 className={styles.couplepic_text}>Let’s make the performing world more transparent, supportive, and empowering.</h1>
          </div>
          <ReviewsCarousel />
        </>
      )}
    </MainLayout>
  );
}
