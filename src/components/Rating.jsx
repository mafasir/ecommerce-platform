import { IconStar } from "./Icons";

export default function Rating({ value = 0, count, size = 16, showValue = false }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className="rating" aria-label={`Rated ${value} out of 5`}>
      <span className="rating__stars">
        {[1, 2, 3, 4, 5].map((i) => (
          <IconStar
            key={i}
            size={size}
            filled={i <= rounded}
            className={i <= rounded ? "star star--on" : "star"}
          />
        ))}
      </span>
      {showValue && <span className="rating__value">{value.toFixed(1)}</span>}
      {count != null && <span className="rating__count">({count.toLocaleString()})</span>}
    </span>
  );
}
