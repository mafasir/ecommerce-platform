import { IconPlus, IconMinus } from "./Icons";

export default function QuantityStepper({ value, onChange, min = 1, max = 99, size = "md" }) {
  const clamp = (n) => Math.min(max, Math.max(min, n));
  return (
    <div className={`stepper stepper--${size}`}>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <IconMinus size={16} />
      </button>
      <input
        className="stepper__input"
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(clamp(Number(e.target.value) || min))}
        aria-label="Quantity"
      />
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <IconPlus size={16} />
      </button>
    </div>
  );
}
