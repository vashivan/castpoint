import Image from 'next/image';
import styles from '../../styles/ReviewBox.module.scss';

type Props = {
  review: Review
}

export default function ReviewBox({ review }: Props) {
  function cleanInstagramHandle(username: string): string {
    return username.trim().replace(/^@+/, '');
  }

  return (
    <div className={`
     bg-white p-4 rounded-2xl shadow-sm mb-4 text-black 
     ${styles.review_box}`
    }>
      <div className={`
       text-sm text-gray-600 mt-2 flex gap-1 
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
        <span className="font-semibold">{review.artist_name}</span>
      </div>
      <p className={`text-xs text-gray-400 mt-1 ${styles.review_box_date}`}>
        {new Date(review.created_at).toLocaleDateString()}
      </p>
      <h3 className={`text-lg font-bold ${styles.review_box_company}`}>
        <strong>Company:</strong>
        {` `}{review.company_name}
      </h3>
      <p className={`text-sm italic ${styles.review_box_position}`}>
        {review.position} at {review.place_of_work}
      </p>
      <p className={`mt-2 ${styles.review_box_content}`}>
        {review.content}
      </p>
    </div>
  )
}