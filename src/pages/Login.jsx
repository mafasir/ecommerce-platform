import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { IconLock } from "../components/Icons";

export default function Login() {
  const { login, notify } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get("redirect") || "/account";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(form.email)) return setError("Please enter a valid email address.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    login({ name: form.email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), email: form.email });
    navigate(redirect, { replace: true });
  };

  const demo = () => {
    login({ name: "Demo User", email: "demo@nexusstore.com" });
    notify("Signed in as demo user");
    navigate(redirect, { replace: true });
  };

  return (
    <div className="auth">
      <div className="auth__art">
        <img src="https://picsum.photos/seed/nexus-auth/900/1200" alt="" />
        <div className="auth__art-text">
          <h2>Welcome back to NexusStore</h2>
          <p>Sign in to track orders, save favourites and check out faster.</p>
        </div>
      </div>

      <div className="auth__panel">
        <div className="auth__card">
          <Link to="/" className="brand auth__brand">
            <span className="brand__mark">N</span>
            <span className="brand__name">Nexus<span>Store</span></span>
          </Link>
          <h1>Sign in</h1>
          <p className="auth__sub">New here? <Link to={`/register?redirect=${encodeURIComponent(redirect)}`}>Create an account</Link></p>

          <form onSubmit={submit} className="auth__form">
            <label className="field">
              <span>Email address</span>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" autoComplete="email" />
            </label>
            <label className="field">
              <span>Password</span>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" autoComplete="current-password" />
            </label>

            {error && <p className="form-error">{error}</p>}

            <div className="auth__row">
              <label className="filter-check"><input type="checkbox" defaultChecked /> <span>Remember me</span></label>
              <a href="/#" className="auth__link">Forgot password?</a>
            </div>

            <button className="btn btn--primary btn--block btn--lg" type="submit"><IconLock size={16} /> Sign in</button>
            <button className="btn btn--ghost btn--block" type="button" onClick={demo}>Use demo account</button>
          </form>

          <div className="auth__divider"><span>or continue with</span></div>
          <div className="auth__socials">
            {["Google", "Apple", "Facebook"].map((s) => (
              <button key={s} className="btn btn--ghost" onClick={() => notify(`${s} sign-in is a demo`, "info")}>{s}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
