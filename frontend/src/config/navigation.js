export const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { path: "/products", label: "Products", icon: "package" },
  { path: "/categories", label: "Categories", icon: "tag" },
  { path: "/stock-in", label: "Stock In", icon: "arrowDown" },
  { path: "/stock-out", label: "Stock Out", icon: "arrowUp" },
  {
    path: "/transactions",
    label: "Transactions",
    icon: "history",
  },
  {
    path: "/users",
    label: "Users",
    icon: "users",
    adminOnly: true,
  },
];
