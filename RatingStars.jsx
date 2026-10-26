import { Star } from 'lucide-react';

export default function RatingStars({ value = 0, showValue = true, size = 15 }) {
  const rating = Number(value) || 0;
  return <span className="rating-stars" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
    <span className="stars">{[1,2,3,4,5].map(n => <Star key={n} size={size} fill={n <= Math.round(rating) ? 'currentColor' : 'none'} strokeWidth={1.8} className={n <= Math.round(rating) ? 'star-filled' : 'star-empty'}/>)}</span>
    {showValue && <span className="rating-number">{rating.toFixed(1)}</span>}
  </span>;
}
