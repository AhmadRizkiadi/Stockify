import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import {
  Alert,
  App,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Statistic,
  Typography,
} from "antd";
import { useApiResource } from "../../hooks/useApiResource";
import { useAuth } from "../../hooks/useAuth";

const { Text, Title } = Typography;

export function StockMovePage({ type }) {
  const { api } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const {
    data: products,
    error,
    loading,
    reload,
  } = useApiResource(api, "/products?limit=100&sort=nameAsc", []);
  const isIn = type === "in";
  const selectedProductId = Form.useWatch("product", form);
  const selectedProduct = products.find((product) => product._id === selectedProductId);

  const submit = async (values) => {
    try {
      await api.post(`/stock/${type}`, values);
      message.success(isIn ? "Stock in recorded" : "Stock out recorded");
      form.resetFields();
      reload();
    } catch (err) {
      message.error(err.response?.data?.message || "Unable to record stock");
    }
  };

  return (
    <section className="stock-workspace">
      <Card className="side-card">
        <Space direction="vertical" size={2}>
          <Text className="eyebrow">Stock movement</Text>
          <Title level={4}>{isIn ? "Receive stock" : "Issue stock"}</Title>
        </Space>
        {error && <Alert className="form-alert" type="error" message={error} showIcon />}
        <Form
          form={form}
          layout="vertical"
          initialValues={{ quantity: 1, note: "" }}
          onFinish={submit}
          className="inventory-form"
        >
          <Form.Item
            label="Product"
            name="product"
            rules={[{ required: true, message: "Product is required" }]}
          >
            <Select
              showSearch
              loading={loading}
              placeholder="Select product"
              optionFilterProp="label"
              options={products.map((product) => ({
                label: `${product.name} - ${product.stock} ${product.unit}`,
                value: product._id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[{ required: true, message: "Quantity is required" }]}
          >
            <InputNumber min={1} precision={0} />
          </Form.Item>

          <Form.Item label="Note" name="note">
            <Input.TextArea
              rows={4}
              placeholder={isIn ? "Supplier shipment" : "Sales order"}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            icon={isIn ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
          >
            {isIn ? "Record stock in" : "Record stock out"}
          </Button>
        </Form>
      </Card>

      <Card className="movement-card">
        <Space direction="vertical" size={18}>
          <Text className="eyebrow">Movement rules</Text>
          <Title level={3}>
            {isIn
              ? "Incoming stock increases availability"
              : "Outgoing stock checks inventory first"}
          </Title>
          <Text type="secondary">
            Every movement creates a transaction record with product, quantity,
            type, operator, and timestamp.
          </Text>
          <div className="movement-stats">
            <Statistic
              title="Selected stock"
              value={selectedProduct?.stock ?? "-"}
              suffix={selectedProduct?.unit || ""}
            />
            <Statistic
              title="Minimum stock"
              value={selectedProduct?.minimumStock ?? "-"}
              suffix={selectedProduct?.unit || ""}
            />
          </div>
          {!isIn && (
            <Alert
              type="warning"
              showIcon
              message="Stock out cannot exceed the selected product quantity."
            />
          )}
        </Space>
      </Card>
    </section>
  );
}
