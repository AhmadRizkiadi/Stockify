import { useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppstoreOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  HistoryOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  ProductOutlined,
  TagsOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Drawer,
  Dropdown,
  Grid,
  Layout,
  Menu,
  Space,
  Typography,
} from "antd";
import { navItems } from "../config/navigation";
import { useAuth } from "../hooks/useAuth";

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const navIcons = {
  dashboard: <AppstoreOutlined />,
  package: <ProductOutlined />,
  tag: <TagsOutlined />,
  arrowDown: <ArrowDownOutlined />,
  arrowUp: <ArrowUpOutlined />,
  history: <HistoryOutlined />,
  users: <TeamOutlined />,
};

function resolveActiveKey(pathname) {
  if (pathname.startsWith("/products")) return "/products";
  if (pathname.startsWith("/categories")) return "/categories";
  if (pathname.startsWith("/transactions")) return "/transactions";
  return pathname;
}

function NavigationMenu({ items, activeKey, onSelect }) {
  return (
    <Menu
      className="stockify-menu"
      mode="inline"
      theme="dark"
      selectedKeys={[activeKey]}
      onClick={onSelect}
      items={items.map((item) => ({
        key: item.path,
        icon: navIcons[item.icon],
        label: <Link to={item.path}>{item.label}</Link>,
      }))}
    />
  );
}

export function InventoryLayout() {
  const { api, session, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const visibleNav = navItems.filter(
    (item) => !item.adminOnly || session?.role === "admin"
  );
  const activeKey = resolveActiveKey(location.pathname);
  const pageTitle =
    visibleNav.find((item) => item.path === activeKey)?.label || "Inventory";
  const isMobile = !screens.lg;

  const dropdownItems = useMemo(
    () => [
      {
        key: "logout",
        danger: true,
        icon: <LogoutOutlined />,
        label: "Logout",
      },
    ],
    []
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

  const handleMenuSelect = () => {
    if (isMobile) setDrawerOpen(false);
  };

  const sidebar = (
    <div className="shell-sidebar">
      <Link className="brand-plate" to="/dashboard" onClick={handleMenuSelect}>
        <span className="brand-sigil">S</span>
        <span>
          <strong>Stockify</strong>
          <small>Warehouse console</small>
        </span>
      </Link>

      <NavigationMenu
        items={visibleNav}
        activeKey={activeKey}
        onSelect={handleMenuSelect}
      />
    </div>
  );

  return (
    <Layout className="app-shell">
      {!isMobile && (
        <Sider width={276} className="app-sider">
          {sidebar}
        </Sider>
      )}

      <Drawer
        width={292}
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        className="mobile-nav-drawer"
        closable={false}
      >
        {sidebar}
      </Drawer>

      <Layout className="app-main">
        <Header className="app-header">
          <Space size={12} align="center">
            {isMobile && (
              <Button
                icon={<MenuFoldOutlined />}
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation"
              />
            )}
            <div>
              <Text className="eyebrow">Signed in as {session.role}</Text>
              <Title level={2}>{pageTitle}</Title>
            </div>
          </Space>

          <Dropdown
            menu={{
              items: dropdownItems,
              onClick: ({ key }) => {
                if (key === "logout") handleLogout();
              },
            }}
            trigger={["click"]}
          >
            <Button className="profile-button">
              <Avatar size={30}>{session.name?.slice(0, 1) || "U"}</Avatar>
              <span className="profile-copy">
                <strong>{session.name}</strong>
                <small>{session.email}</small>
              </span>
            </Button>
          </Dropdown>
        </Header>

        <Content className="workbench">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
