'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import ReviewBox from './ReviewBox';
import { Review } from '../../utils/Types';

export default function AuthenticatedHome() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch("/api/get_reviews")
      .then((res) => res.json())
      .then((data) => {
        const transformedReviews = data.map((u: Review) => ({
          id: u.id,
          artist_id: u.artist_id,
          artist_name: u.artist_name,
          artist_instagram: u.artist_instagram,
          content: u.content,
          company_name: u.company_name,
          position: u.position,
          place_of_work: u.place_of_work,
          created_at: u.created_at,
        }));

        setReviews(transformedReviews);
      })
      .catch((error) => {
        alert(error);
      });
  }, []);

  const getLastN = <T,>(arr: T[]): T[] => {
    return arr.slice(0, 5);
  };

  const shortReviews = getLastN(reviews);

  // function cleanInstagramHandle(username: string): string {
  //   return username.trim().replace(/^@+/, '');
  // }

  const setAvatar = () => {
    const avatars = {
      1: '/default-avatar.png',
      2: '/default-avatar2.png',
      3: '/default-avatar3.png',
      4: '/default-avatar4.png',
      5: '/default-avatar5.png',
      6: '/default-avatar6.png',
      7: '/default-avatar7.png'
    };

    const randomIndex = Math.floor(Math.random() * Object.keys(avatars).length) + 1;
    return avatars[randomIndex as keyof typeof avatars]
  }


  return (
    <div className="min-h-screen px-15 py-20 bg-transparent text-black">
      <h2 className="text-3xl mb-10 text-center">Welcome back, {user?.name} 👋</h2>
      <div className="grid grid-cols-4 md:grid-cols-6 gap-6">

        {/* New Job Offers */}
        <div className="bg-white/70 border border-orange-500 rounded-2xl p-6 col-span-4 row-span-7 md:col-span-3">
          <h3 className="text-2xl font-semibold mb-3">🧾 New Job Offers</h3>
        </div>

        {/* Latest Blog Posts */}
        <div className="bg-white/70 border border-orange-500 rounded-2xl p-6 col-span-4 row-span-7 md:col-span-3">
          <h3 className="text-2xl font-semibold mb-3">📰 Latest Blog Posts</h3>
          <p className="text-white/70">Latest blog post previews here</p>
        </div>

        {/* Feedback on Applications */}
        <div className="bg-white/70 border border-orange-500 rounded-2xl p-6 col-span-4 md:col-span-2 row-span-5 max-h-120 overflow-scroll">
          <h3 className="text-xl font-semibold mb-2">💬 Latest feedback</h3>
          <ol className="flex flex-col gap-4">
            {shortReviews.map((r) => (
              <ReviewBox key={r.id} review={r} />
            ))}
          </ol>
          <button className='mt-auto text-center bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-2 rounded-3xl cursor-pointer w-full'>
            <Link href="/reviews">View all</Link>
          </button>
        </div>

        {/* Go to Profile */}
        <div className="bg-white/70 border border-orange-500 text-black rounded-2xl p-6 col-span-4 md:col-span-2 row-span-5 flex flex-col justify-between w-full max-h-120 overflow-y-scroll">
          <h3 className="text-xl font-bold mb-4">👤 My Profile</h3>
          <div className="flex flex-col items-center">
            <h1 className='text-2xl'>{`${user?.first_name} ${user?.second_name}`}</h1>
            <h2>{user?.country}</h2>
            <img
              src={user?.pic_url || setAvatar()}
              alt="Profile"
              className="object-cover h-40 w-40 my-3 rounded-xl"
            />
            <p className='my-3 text-justify'>{user?.biography}</p>
            <p className='my-3 text-justify'>{user?.experience}</p>
          </div>
          <a
            href="/profile"
            className="mt-auto text-center bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-2 rounded-3xl cursor-pointer w-full"
          >
            View Profile
          </a>
        </div>

        <div className="bg-white/70 border border-orange-500 text-black rounded-2xl p-6 col-span-4 md:col-span-2 row-span-5 flex flex-col justify-between w-full max-h-120">
          <h3 className="text-xl font-bold mb-4">My applications</h3>
        </div>
      </div>
    </div>
  );
}
