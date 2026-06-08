import { useState } from "react";
import { EmptyRow } from "../../components/ui/EmptyRow";
import { Notice } from "../../components/ui/Notice";
import { TableHeader } from "../../components/ui/TableHeader";
import { useApiResource } from "../../hooks/useApiResource";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../../utils/format";

export function CategoriesPage() {
  const { api } = useAuth();
  const { data, error, loading, reload } = useApiResource(
    api,
    "/categories",
    []
  );
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
        setMessage("Category updated");
      } else {
        await api.post("/categories", form);
        setMessage("Category created");
      }

      setForm({ name: "", description: "" });
      setEditingId("");
      reload();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to save category");
    }
  };

  const edit = (category) => {
    setEditingId(category._id);
    setForm({ name: category.name, description: category.description || "" });
  };

  const remove = async (category) => {
    if (!confirm(`Delete ${category.name}?`)) return;

    try {
      await api.delete(`/categories/${category._id}`);
      setMessage("Category deleted");
      reload();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to delete category");
    }
  };

  return (
    <section className="split-workspace">
      <div className="table-surface">
        <TableHeader
          title="Category register"
          actionLabel="Reload"
          onAction={reload}
        />
        <Notice error={error} loading={loading} />
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((category) => (
              <tr key={category._id}>
                <td>{category.name}</td>
                <td>{category.description || "-"}</td>
                <td>{formatDate(category.updatedAt)}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => edit(category)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => remove(category)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!data.length && <EmptyRow columns={4} label="No categories yet" />}
          </tbody>
        </table>
      </div>

      <aside className="form-panel">
        <h2>{editingId ? "Edit category" : "Add category"}</h2>
        <form className="form-stack" onSubmit={submit}>
          <label>
            <span>Name</span>
            <input
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              required
            />
          </label>
          <label>
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
          </label>
          <button className="primary-action" type="submit">
            Save category
          </button>
        </form>
        {message && <p className="notice">{message}</p>}
      </aside>
    </section>
  );
}
