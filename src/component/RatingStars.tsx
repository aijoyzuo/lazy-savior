import type { ReactElement } from 'react';


type RatingStarsProps = {
  score: number;
};

export default function RatingStars({ score }: RatingStarsProps): ReactElement {
  let stars = 0;
  if (score >= 11) stars = 5;
  else if (score >= 7) stars = 4;
  else if (score >= 4) stars = 3;
  else if (score >= 2) stars = 2;
  else if (score === 1) stars = 1;

  const starIcons = Array.from({ length: stars }, (_, i) => (
    <i key={i} className="bi bi-star-fill text-warning me-1"></i>
  ));

  return (
    <div className="d-inline-flex align-items-center">
      {starIcons}
      <span className="ms-1 small text-muted">({score} 分)</span>
    </div>
  );
}
