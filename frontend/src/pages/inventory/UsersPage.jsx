import { useState } from "react";
import { EmptyRow } from "../../components/ui/EmptyRow";
import { Notice } from "../../components/ui/Notice";
import { TableHeader } from "../../components/ui/TableHeader";
import { useApiResource } from "../../hooks/useApiResource";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../../utils/format";

export function UsersPage() {
  const { api, session } = useAuth();
  const { data, error, loading, reload } = useApiResource(api, "/users", []);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
  });

  const create = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await api.post("/users", form);
      setForm({ name: "", email: "", password: "", role: "staff" });
      setMessage("User created");
      reload();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to create user");
    }
  };

  const updateRole = async (user, role) => {
    setMessage("");

    try {
      await api.put(`/users/${user._id}`, { role });
      setMessage("User role updated");
      reload();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to update user");
    }
  };

  const remove = async (user) => {
    if (!confirm(`Delete ${user.name}?`)) return;

    try {
      await api.delete(`/users/${user._id}`);
      setMessage("User deleted");
      reload();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to delete user");
    }
  };

  return (
    <section className="split-workspace">
      <div className="table-surface">
        <TableHeader title="User access" actionLabel="Reload" onAction={reload} />
        <Notice error={error} loading={loading} />
        {message && <p className="notice">{message}</p>}
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(event) => updateRole(user, event.target.value)}
                    disabled={session.id === user._id}
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => remove(user)}
                    disabled={session.id === user._id}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!data.length && <EmptyRow columns={5} label="No users found" />}
          </tbody>
        </table>
      </div>

      <aside className="form-panel">
        <h2>Create user</h2>
        <form className="form-stack" onSubmit={create}>
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
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              required
            />
          </label>
          <label>
            <span>Temporary password</span>
            <input
              type="password"
              minLength="6"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              required
            />
          </label>
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
          <button className="primary-action" type="submit">
            Create user
          </button>
        </form>
      </aside>
    </section>
  );
}
