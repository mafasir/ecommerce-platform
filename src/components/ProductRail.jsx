import { useRef } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { IconChevronLeft, IconChevronRight, IconArrowRight } from "./Icons";

export default function ProductRail({ title, subtitle, products, linkTo = "/shop" }) {
  const railRef = useRef(null);

  const scrollBy = (dir) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <section className="section">
      <div className="container">
        <div className="section__head">
          <div>
            <h2 className="section__title">{title}</h2>
            {subtitle && <p className="section__subtitle">{subtitle}</p>}
          </div>
          <div className="section__head-actions">
            <Link to={linkTo} className="btn btn--ghost btn--sm">
              View all <IconArrowRight size={16} />
            </Link>
            <div className="rail__nav">
              <button className="icon-btn icon-btn--round" onClick={() => scrollBy(-1)} aria-label="Scroll left">
                <IconChevronLeft size={18} />
              </button>
              <button className="icon-btn icon-btn--round" onClick={() => scrollBy(1)} aria-label="Scroll right">
                <IconChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
        <div className="rail" ref={railRef}>
          {products.map((p) => (
            <div className="rail__item" key={p.id}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
