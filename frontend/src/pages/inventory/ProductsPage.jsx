import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  App,
  Avatar,
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { Notice } from "../../components/ui/Notice";
import { useApiResource } from "../../hooks/useApiResource";
import { useAuth } from "../../hooks/useAuth";
import { formatMoney } from "../../utils/format";
import { getOptimizedImageUrl } from "../../utils/image";

const { Text } = Typography;

export function ProductsPage() {
  const { api } = useAuth();
  const { message } = App.useApp();
  const location = useLocation();
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    sort: "newest",
    stockStatus: "",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const endpoint = useMemo(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set("page", page);
    params.set("limit", limit);

    return `/products?${params.toString()}`;
  }, [filters, limit, page]);
  const {
    data: products,
    error,
    loading,
    pagination,
    reload,
  } = useApiResource(api, endpoint, []);
  const { data: categories } = useApiResource(api, "/categories?limit=100", []);

  useEffect(() => {
    if (location.state?.message) message.success(location.state.message);
  }, [location.state?.message, message]);

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value || "" }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      search: "",
      sort: "newest",
      stockStatus: "",
    });
    setPage(1);
  };

  const remove = (product) => {
    Modal.confirm({
      title: `Delete ${product.name}?`,
      content: "This removes the product from the inventory catalogue.",
      okText: "Delete",
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await api.delete(`/products/${product._id}`);
          message.success("Product deleted");
          if (products.length === 1 && page > 1) {
            setPage((current) => current - 1);
          } else {
            reload();
          }
        } catch (err) {
          message.error(err.response?.data?.message || "Unable to delete product");
        }
      },
    });
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      render: (_, product) => (
        <Space>
          <Avatar
            shape="square"
            size={42}
            src={getOptimizedImageUrl(product.imageUrl, 84, 84)}
            className="product-avatar"
          >
            {product.name?.slice(0, 1)}
          </Avatar>
          <Space direction="vertical" size={0}>
            <Text strong>{product.name}</Text>
            <Text type="secondary">{product.description || "No description"}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      width: 130,
      render: (sku) => <Tag>{sku}</Tag>,
    },
    {
      title: "Category",
      dataIndex: "category",
      width: 150,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      width: 150,
      render: (_, product) => {
        const low = product.stock <= product.minimumStock;
        return (
          <Space direction="vertical" size={0}>
            <Tag color={low ? "orange" : "green"}>
              {product.stock} {product.unit}
            </Tag>
            <Text type="secondary">Min {product.minimumStock}</Text>
          </Space>
        );
      },
    },
    {
      title: "Value",
      width: 150,
      render: (_, product) => formatMoney(product.price * product.stock),
    },
    {
      title: "Action",
      width: 150,
      render: (_, product) => (
        <Space>
          <Link to={`/products/${product._id}/edit`}>
            <Button icon={<EditOutlined />} />
          </Link>
          <Button danger icon={<DeleteOutlined />} onClick={() => remove(product)} />
        </Space>
      ),
    },
  ];

  return (
    <section className="page-stack">
      <Card
        className="data-card"
        title="Product catalogue"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={reload}>
              Reload
            </Button>
            <Link to="/products/create">
              <Button type="primary" icon={<PlusOutlined />}>
                Add product
              </Button>
            </Link>
          </Space>
        }
      >
        <div className="filter-rack">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search name, SKU, or category"
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
          />
          <Select
            allowClear
            placeholder="All categories"
            value={filters.category || undefined}
            onChange={(value) => setFilter("category", value)}
            options={categories.map((category) => ({
              label: category.name,
              value: category.name,
            }))}
          />
          <Select
            allowClear
            placeholder="All stock"
            value={filters.stockStatus || undefined}
            onChange={(value) => setFilter("stockStatus", value)}
            options={[
              { label: "Available", value: "available" },
              { label: "Low stock", value: "low" },
              { label: "Out of stock", value: "out" },
            ]}
          />
          <Select
            value={filters.sort}
            onChange={(value) => setFilter("sort", value)}
            options={[
              { label: "Newest", value: "newest" },
              { label: "Name A-Z", value: "nameAsc" },
              { label: "Stock low-high", value: "stockAsc" },
              { label: "Stock high-low", value: "stockDesc" },
              { label: "Price low-high", value: "priceAsc" },
              { label: "Price high-low", value: "priceDesc" },
            ]}
          />
          <Button onClick={resetFilters}>Reset</Button>
        </div>

        <Notice error={error} loading={false} />
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={products}
          loading={loading}
          pagination={{
            current: pagination?.page || page,
            pageSize: pagination?.limit || limit,
            total: pagination?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            onChange: (nextPage, nextLimit) => {
              setPage(nextPage);
              setLimit(nextLimit);
            },
          }}
          locale={{
            emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No products found" />,
          }}
          scroll={{ x: 920 }}
        />
      </Card>
    </section>
  );
}
