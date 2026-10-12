import { Link } from "react-router-dom";
import { IconTruck, IconShield, IconHeadset, IconRefresh, IconSparkles, IconArrowRight } from "../components/Icons";

const faqs = [
  { q: "How long does shipping take?", a: "Standard delivery takes 2–4 business days. Express options are available at checkout, and orders over $100 ship free." },
  { q: "What is your return policy?", a: "You have 30 days from delivery to return any item for a full refund, no questions asked. Items must be in original condition." },
  { q: "Which payment methods do you accept?", a: "We accept all major credit and debit cards, PayPal, Apple Pay and Google Pay. All transactions are encrypted." },
  { q: "Do you ship internationally?", a: "Yes, we ship to over 60 countries. International delivery times and duties are calculated at checkout." },
  { q: "How do I track my order?", a: "Once your order ships you'll receive an email with a tracking link. You can also view status under My Account → Orders." },
];

export default function About() {
  return (
    <div className="container page">
      <nav className="breadcrumbs"><Link to="/">Home</Link> <span>/</span> <span>About</span></nav>

      <section className="about-hero">
        <div>
          <span className="hero__eyebrow"><IconSparkles size={16} /> Our story</span>
          <h1>Commerce built around you</h1>
          <p>
            NexusStore started in 2019 with a simple idea: online shopping should feel
            effortless, trustworthy and enjoyable. Today we serve over 120,000 customers
            across the globe with a catalogue curated for quality and value.
          </p>
          <Link to="/shop" className="btn btn--primary btn--lg">Shop the collection <IconArrowRight size={18} /></Link>
        </div>
        <img src="https://picsum.photos/seed/nexus-about/900/700" alt="Our team" />
      </section>

      <div className="grid grid--3">
        <div className="value-card"><IconTruck size={28} /><h3>25,000+ products</h3><p>Across electronics, fashion, home, beauty, sports and more — all in one place.</p></div>
        <div className="value-card"><IconShield size={28} /><h3>Trusted & secure</h3><p>Bank-grade encryption and buyer protection on every single transaction.</p></div>
        <div className="value-card"><IconHeadset size={28} /><h3>24/7 support</h3><p>A real human is always just a message away, day or night.</p></div>
      </div>

      <section className="section">
        <h2 className="section__title">Frequently asked questions</h2>
        <div className="faq">
          {faqs.map((f) => (
            <details className="faq__item" key={f.q}>
              <summary>{f.q}<span>+</span></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="container cta__inner">
          <div>
            <h2>Still have questions?</h2>
            <p>Our support team is here to help around the clock.</p>
          </div>
          <Link to="/shop" className="btn btn--light btn--lg"><IconRefresh size={18} /> Keep shopping</Link>
        </div>
      </section>
    </div>
  );
}
