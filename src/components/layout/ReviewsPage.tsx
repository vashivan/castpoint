'use client'

import styles from '../../styles/ReviewsPage.module.scss';
import { Button } from "../../components/ui/Button";
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import ReviewBox from './ReviewBox';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader, Search } from 'lucide-react';
import { Review } from '../../utils/Types';

const PAGE_SIZE = 12;

export default function ReviewsPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'write'>('view');
  const [page, setPage] = useState(1);

  const [formData, setFormData] = useState({
    company_name: '',
    position: user?.role || '',
    place_of_work: '',
    content: '',
  });

  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState('');

  // завантаження відгуків
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/get_reviews');
        const data = await res.json();
        if (!isMounted) return;

        const transformed: Review[] = data.map((u: Review) => ({
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

        setReviews(transformed);
      } catch (e) {
        alert(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // оновлюємо позицію за юзером (якщо зміниться)
  useEffect(() => {
    setFormData((p) => ({ ...p, position: user?.role || '' }));
  }, [user?.role]);

  // пошук (мемо)
  const q = search.trim().toLowerCase();
  const filteredReviews = useMemo(() => {
    if (!q) return reviews;
    return reviews.filter((u) => {
      const company = (u.company_name ?? '').toLowerCase();
      const place = (u.place_of_work ?? '').toLowerCase();
      const content = (u.content ?? '').toLowerCase();
      const position = (u.position ?? '').toLowerCase();
      const artist = (u.artist_name ?? '').toLowerCase();
      return (
        company.includes(q) ||
        place.includes(q) ||
        content.includes(q) ||
        position.includes(q) ||
        artist.includes(q)
      );
    });
  }, [reviews, q]);

  // скидаємо сторінку при зміні вкладки або фільтру
  useEffect(() => { setPage(1); }, [activeTab, filteredReviews.length]);

  // пагінація
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE));

  const pagedReviews = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredReviews.slice(start, start + PAGE_SIZE);
  }, [filteredReviews, page]);

  const pageWindow = useMemo(() => {
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, page - half);
    const end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  // анімація
  const stepVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  // хендлери
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
        body: JSON.stringify({ ...formData, artist_id: user?.id }),
      });

      if (res.ok) {
        alert('Review submitted!');
        setFormData({ company_name: '', position: user?.role || '', place_of_work: '', content: '' });

        // перезавантажити список і знову застосувати ту саму трансформацію
        setLoading(true);
        const fresh = await fetch('/api/get_reviews').then(r => r.json());
        const transformed: Review[] = fresh.map((u: Review) => ({
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
        setReviews(transformed);
        setActiveTab('view');
      } else {
        alert('Something went wrong.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  // якщо не авторизований — показуємо логін-підказку (перегляд можна дозволити за бажанням)
  if (!user) {
    return (
      <>
        {loading ? (
          <div className='min-h-screen flex justify-center items-center'>
            <Loader />
          </div>
        ) : (
          <div className="flex items-center text-center justify-center text-black text-2xl h-200">
            <p>
              Please
              <Link href="/login" className="text-orange-500 underline ml-1"> log in </Link>
              to leave a review.
            </p>
          </div>
        )}
      </>
    );
  }

  return (
    <main className="min-h-screen px-15 py-20 flex flex-col items-center justify-center text-center bg-transparent">
      <h1 className="text-4xl font-bold mb-10">Reviews</h1>

      {/* Перемикач вкладок */}
      <div className="w-full md:w-1/2 p-[2px] rounded-full bg-gradient-to-r from-[#AA0254] to-[#F5720D] mb-10">
        <div className="relative flex gap-0 rounded-full bg-white w-full h-full">
          <div
            className={`absolute top-[2px] left-[2px] h-[calc(100%-4px)] w-[calc(50%-4px)] rounded-full bg-orange-600 transition-transform duration-300 ease-in-out z-0 ${activeTab === 'write' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
              }`}
          />
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

      {/* Пошук */}
      {activeTab === 'view' && (
        <div className="relative w-full max-w-md mb-5">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            aria-label="Search reviews"
            placeholder="Search reviews, companies, places…"
            className="w-full border rounded-3xl py-2 pl-10 pr-10 bg-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      )}


      {/* Контент */}
      {loading && (
        <div className='min-h-screen flex justify-center items-center'>
          <Loader />
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'view' && !loading && (
          <>
            {/* список з анімацією по сторінках */}
            <motion.div
              key={`reviews-page-${page}-${q}`} // перерендер при зміні сторінки/пошуку
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              className={`space-y-6 ${styles.reviews_container}`}
            >
              {pagedReviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet.</p>
              ) : (
                pagedReviews.map((r) => <ReviewBox key={r.id} review={r} />)
              )}
            </motion.div>

            {/* пагінація */}
            {totalPages > 1 && (
              <nav className="mt-8 flex items-center gap-2 select-none" aria-label="Pagination">
                <button
                  className="px-3 py-1.5 rounded-xl border text-sm cursor-pointer disabled:opacity-40"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Prev
                </button>

                {/* перша сторінка */}
                {pageWindow[0] > 1 && (
                  <>
                    <button
                      className={`px-3 py-1.5 rounded-xl border text-sm cursor-pointer ${page === 1 ? 'bg-black text-white' : ''}`}
                      onClick={() => setPage(1)}
                    >
                      1
                    </button>
                    <span className="px-1 text-gray-400">…</span>
                  </>
                )}

                {/* центральне вікно */}
                {pageWindow.map((n) => (
                  <button
                    key={n}
                    className={`px-3 py-1.5 rounded-xl border text-sm cursor-pointer ${page === n ? 'bg-black text-white' : ''}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}

                {/* остання сторінка */}
                {pageWindow[pageWindow.length - 1] < totalPages && (
                  <>
                    <span className="px-1 text-gray-400">…</span>
                    <button
                      className={`px-3 py-1.5 rounded-xl border text-sm cursor-pointer ${page === totalPages ? 'bg-black text-white' : ''
                        }`}
                      onClick={() => setPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  className="px-3 py-1.5 rounded-xl border text-sm cursor-pointer disabled:opacity-40"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </nav>
            )}
          </>
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
            <input
              name="company_name"
              placeholder="Company name"
              className="w-full border rounded-3xl p-2 px-5 bg-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={formData.company_name}
              onChange={handleChange}
            />
            <input
              name="position"
              className="w-full border p-2 capitalize rounded-3xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={formData.position}
              onChange={handleChange}
            />
            <input
              name="place_of_work"
              placeholder="Place of work"
              className="w-full border p-2 px-5 rounded-3xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={formData.place_of_work}
              onChange={handleChange}
            />
            <textarea
              name="content"
              placeholder="Write a text..."
              rows={5}
              className="w-full border rounded-3xl p-5 bg-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={formData.content}
              onChange={handleChange}
            />
            <Button type="submit" className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-2 rounded-3xl cursor-pointer uppercase">
              Leave Review
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </main>
  );
}
