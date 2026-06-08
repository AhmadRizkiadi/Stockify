import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { api, saveSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = isRegister
        ? form
        : { email: form.email, password: form.password };
      const { data } = await api.post(
        isRegister ? "/auth/register" : "/auth/login",
        payload
      );
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
            <h1>{isRegister ? "Create an account" : "Sign in to stockroom"}</h1>
            <p>
              Track products, stock movements, categories, and low-stock signals
              from one workspace.
            </p>
          </div>

          <form className="form-stack" onSubmit={submit}>
            {isRegister && (
              <label>
                <span>Name</span>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Admin Stockify"
                  required
                />
              </label>
            )}

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

            {isRegister && (
              <label>
                <span>Role</span>
                <select
                  value={form.role}
                  onChange={(event) =>
                    setForm({ ...form, role: event.target.value })
                  }
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            )}

            {error && <p className="form-error">{error}</p>}

            <button className="primary-action" type="submit" disabled={loading}>
              {loading ? "Working..." : isRegister ? "Register" : "Login"}
            </button>

            <Link
              className="auth-switch"
              to={isRegister ? "/login" : "/register"}
            >
              {isRegister ? "Already have an account" : "Create staff account"}
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}
