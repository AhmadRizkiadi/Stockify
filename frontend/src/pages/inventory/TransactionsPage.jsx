import { useMemo, useState } from "react";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Card, DatePicker, Empty, Input, Select, Table, Tag } from "antd";
import { Notice } from "../../components/ui/Notice";
import { useApiResource } from "../../hooks/useApiResource";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../../utils/format";

const { RangePicker } = DatePicker;

export function TransactionsPage() {
  const { api } = useAuth();
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    product: "",
    search: "",
    sort: "newest",
    type: "",
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

    return `/transactions?${params.toString()}`;
  }, [filters, limit, page]);
  const { data, error, loading, pagination, reload } = useApiResource(
    api,
    endpoint,
    []
  );
  const { data: products } = useApiResource(
    api,
    "/products?limit=100&sort=nameAsc",
    []
  );

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value || "" }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      product: "",
      search: "",
      sort: "newest",
      type: "",
    });
    setPage(1);
  };

  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      width: 100,
      render: (type) => (
        <Tag
          color={type === "IN" ? "green" : "volcano"}
          icon={type === "IN" ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
        >
          {type}
        </Tag>
      ),
    },
    {
      title: "Product",
      dataIndex: ["product", "name"],
      render: (value) => value || "-",
    },
    {
      title: "SKU",
      dataIndex: ["product", "sku"],
      width: 130,
      render: (value) => value || "-",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      width: 110,
    },
    {
      title: "Operator",
      dataIndex: ["createdBy", "name"],
      width: 160,
      render: (value) => value || "-",
    },
    {
      title: "Note",
      dataIndex: "note",
      render: (value) => value || "-",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      width: 180,
      render: formatDate,
    },
  ];

  return (
    <section className="page-stack">
      <Card
        className="data-card"
        title="Stock movement history"
        extra={
          <Button icon={<ReloadOutlined />} onClick={reload}>
            Reload
          </Button>
        }
      >
        <div className="filter-rack filter-rack-wide">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search product, SKU, operator, or note"
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
          />
          <Select
            allowClear
            placeholder="All types"
            value={filters.type || undefined}
            onChange={(value) => setFilter("type", value)}
            options={[
              { label: "Stock in", value: "IN" },
              { label: "Stock out", value: "OUT" },
            ]}
          />
          <Select
            showSearch
            allowClear
            placeholder="All products"
            value={filters.product || undefined}
            onChange={(value) => setFilter("product", value)}
            optionFilterProp="label"
            options={products.map((product) => ({
              label: product.name,
              value: product._id,
            }))}
          />
          <RangePicker
            onChange={(_, dateStrings) => {
              setFilters((current) => ({
                ...current,
                dateFrom: dateStrings[0] || "",
                dateTo: dateStrings[1] || "",
              }));
              setPage(1);
            }}
          />
          <Select
            value={filters.sort}
            onChange={(value) => setFilter("sort", value)}
            options={[
              { label: "Newest", value: "newest" },
              { label: "Oldest", value: "oldest" },
              { label: "Quantity low-high", value: "quantityAsc" },
              { label: "Quantity high-low", value: "quantityDesc" },
            ]}
          />
          <Button onClick={resetFilters}>Reset</Button>
        </div>

        <Notice error={error} loading={false} />
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={data}
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
            emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No movements yet" />,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </section>
  );
}
