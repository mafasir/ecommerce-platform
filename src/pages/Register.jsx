import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { IconCheck } from "../components/Icons";

export default function Register() {
  const { login, notify } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get("redirect") || "/account";
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});

  const strength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 6) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!form.name.trim()) er.name = "Enter your full name";
    if (!/\S+@\S+\.\S+/.test(form.email)) er.email = "Enter a valid email";
    if (form.password.length < 6) er.password = "At least 6 characters";
    if (form.password !== form.confirm) er.confirm = "Passwords do not match";
    if (!agree) er.agree = "Please accept the terms";
    setErrors(er);
    if (Object.keys(er).length) return;
    login({ name: form.name, email: form.email });
    notify("Account created successfully!");
    navigate(redirect, { replace: true });
  };

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };

  return (
    <div className="auth">
      <div className="auth__art">
        <img src="https://picsum.photos/seed/nexus-register/900/1200" alt="" />
        <div className="auth__art-text">
          <h2>Join NexusStore today</h2>
          <p>Enjoy member-only deals, faster checkout and order tracking.</p>
          <ul className="auth__benefits">
            <li><IconCheck size={16} /> 10% off your first order</li>
            <li><IconCheck size={16} /> Free returns within 30 days</li>
            <li><IconCheck size={16} /> Exclusive early access to sales</li>
          </ul>
        </div>
      </div>

      <div className="auth__panel">
        <div className="auth__card">
          <Link to="/" className="brand auth__brand">
            <span className="brand__mark">N</span>
            <span className="brand__name">Nexus<span>Store</span></span>
          </Link>
          <h1>Create account</h1>
          <p className="auth__sub">Already have one? <Link to={`/login?redirect=${encodeURIComponent(redirect)}`}>Sign in</Link></p>

          <form onSubmit={submit} className="auth__form">
            <label className={`field ${errors.name ? "has-error" : ""}`}>
              <span>Full name</span>
              <input value={form.name} onChange={set("name")} placeholder="Jane Doe" autoComplete="name" />
              {errors.name && <em className="field__error">{errors.name}</em>}
            </label>
            <label className={`field ${errors.email ? "has-error" : ""}`}>
              <span>Email address</span>
              <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" />
              {errors.email && <em className="field__error">{errors.email}</em>}
            </label>
            <label className={`field ${errors.password ? "has-error" : ""}`}>
              <span>Password</span>
              <input type="password" value={form.password} onChange={set("password")} placeholder="Create a password" autoComplete="new-password" />
              {errors.password && <em className="field__error">{errors.password}</em>}
            </label>
            {form.password && (
              <div className={`strength strength--${strength}`}>
                {[1, 2, 3, 4].map((i) => <i key={i} className={i <= strength ? "on" : ""} />)}
                <span>{["Too weak", "Weak", "Fair", "Good", "Strong"][strength]}</span>
              </div>
            )}
            <label className={`field ${errors.confirm ? "has-error" : ""}`}>
              <span>Confirm password</span>
              <input type="password" value={form.confirm} onChange={set("confirm")} placeholder="Repeat password" autoComplete="new-password" />
              {errors.confirm && <em className="field__error">{errors.confirm}</em>}
            </label>

            <label className="filter-check">
              <input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setErrors((er) => ({ ...er, agree: "" })); }} />
              <span>I agree to the Terms of Service and Privacy Policy</span>
            </label>
            {errors.agree && <p className="form-error">{errors.agree}</p>}

            <button className="btn btn--primary btn--block btn--lg" type="submit">Create account</button>
          </form>
        </div>
      </div>
    </div>
  );
}
