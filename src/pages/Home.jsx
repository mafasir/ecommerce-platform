import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { products, categories } from "../data/products";
import ProductCard from "../components/ProductCard";
import ProductRail from "../components/ProductRail";
import Rating from "../components/Rating";
import {
  IconArrowRight,
  IconTruck,
  IconShield,
  IconSparkles,
} from "../components/Icons";

function useCountdown(hoursFromNow = 8) {
  const target = useMemo(() => Date.now() + hoursFromNow * 3600 * 1000, [hoursFromNow]);
  const [left, setLeft] = useState(target - Date.now());
  useEffect(() => {
    const id = setInterval(() => setLeft(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(id);
  }, [target]);
  const s = Math.floor(left / 1000);
  return {
    h: String(Math.floor(s / 3600)).padStart(2, "0"),
    m: String(Math.floor((s % 3600) / 60)).padStart(2, "0"),
    s: String(s % 60).padStart(2, "0"),
  };
}

const testimonials = [
  { name: "Amara Okafor", role: "Verified Buyer", text: "Ordering was effortless and my espresso machine arrived two days early. The quality is outstanding — I've already ordered twice more.", rating: 5 },
  { name: "Diego Fernández", role: "Verified Buyer", text: "Best online shopping experience I've had. The product photos match reality perfectly and the return process was painless.", rating: 5 },
  { name: "Yuki Tanaka", role: "Verified Buyer", text: "Great prices, fast checkout and a beautiful, responsive site that works flawlessly on my phone. Highly recommended.", rating: 4.5 },
];

export default function Home() {
  const featured = products.filter((p) => p.tags.includes("featured")).slice(0, 10);
  const bestsellers = products.filter((p) => p.tags.includes("bestseller"));
  const newArrivals = products.filter((p) => p.tags.includes("new"));
  const deals = products.filter((p) => p.oldPrice).slice(0, 4);
  const { h, m, s } = useCountdown(8);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content">
            <span className="hero__eyebrow">
              <IconSparkles size={16} /> New season, new tech
            </span>
            <h1 className="hero__title">
              Everything you love, <span>delivered fast.</span>
            </h1>
            <p className="hero__text">
              Discover thousands of curated products across electronics, fashion,
              home and beauty — with free shipping over $100 and hassle-free returns.
            </p>
            <div className="hero__actions">
              <Link to="/shop" className="btn btn--primary btn--lg">
                Shop now <IconArrowRight size={18} />
              </Link>
              <Link to="/shop?tag=featured" className="btn btn--ghost btn--lg">
                Explore deals
              </Link>
            </div>
            <div className="hero__stats">
              <div><strong>25k+</strong><span>Products</span></div>
              <div><strong>120k+</strong><span>Happy customers</span></div>
              <div><strong>4.9★</strong><span>Average rating</span></div>
            </div>
          </div>

          <div className="hero__art">
            <img
              className="hero__img hero__img--main"
              src="https://picsum.photos/seed/nexus-hero-main/900/1000"
              alt="Featured product"
            />
            <div className="hero__card hero__card--tl">
              <img src={products[1].images[0]} alt="" />
              <div>
                <strong>{products[1].name}</strong>
                <span>Save 25% today</span>
              </div>
            </div>
            <div className="hero__card hero__card--br">
              <span className="hero__card-icon"><IconTruck size={18} /></span>
              <div>
                <strong>Free delivery</strong>
                <span>Over $100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section__head">
            <div>
              <h2 className="section__title">Shop by category</h2>
              <p className="section__subtitle">Find exactly what you need</p>
            </div>
            <Link to="/shop" className="btn btn--ghost btn--sm">
              View all <IconArrowRight size={16} />
            </Link>
          </div>
          <div className="cat-grid">
            {categories.map((c) => (
              <Link key={c.id} to={`/shop?category=${c.id}`} className="cat-card">
                <img src={c.image} alt={c.name} loading="lazy" />
                <div className="cat-card__overlay">
                  <span className="cat-card__icon">{c.icon}</span>
                  <div>
                    <strong>{c.name}</strong>
                    <span>{c.blurb}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured rail */}
      <ProductRail
        title="Featured products"
        subtitle="Hand-picked favourites from our editors"
        products={featured}
        linkTo="/shop?tag=featured"
      />

      {/* Promo banners */}
      <section className="section">
        <div className="container promo-grid">
          <Link to="/shop?category=electronics" className="promo promo--blue">
            <div className="promo__text">
              <span className="promo__tag">Limited time</span>
              <h3>Up to 40% off Electronics</h3>
              <p>Laptops, audio, wearables and more.</p>
              <span className="promo__cta">Shop Electronics <IconArrowRight size={16} /></span>
            </div>
            <img src="https://picsum.photos/seed/promo-electronics/700/600" alt="" />
          </Link>
          <div className="promo-stack">
            <Link to="/shop?category=fashion" className="promo promo--pink promo--sm">
              <div className="promo__text">
                <span className="promo__tag">New in</span>
                <h3>Fashion Favourites</h3>
                <span className="promo__cta">Shop now <IconArrowRight size={14} /></span>
              </div>
              <img src="https://picsum.photos/seed/promo-fashion/500/400" alt="" />
            </Link>
            <Link to="/shop?category=home" className="promo promo--green promo--sm">
              <div className="promo__text">
                <span className="promo__tag">Cozy season</span>
                <h3>Refresh Your Home</h3>
                <span className="promo__cta">Explore <IconArrowRight size={14} /></span>
              </div>
              <img src="https://picsum.photos/seed/promo-home/500/400" alt="" />
            </Link>
          </div>
        </div>
      </section>

      {/* Flash deals */}
      <section className="section">
        <div className="container">
          <div className="section__head">
            <div>
              <h2 className="section__title">⚡ Flash deals</h2>
              <p className="section__subtitle">Grab them before the timer runs out</p>
            </div>
            <div className="countdown" aria-label="Deal countdown">
              <span>{h}</span>:<span>{m}</span>:<span>{s}</span>
            </div>
          </div>
          <div className="grid grid--4">
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers rail */}
      <ProductRail
        title="Bestsellers"
        subtitle="What everyone is buying right now"
        products={bestsellers}
        linkTo="/shop?tag=bestseller"
      />

      {/* Value props */}
      <section className="section value-band">
        <div className="container value-grid">
          <div className="value-card">
            <IconTruck size={28} />
            <h3>Free & fast shipping</h3>
            <p>Complimentary delivery on orders over $100, dispatched within 24 hours.</p>
          </div>
          <div className="value-card">
            <IconShield size={28} />
            <h3>Secure checkout</h3>
            <p>Your payment data is protected with bank-grade 256-bit encryption.</p>
          </div>
          <div className="value-card">
            <IconSparkles size={28} />
            <h3>Curated quality</h3>
            <p>Every product is vetted by our team for value, durability and design.</p>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <ProductRail
          title="New arrivals"
          subtitle="Fresh drops added this week"
          products={newArrivals}
          linkTo="/shop?tag=new"
        />
      )}

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <div className="section__head section__head--center">
            <div>
              <h2 className="section__title">Loved by customers</h2>
              <p className="section__subtitle">Over 120,000 five-star experiences</p>
            </div>
          </div>
          <div className="grid grid--3">
            {testimonials.map((t) => (
              <figure className="testimonial" key={t.name}>
                <Rating value={t.rating} size={16} />
                <blockquote>“{t.text}”</blockquote>
                <figcaption>
                  <span className="avatar">{t.name.charAt(0)}</span>
                  <span>
                    <strong>{t.name}</strong>
                    <em>{t.role}</em>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterCTA />
    </>
  );
}

function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section className="cta">
      <div className="container cta__inner">
        <div>
          <h2>Join the Nexus insider list</h2>
          <p>Get 10% off your first order plus early access to sales and new drops.</p>
        </div>
        <form
          className="cta__form"
          onSubmit={(e) => {
            e.preventDefault();
            if (email) setDone(true);
          }}
        >
          {done ? (
            <span className="cta__done">🎉 You're in! Check your inbox for your code.</span>
          ) : (
            <>
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email"
              />
              <button className="btn btn--primary" type="submit">Subscribe</button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
