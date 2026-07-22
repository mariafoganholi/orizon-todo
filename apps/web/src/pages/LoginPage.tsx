import { useState, type SubmitEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../components/AuthProvider";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { message?: string } | null;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { error, login, isLoading } = useAuth();

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const ok = await login(username, password);
    if (ok) navigate("/todos", { replace: true });
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-heading">
        <p className="auth-eyebrow">Welcome back</p>
        <h1 id="login-heading">Log in</h1>
        {state?.message && <p className="alert">{state.message}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button" type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
