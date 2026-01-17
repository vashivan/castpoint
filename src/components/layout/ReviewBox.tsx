import React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import styles from '../../styles/ReviewBox.module.scss';
import { Review } from '../../utils/Types';
import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  review: Review
}


function ApplyModal({ review, onClose }: { review: Review; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`relative flex w-full max-w-xl flex-col items-center gap-3 rounded-2xl bg-white p-10 ${styles.review_box}`}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 cursor-pointer text-black/60"
        >
          ✕
        </button>

        {/* CONTENT */}
        <div className={`text-sm text-gray-600 mt-2 flex gap-3 ${styles.review_box_name}`}>
          {review.artist_instagram && (
            <a
              href={`https://instagram.com/${review.artist_instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 ml-1"
            >
              <Image src="/images/icons/instagram.svg" alt="" width={20} height={20} />
            </a>
          )}
          <span>{review.artist_name || "Anonymous"}</span>
        </div>

        <p className={`text-xs text-gray-400 ${styles.review_box_date}`}>
          {new Date(review.created_at).toLocaleDateString()}
        </p>

        <p className={`text-sm italic ${styles.review_box_position}`}>
          {review.position} at {review.place_of_work}
        </p>

        <p className={styles.review_box_company}>
          Company: {review.company_name}
        </p>

        <div className={styles.review_box_content}>
          <p className="mt-2 text-[16px]">{review.content}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}


export default function ReviewBox({ review }: Props) {
  function cleanInstagramHandle(username: string): string {
    return username;
  }

  const [open, setOpen] = useState(false);

  return (
    <div className={`
     bg-white p-4 rounded-2xl shadow-sm text-black 
     ${styles.review_box}`
    }>
      <div className={`
       text-sm text-gray-600 mt-2 flex gap-3 
       ${styles.review_box_name}`
      }>
        <a
          href={`https://instagram.com/${cleanInstagramHandle(review.artist_instagram)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-500 ml-1"
        >
          <Image width={0} height={0} src="/images/icons/instagram.svg" alt="" className="w-5 h-5" />
        </a>
        <span>{review.artist_name}</span>
      </div>
      <p className={`text-xs text-gray-400 mt-1 ${styles.review_box_date}`}>
        {new Date(review.created_at).toLocaleDateString()}
      </p>
      <p className={`text-sm italic ${styles.review_box_position}`}>
        {review.position} at {review.place_of_work}
      </p>
      <p className={`${styles.review_box_company}`}>
        Company:
        {` `}{review.company_name}
      </p>
      <div className={styles.review_box_content}>
        <p className='mt-2 line-clamp-2 text-[14px]'>{review.content}</p>
        <button
          onClick={() => setOpen(true)}
          className="text-m text-orange-600 mt-1 cursor-pointer text-bold"
        >
          Read more
        </button>
      </div>

     <AnimatePresence>
        {open && (
          <ApplyModal
            review={review}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}