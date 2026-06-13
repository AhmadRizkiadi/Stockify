import { Navigate, Route, Routes } from "react-router-dom";
import { ConfigProvider, App as AntApp, theme } from "antd";
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
            <AuthPage />
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
        element={<Navigate to="/login" replace />}
      />
      <Route path="/register" element={<Navigate to="/login" replace />} />
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
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#0f766e",
          colorInfo: "#2563eb",
          colorSuccess: "#0f766e",
          colorWarning: "#b45309",
          colorError: "#b42318",
          colorTextBase: "#17211d",
          colorBgBase: "#f6f8f4",
          colorBorder: "#d9e1d8",
          borderRadius: 6,
          fontFamily:
            '"Aptos", "Segoe UI Variable Text", "Segoe UI", sans-serif',
          fontSize: 14,
          controlHeight: 38,
        },
        components: {
          Button: {
            borderRadius: 6,
            fontWeight: 650,
            primaryShadow: "none",
          },
          Card: {
            borderRadiusLG: 8,
            boxShadowTertiary: "0 1px 0 rgba(23, 33, 29, 0.04)",
          },
          Table: {
            borderColor: "#d9e1d8",
            headerBg: "#eef3eb",
            headerColor: "#4b5b54",
            rowHoverBg: "#f3f7f0",
          },
          Layout: {
            bodyBg: "#f6f8f4",
            siderBg: "#17211d",
            triggerBg: "#17211d",
          },
          Menu: {
            darkItemBg: "#17211d",
            darkItemSelectedBg: "#0f766e",
            darkItemHoverBg: "#22342e",
            darkItemColor: "#cbd8d0",
            darkItemSelectedColor: "#ffffff",
          },
        },
      }}
    >
      <AntApp>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
