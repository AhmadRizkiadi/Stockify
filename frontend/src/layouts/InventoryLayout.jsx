import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "../components/ui/Icon";
import { navItems } from "../config/navigation";
import { useAuth } from "../hooks/useAuth";

export function InventoryLayout() {
  const { api, session, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const visibleNav = navItems.filter(
    (item) => !item.adminOnly || session?.role === "admin"
  );

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // The local session still needs to be cleared if the API is unavailable.
    }

    logout();
    navigate("/login", { replace: true });
  };

  const pageTitle =
    visibleNav.find((item) =>
      item.path === "/products"
        ? location.pathname.startsWith("/products")
        : item.path === location.pathname
    )?.label ||
    "Inventory";

  return (
    <div className="app-shell">
      <aside className="side-rail">
        <Link className="side-brand" to="/dashboard">
          <span className="brand-mark">S</span>
          <span>Stockify</span>
        </Link>

        <nav className="nav-list" aria-label="Main navigation">
          {visibleNav.map((item) => (
            <Link
              key={item.path}
              className={
                item.path === "/products"
                  ? location.pathname.startsWith("/products")
                    ? "is-active"
                    : ""
                  : location.pathname === item.path
                    ? "is-active"
                    : ""
              }
              to={item.path}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="workbench">
        <header className="topbar">
          <div>
            <p className="overline">Signed in as {session.role}</p>
            <h1>{pageTitle}</h1>
          </div>
          <div className="profile-pill">
            <span>{session.name?.slice(0, 1) || "U"}</span>
            <div>
              <strong>{session.name}</strong>
              <small>{session.email}</small>
            </div>
            <button type="button" onClick={handleLogout}>
              <Icon name="logout" size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
