import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DatabaseOutlined,
  HistoryOutlined,
  InboxOutlined,
  ProductOutlined,
  TagsOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Empty, Progress, Row, Space, Table, Tag, Typography } from "antd";
import { Notice } from "../../components/ui/Notice";
import { useApiResource } from "../../hooks/useApiResource";
import { useAuth } from "../../hooks/useAuth";
import { formatDate, formatMoney } from "../../utils/format";

const { Text, Title } = Typography;

function metricItems(summary, loading) {
  return [
    {
      icon: <ProductOutlined />,
      label: "Products",
      value: loading ? "-" : summary.totalProducts || 0,
      note: "Active product lines",
    },
    {
      icon: <TagsOutlined />,
      label: "Categories",
      value: loading ? "-" : summary.totalCategories || 0,
      note: "Inventory groups",
    },
    {
      icon: <InboxOutlined />,
      label: "Units on hand",
      value: loading ? "-" : summary.totalStock || 0,
      note: "Available quantity",
    },
    {
      icon: <DatabaseOutlined />,
      label: "Inventory value",
      value: loading ? "-" : formatMoney(summary.inventoryValue),
      note: "Current stock valuation",
    },
  ];
}

export function DashboardPage() {
  const { api } = useAuth();
  const { data, error, loading, reload } = useApiResource(
    api,
    "/dashboard/summary",
    null
  );
  const summary = data || {};
  const lowStock = summary.lowStockProducts || [];
  const recent = summary.recentTransactions || [];
  const maxStock = Math.max(...lowStock.map((product) => product.minimumStock || 1), 1);

  const transactionColumns = [
    {
      title: "Type",
      dataIndex: "type",
      width: 100,
      render: (type) => (
        <Tag
          icon={type === "IN" ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
          color={type === "IN" ? "green" : "volcano"}
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
      title: "Qty",
      dataIndex: "quantity",
      width: 80,
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
      <Notice error={error} loading={loading} />

      <Row gutter={[16, 16]}>
        {metricItems(summary, loading).map((item) => (
          <Col xs={24} sm={12} xl={6} key={item.label}>
            <Card className="metric-card" bordered>
              <Space align="start" size={14} style={{ width: "100%" }}>
                <span className="metric-symbol">{item.icon}</span>
                <span style={{ display: "flex", flexDirection: "column", minWidth: 0, width: "100%" }}>
                  <Text type="secondary" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</Text>
                  <strong className={String(item.value).length > 8 ? "long-value" : ""}>{item.value}</strong>
                  <small style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.note}</small>
                </span>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={9}>
          <Card
            className="watch-card"
            title={
              <Space>
                <WarningOutlined />
                Low stock watch
              </Space>
            }
          >
            <Title level={3}>{summary.lowStockCount || 0} lines need attention</Title>
            <div className="watch-list">
              {lowStock.length ? (
                lowStock.map((product) => {
                  const percent = Math.min(
                    100,
                    Math.round(((product.stock || 0) / maxStock) * 100)
                  );

                  return (
                    <div className="watch-item" key={product._id || product.name}>
                      <Space direction="vertical" size={4}>
                        <Text strong>{product.name}</Text>
                        <Text type="secondary">
                          {product.stock} {product.unit || "pcs"} on hand · min{" "}
                          {product.minimumStock}
                        </Text>
                      </Space>
                      <Progress
                        percent={percent}
                        showInfo={false}
                        strokeColor="#b45309"
                        trailColor="#e7ece4"
                      />
                    </div>
                  );
                })
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No low stock" />
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={15}>
          <Card
            title={
              <Space>
                <HistoryOutlined />
                Recent movements
              </Space>
            }
            extra={
              <Button size="small" onClick={reload}>
                Refresh
              </Button>
            }
          >
            <Table
              rowKey="_id"
              columns={transactionColumns}
              dataSource={recent}
              pagination={false}
              size="middle"
              locale={{
                emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No transactions yet" />,
              }}
              scroll={{ x: 620 }}
            />
          </Card>
        </Col>
      </Row>
    </section>
  );
}
