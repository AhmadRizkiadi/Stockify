import { useState } from "react";
import { Notice } from "../../components/ui/Notice";
import { useApiResource } from "../../hooks/useApiResource";
import { useAuth } from "../../hooks/useAuth";

export function StockMovePage({ type }) {
  const { api } = useAuth();
  const {
    data: products,
    error,
    loading,
    reload,
  } = useApiResource(api, "/products", []);
  const [form, setForm] = useState({ product: "", quantity: 1, note: "" });
  const [message, setMessage] = useState("");
  const isIn = type === "in";

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await api.post(`/stock/${type}`, form);
      setMessage(isIn ? "Stock in recorded" : "Stock out recorded");
      setForm({ product: "", quantity: 1, note: "" });
      reload();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to record stock");
    }
  };

  return (
    <section className="stock-workspace">
      <form className="form-panel form-stack" onSubmit={submit}>
        <h2>{isIn ? "Receive stock" : "Issue stock"}</h2>
        <Notice error={error} loading={loading} />
        <label>
          <span>Product</span>
          <select
            value={form.product}
            onChange={(event) =>
              setForm({ ...form, product: event.target.value })
            }
            required
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name} - {product.stock} {product.unit}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Quantity</span>
          <input
            type="number"
            min="1"
            value={form.quantity}
            onChange={(event) =>
              setForm({ ...form, quantity: event.target.value })
            }
            required
          />
        </label>
        <label>
          <span>Note</span>
          <textarea
            value={form.note}
            onChange={(event) => setForm({ ...form, note: event.target.value })}
            placeholder={isIn ? "Supplier shipment" : "Sales order"}
          />
        </label>
        <button className="primary-action" type="submit">
          {isIn ? "Record stock in" : "Record stock out"}
        </button>
        {message && <p className="notice">{message}</p>}
      </form>

      <div className="stock-rules">
        <p className="overline">Movement rules</p>
        <h2>
          {isIn
            ? "Incoming stock increases availability"
            : "Outgoing stock checks inventory first"}
        </h2>
        <p>
          Every movement creates a transaction record with product, quantity,
          type, operator, and timestamp.
        </p>
      </div>
    </section>
  );
}
