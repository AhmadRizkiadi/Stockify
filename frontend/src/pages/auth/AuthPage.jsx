import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function AuthPage() {
  const { api, saveSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);
      saveSession(data.data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to continue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-canvas">
      <section className="auth-panel" aria-label="Authentication">
        <div className="brand-lockup">
          <span className="brand-mark">S</span>
          <div>
            <strong>Stockify</strong>
            <span>Inventory control surface</span>
          </div>
        </div>

        <div className="auth-grid">
          <div className="auth-copy">
            <p className="overline">Operator console</p>
            <h1>Sign in to stockroom</h1>
            <p>
              Track products, stock movements, categories, and low-stock signals
              from one workspace.
            </p>
          </div>

          <form className="form-stack" onSubmit={submit}>
            <label>
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                placeholder="admin@stockify.local"
                required
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                placeholder="stockify123"
                required
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button className="primary-action" type="submit" disabled={loading}>
              {loading ? "Working..." : "Login"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
