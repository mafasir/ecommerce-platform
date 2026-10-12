import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { formatCurrency } from "../utils/format";
import {
  processPayment,
  confirmAction,
  validateCard,
  validateExpiry,
  formatCardNumber,
  formatExpiry,
  detectBrand,
  TEST_CARDS,
} from "../payments/paymentService";
import {
  IconLock,
  IconCheck,
  IconTruck,
  IconChevronRight,
  IconCreditCard,
  IconAlert,
} from "../components/Icons";

const STEPS = ["Shipping", "Payment", "Review"];

const emptyForm = {
  email: "", firstName: "", lastName: "", address: "", city: "", state: "", zip: "", country: "United States", phone: "",
  cardName: "", cardNumber: "", expiry: "", cvc: "",
};

export default function Checkout() {
  const { cartDetailed, subtotal, discount, shipping, tax, total, placeOrder, user, notify } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    ...emptyForm,
    email: user?.email || "",
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
  });
  const [payment, setPayment] = useState("card");
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [intent, setIntent] = useState(null); // pending 3DS challenge { id, brand, last4, method }
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  const brand = useMemo(() => detectBrand(form.cardNumber), [form.cardNumber]);
  const cardDigits = form.cardNumber.replace(/\D/g, "");

  if (cartDetailed.length === 0 && !processing && !intent) {
    return (
      <div className="container page empty empty--lg">
        <h2>Nothing to check out</h2>
        <p>Add some products to your cart first.</p>
        <Link to="/shop" className="btn btn--primary btn--lg">Browse products</Link>
      </div>
    );
  }

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
    setPaymentError("");
  };

  const setCardField = (k, value) => {
    setForm((f) => ({ ...f, [k]: value }));
    setErrors((er) => ({ ...er, [k]: "" }));
    setPaymentError("");
  };

  const validateStep = () => {
    const er = {};
    if (step === 0) {
      if (!/\S+@\S+\.\S+/.test(form.email)) er.email = "Enter a valid email";
      if (!form.firstName.trim()) er.firstName = "Required";
      if (!form.lastName.trim()) er.lastName = "Required";
      if (!form.address.trim()) er.address = "Required";
      if (!form.city.trim()) er.city = "Required";
      if (!form.zip.trim()) er.zip = "Required";
    }
    if (step === 1 && payment === "card") {
      const result = validateCard({
        number: form.cardNumber,
        name: form.cardName,
        expiry: form.expiry,
        cvc: form.cvc,
      });
      Object.assign(er, result.errors);
    }
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 2));
    else notify("Please fix the highlighted fields", "error");
  };

  const buildOrder = (paymentDescriptor, paymentIntentId) => ({
    id: "NX-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    date: new Date().toISOString(),
    items: cartDetailed.map((it) => ({
      id: it.id, name: it.product.name, image: it.product.images[0],
      qty: it.qty, price: it.product.price, color: it.color, size: it.size,
    })),
    subtotal, discount, shipping, tax, total,
    email: form.email,
    address: `${form.address}, ${form.city}, ${form.state} ${form.zip}, ${form.country}`,
    payment: paymentDescriptor,
    transactionId: paymentIntentId,
    paymentStatus: "paid",
    status: "Processing",
  });

  const completeOrder = (result) => {
    const descriptor =
      result.method === "card"
        ? `${result.brand} •••• ${result.last4}`
        : result.brand;
    const order = buildOrder(descriptor, result.id);
    placeOrder(order);
    notify("Payment successful — order placed!");
    navigate(`/order-success/${order.id}`);
  };

  const submit = async () => {
    if (!validateStep()) return;
    setProcessing(true);
    setPaymentError("");
    try {
      const result = await processPayment({
        method: payment,
        card: form,
        amount: Number(total.toFixed(2)),
        currency: "USD",
      });

      if (result.status === "requires_action") {
        setProcessing(false);
        setIntent({ id: result.id, brand: result.brand, last4: result.last4, method: result.method });
        setOtp("");
        setOtpError("");
        return;
      }
      if (result.status === "failed") {
        setProcessing(false);
        setPaymentError(result.message || "Payment failed. Please try again.");
        setStep(1);
        notify("Payment failed", "error");
        return;
      }
      completeOrder(result);
    } catch (err) {
      setProcessing(false);
      setPaymentError("Something went wrong contacting the payment gateway. Please try again.");
    }
  };

  const verifyOtp = async () => {
    setOtpError("");
    const result = await confirmAction(intent.id, otp);
    if (result.status === "succeeded") {
      const descriptor = `${intent.brand} •••• ${intent.last4}`;
      const order = buildOrder(descriptor, intent.id);
      setIntent(null);
      placeOrder(order);
      notify("Payment authenticated — order placed!");
      navigate(`/order-success/${order.id}`);
    } else {
      setOtpError(result.message || "Authentication failed. Try again.");
    }
  };

  const autofillTestCard = (number) => {
    setForm((f) => ({ ...f, cardNumber: formatCardNumber(number), cardName: f.cardName || "Test User", expiry: "12/34", cvc: number.startsWith("3782") ? "1234" : "123" }));
    setErrors({});
    setPaymentError("");
  };

  return (
    <div className="container page">
      <nav className="breadcrumbs"><Link to="/">Home</Link> <span>/</span> <Link to="/cart">Cart</Link> <span>/</span> <span>Checkout</span></nav>
      <h1 className="page__title">Checkout</h1>

      <div className="steps">
        {STEPS.map((s, i) => (
          <div key={s} className={`step ${i === step ? "is-active" : ""} ${i < step ? "is-done" : ""}`}>
            <span className="step__num">{i < step ? <IconCheck size={16} /> : i + 1}</span>
            <span className="step__label">{s}</span>
            {i < STEPS.length - 1 && <span className="step__line" />}
          </div>
        ))}
      </div>

      <div className="checkout">
        <div className="checkout__main">
          {step === 0 && (
            <section className="panel">
              <h3>Shipping details</h3>
              <div className="form-grid">
                <Field label="Email" value={form.email} onChange={set("email")} error={errors.email} type="email" full />
                <Field label="First name" value={form.firstName} onChange={set("firstName")} error={errors.firstName} />
                <Field label="Last name" value={form.lastName} onChange={set("lastName")} error={errors.lastName} />
                <Field label="Address" value={form.address} onChange={set("address")} error={errors.address} full />
                <Field label="City" value={form.city} onChange={set("city")} error={errors.city} />
                <Field label="State / Province" value={form.state} onChange={set("state")} />
                <Field label="ZIP / Postal code" value={form.zip} onChange={set("zip")} error={errors.zip} />
                <Field label="Country" value={form.country} onChange={set("country")} />
                <Field label="Phone (optional)" value={form.phone} onChange={set("phone")} full />
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="panel">
              <h3>Payment method</h3>

              {paymentError && (
                <div className="alert alert--error" role="alert">
                  <IconAlert size={18} />
                  <span>{paymentError}</span>
                </div>
              )}

              <div className="pay-methods">
                {[
                  { id: "card", label: "Credit / Debit Card", icon: IconCreditCard },
                  { id: "paypal", label: "PayPal" },
                  { id: "apple", label: "Apple Pay" },
                ].map((m) => (
                  <label key={m.id} className={`pay-method ${payment === m.id ? "is-active" : ""}`}>
                    <input type="radio" name="payment" checked={payment === m.id} onChange={() => { setPayment(m.id); setPaymentError(""); }} />
                    {m.icon && <m.icon size={18} />}
                    <span>{m.label}</span>
                  </label>
                ))}
              </div>

              {payment === "card" && (
                <>
                  <div className="form-grid">
                    <label className={`field field--full ${errors.cardName ? "has-error" : ""}`}>
                      <span>Name on card</span>
                      <input value={form.cardName} onChange={(e) => setCardField("cardName", e.target.value)} placeholder="As printed on card" autoComplete="cc-name" />
                      {errors.cardName && <em className="field__error">{errors.cardName}</em>}
                    </label>

                    <label className={`field field--full ${errors.cardNumber ? "has-error" : ""}`}>
                      <span>Card number</span>
                      <div className="card-input">
                        <input
                          value={form.cardNumber}
                          onChange={(e) => setCardField("cardNumber", formatCardNumber(e.target.value))}
                          placeholder="1234 5678 9012 3456"
                          inputMode="numeric"
                          autoComplete="cc-number"
                        />
                        <span className="card-input__brand" style={{ color: brand?.color, background: brand?.bg }}>
                          {brand ? brand.name : <IconCreditCard size={20} />}
                        </span>
                      </div>
                      {errors.cardNumber && <em className="field__error">{errors.cardNumber}</em>}
                      {!errors.cardNumber && cardDigits.length >= 12 && brand && (
                        <em className="field__ok"><IconCheck size={13} /> Valid {brand.name} number</em>
                      )}
                    </label>

                    <label className={`field ${errors.expiry ? "has-error" : ""}`}>
                      <span>Expiry (MM/YY)</span>
                      <input
                        value={form.expiry}
                        onChange={(e) => setCardField("expiry", formatExpiry(e.target.value))}
                        onBlur={() => {
                          if (form.expiry) {
                            const r = validateExpiry(form.expiry);
                            if (!r.valid) setErrors((er) => ({ ...er, expiry: r.error }));
                          }
                        }}
                        placeholder="08/28"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                      />
                      {errors.expiry && <em className="field__error">{errors.expiry}</em>}
                    </label>

                    <label className={`field ${errors.cvc ? "has-error" : ""}`}>
                      <span>CVC</span>
                      <input
                        value={form.cvc}
                        onChange={(e) => setCardField("cvc", e.target.value.replace(/\D/g, "").slice(0, brand?.cvc || 4))}
                        placeholder={brand?.cvc === 4 ? "1234" : "123"}
                        inputMode="numeric"
                        autoComplete="cc-csc"
                      />
                      {errors.cvc && <em className="field__error">{errors.cvc}</em>}
                    </label>
                  </div>

                  <div className="testcards">
                    <div className="testcards__head">
                      <IconAlert size={15} /> Sandbox mode — use a test card
                    </div>
                    <div className="testcards__list">
                      {TEST_CARDS.map((c) => (
                        <button key={c.number} type="button" onClick={() => autofillTestCard(c.number)}>
                          <code>{c.number}</code>
                          <span className={`tag tag--${c.outcome}`}>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {payment === "paypal" && <p className="pay-note">You'll be redirected to PayPal to authorize your payment securely.</p>}
              {payment === "apple" && <p className="pay-note">Confirm with Face ID / Touch ID on your Apple device.</p>}

              <div className="secure-note"><IconLock size={15} /> Payments are processed over an encrypted connection. Card details are never stored.</div>
            </section>
          )}

          {step === 2 && (
            <section className="panel">
              <h3>Review your order</h3>
              <div className="review-block">
                <div>
                  <h4>Ship to</h4>
                  <p>{form.firstName} {form.lastName}<br />{form.address}<br />{form.city}, {form.state} {form.zip}<br />{form.country}<br />{form.email}</p>
                </div>
                <div>
                  <h4>Payment</h4>
                  <p>
                    {payment === "card"
                      ? `${brand ? brand.name : "Card"} •••• ${cardDigits.slice(-4) || "····"}`
                      : payment === "paypal" ? "PayPal" : "Apple Pay"}
                  </p>
                </div>
              </div>
              <div className="review-items">
                {cartDetailed.map((it) => (
                  <div className="review-item" key={it.key}>
                    <img src={it.product.images[0]} alt="" />
                    <div>
                      <strong>{it.product.name}</strong>
                      <span>Qty {it.qty}{it.size ? ` • Size ${it.size}` : ""}</span>
                    </div>
                    <span>{formatCurrency(it.lineTotal)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="checkout__nav">
            {step > 0 && <button className="btn btn--ghost" onClick={() => setStep((s) => s - 1)} disabled={processing}>← Back</button>}
            {step < 2 ? (
              <button className="btn btn--primary btn--lg" onClick={next}>
                Continue <IconChevronRight size={18} />
              </button>
            ) : (
              <button className="btn btn--primary btn--lg" onClick={submit} disabled={processing}>
                {processing ? <><span className="spinner spinner--sm" /> Processing payment…</> : <><IconLock size={16} /> Pay {formatCurrency(total)}</>}
              </button>
            )}
          </div>
        </div>

        <aside className="checkout__summary">
          <h3>Order Summary</h3>
          <div className="co-items">
            {cartDetailed.map((it) => (
              <div className="co-item" key={it.key}>
                <img src={it.product.images[0]} alt="" />
                <div>
                  <span>{it.product.name}</span>
                  <em>Qty {it.qty}</em>
                </div>
                <strong>{formatCurrency(it.lineTotal)}</strong>
              </div>
            ))}
          </div>
          <div className="summary-row"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
          {discount > 0 && <div className="summary-row summary-row--discount"><span>Discount</span><strong>-{formatCurrency(discount)}</strong></div>}
          <div className="summary-row"><span>Shipping</span><strong>{shipping === 0 ? "Free" : formatCurrency(shipping)}</strong></div>
          <div className="summary-row"><span>Tax</span><strong>{formatCurrency(tax)}</strong></div>
          <div className="summary-row summary-row--total"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
          <div className="summary-note"><IconTruck size={16} /> Estimated delivery 2–4 business days</div>
        </aside>
      </div>

      {/* Processing overlay */}
      {processing && (
        <div className="pay-overlay" role="alert" aria-live="assertive">
          <div className="pay-overlay__box">
            <span className="spinner" />
            <strong>Processing your payment…</strong>
            <span>Please don't close this window.</span>
          </div>
        </div>
      )}

      {/* 3D-Secure challenge */}
      {intent && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal__overlay" />
          <div className="modal__box">
            <div className="modal__icon"><IconLock size={26} /></div>
            <h3>Verify your payment</h3>
            <p>For your security, your bank needs to confirm this payment. Enter the 6-digit code sent to your phone.</p>
            <p className="modal__hint">Demo code: <code>123456</code></p>
            <input
              className={`otp-input ${otpError ? "has-error" : ""}`}
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setOtpError(""); }}
              placeholder="••••••"
              inputMode="numeric"
              autoFocus
            />
            {otpError && <p className="form-error">{otpError}</p>}
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => { setIntent(null); setOtpError(""); }}>Cancel</button>
              <button className="btn btn--primary" onClick={verifyOtp} disabled={otp.length !== 6}>Confirm payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, error, type = "text", full, placeholder }) {
  return (
    <label className={`field ${full ? "field--full" : ""} ${error ? "has-error" : ""}`}>
      <span>{label}</span>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} />
      {error && <em className="field__error">{error}</em>}
    </label>
  );
}
