'use client';

import React, { useEffect, useMemo, useState } from 'react';
import styles from '../../styles/ReviewCarousel.module.scss';
import ReviewBox from './ReviewBox';
import Image from 'next/image';
import Link from 'next/link';
import { Review } from '../../utils/Types';

export default function ReviewsCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const newReviews = reviews.slice(0, 6);
  const [itemsPerView, setItemsPerView] = useState<number>(1);
  const [page, setPage] = useState<number>(0);

  // fetch
  useEffect(() => {
    fetch('/api/get_reviews')
      .then((r) => r.json())
      .then((data: Review[]) => setReviews(data))
      .catch((e) => alert(e));
  }, []);

  // responsive items per view
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w >= 980) return setItemsPerView(3);
      if (w >= 678) return setItemsPerView(2);
      return setItemsPerView(1);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // chunk into pages
  const pages = useMemo(() => {
    const out: Review[][] = [];
    for (let i = 0; i < newReviews.length; i += itemsPerView) {
      out.push(newReviews.slice(i, i + itemsPerView));
    }
    // якщо відгуків мало — принаймні одна сторінка
    return out.length ? out : [[]];
  }, [newReviews, itemsPerView]);

  // нормалізуємо page при зміні pages
  useEffect(() => {
    if (page > pages.length - 1) setPage(0);
  }, [pages.length, page]);

  const next = () => setPage((p) => (p + 1) % pages.length);
  const prev = () => setPage((p) => (p - 1 + pages.length) % pages.length);
  // const goTo = (idx: number) => setPage(idx);

  return (
    <section className={styles.wrapper} aria-label="Reviews carousel">
      <h2 className={styles.title}>Latest Reviews</h2>

      {/* кнопки поза контейнером */}
      <button className={`${styles.wrapper_navBtn} ${styles.wrapper_navBtn_left}`} onClick={prev} aria-label="Previous"><Image width={15} height={45} src="/images/icons/back.png" alt="" /></button>
      <button className={`${styles.wrapper_navBtn} ${styles.wrapper_navBtn_right}`} onClick={next} aria-label="Next"><Image width={15} height={45} src="/images/icons/next.png" alt="" /></button>

      {/* вʼюшка */}
      <div className={styles.viewport}>
        <div
          className={styles.track}
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {pages.map((group, idx) => (
            <div className={styles.page} key={idx}>
              {group.map((r) => (
                <div className={styles.cardWrap} key={r.id}>
                  <ReviewBox review={r} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className='w-full flex items-center justify-center'>
        <button className='w-100 mt-auto text-center bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-2 rounded-3xl cursor-pointer flex'>
          <Link className='w-full h-full' href="/reviews">View all</Link>
        </button>
      </div>
      {/* пагінація */}
      {/* <div className={styles.dots} role="tablist" aria-label="Carousel pagination">
        {pages.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={page === i}
            aria-label={`Go to slide ${i + 1}`}
            className={`${styles.dot} ${page === i ? styles.dotActive : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div> */}
    </section>
  );
}
