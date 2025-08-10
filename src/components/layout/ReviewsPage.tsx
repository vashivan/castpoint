'use client'

import styles from '../../styles/ReviewsPage.module.scss';
import { Button } from "../../components/ui/Button";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import ReviewBox from './ReviewBox';
import { AnimatePresence, motion, number } from 'framer-motion';
import { Loader } from 'lucide-react';

export default function ReviewsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'write'>('view');
  const [formData, setFormData] = useState({
    company_name: '',
    position: user?.role,
    place_of_work: '',
    content: '',
  });
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/get_reviews")
      .then((res) => res.json())
      .then((data) => {
        const transformedReviews = data.map((u: any) => ({
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
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
      });
  }, []);


  if (!user) {
    return (
      <>
        {loading ? (
          <div className='min-h-screen flex justify-center items-center'>
            <Loader />
          </div>
        ) : (
          <div className="flex items-center text-center justify-center text-black text-2xl h-200">
            <p>Please <Link href="/login" className="text-orange-500 underline ml-1">log in</Link> to leave a review.</p>
          </div>
        )}
      </>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/add_review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, artist_id: user.id }), // заміни artist_id динамічно
      });

      if (res.ok) {
        alert('Review submitted!');
        setFormData({ company_name: '', position: '', place_of_work: '', content: '' });
      } else {
        alert('Something went wrong.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting review');
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <main className="min-h-screen px-15 py-20 flex flex-col items-center justify-center text-center bg-transparent">
      <h1 className="text-4xl font-bold mb-10">Reviews</h1>

      <div className="w-full md:w-1/2 p-[2px] rounded-full bg-gradient-to-r from-[#AA0254] to-[#F5720D] mb-10">
        <div className="relative flex gap-0 rounded-full bg-white w-full h-full">
          {/* індикатор */}
          <div
            className={`absolute top-[2px] left-[2px] h-[calc(100%-4px)] w-[calc(50%-4px)] rounded-full bg-orange-600 transition-transform duration-300 ease-in-out z-0 ${activeTab === 'write' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
              }`}
          />

          {/* кнопки */}
          <Button
            variant="ghost"
            onClick={() => setActiveTab('view')}
            className={`cursor-pointer z-10 w-1/2 py-2 font-medium rounded-full ${activeTab === 'view' ? 'text-white' : 'text-black'
              }`}
          >
            LOOK REVIEWS
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('write')}
            className={`cursor-pointer z-10 w-1/2 py-2 font-medium rounded-full ${activeTab === 'write' ? 'text-white' : 'text-black'
              }`}
          >
            WRITE REVIEW
          </Button>
        </div>
      </div>


      {loading && (
        <div className='min-h-screen flex justify-center items-center'>
          <Loader />
        </div>
      )}
      <AnimatePresence mode="wait">
        {activeTab === 'view' && (
          <motion.div
            key="reviews"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
            className={`space-y-6 ${styles.reviews_container}`}
          >
            {reviews.map((r) => (
              <ReviewBox key={r.id} review={r} />
            ))}
          </motion.div>
        )}

        {activeTab === 'write' && (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl mx-auto space-y-4 p-4"
          >
            <input name="company_name" placeholder="Company name" className="w-full border rounded-3xl p-2 px-5 bg-white/70" value={formData.company_name} onChange={handleChange} />
            <input name="position" className="w-full border p-2 capitalize rounded-3xl bg-white/70" value={formData.position} onChange={handleChange} />
            <input name="place_of_work" placeholder="Place of work" className="w-full border p-2 px-5 rounded-3xl bg-white/70" value={formData.place_of_work} onChange={handleChange} />
            <textarea name="content" placeholder="Write a text..." rows={5} className="w-full border rounded-3xl p-5 bg-white/70" value={formData.content} onChange={handleChange} />
            <Button type="submit" className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-2 rounded-3xl cursor-pointer">
              Leave Review
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

    </main>
  );
}
