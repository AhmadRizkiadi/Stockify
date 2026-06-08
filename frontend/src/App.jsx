import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { InventoryLayout } from "./layouts/InventoryLayout";
import { AuthPage } from "./pages/auth/AuthPage";
import { CategoriesPage } from "./pages/inventory/CategoriesPage";
import { DashboardPage } from "./pages/inventory/DashboardPage";
import { ProductFormPage } from "./pages/inventory/ProductFormPage";
import { ProductsPage } from "./pages/inventory/ProductsPage";
import { StockMovePage } from "./pages/inventory/StockMovePage";
import { TransactionsPage } from "./pages/inventory/TransactionsPage";
import { UsersPage } from "./pages/inventory/UsersPage";

function GuestRoute({ children }) {
  const { session } = useAuth();

  return session ? <Navigate to="/dashboard" replace /> : children;
}

function ProtectedRoute({ children }) {
  const { session } = useAuth();

  return session ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { session } = useAuth();

  return session?.role === "admin" ? (
    children
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

function AppRoutes() {
  const { session } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <AuthPage mode="login" />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <AuthPage mode="register" />
          </GuestRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <InventoryLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/create" element={<ProductFormPage />} />
        <Route path="products/:id/edit" element={<ProductFormPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="stock-in" element={<StockMovePage type="in" />} />
        <Route path="stock-out" element={<StockMovePage type="out" />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route
          path="users"
          element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
      <Route
        path="/auth/login"
        element={<Navigate to="/login" replace />}
      />
      <Route
        path="/auth/register"
        element={<Navigate to="/register" replace />}
      />
      <Route
        path="/inventory/*"
        element={<Navigate to="/dashboard" replace />}
      />
      <Route
        path="*"
        element={
          <Navigate
            to={session ? "/dashboard" : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
