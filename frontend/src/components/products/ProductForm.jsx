import {
  InboxOutlined,
  NumberOutlined,
  ProductOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
} from "antd";

export function ProductForm({
  form,
  setForm,
  categories,
  onSubmit,
  onFile,
  submitLabel = "Save product",
  loading = false,
}) {
  const categoryOptions = categories.map((category) => ({
    value: category.name,
  }));

  const syncValues = (_, values) => {
    setForm({
      ...form,
      ...values,
      stock: values.stock ?? 0,
      minimumStock: values.minimumStock ?? 5,
      price: values.price ?? 0,
    });
  };

  const uploadProps = {
    beforeUpload(file) {
      onFile(file);
      return false;
    },
    maxCount: 1,
    accept: "image/jpeg,image/png,image/jpg,image/webp",
    onRemove() {
      onFile(null);
    },
  };

  return (
    <Form
      layout="vertical"
      initialValues={form}
      onValuesChange={syncValues}
      onFinish={onSubmit}
      className="inventory-form"
    >
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: "Product name is required" }]}
      >
        <Input prefix={<ProductOutlined />} placeholder="Thermal Label Printer" />
      </Form.Item>

      <Form.Item
        label="SKU"
        name="sku"
        rules={[{ required: true, message: "SKU is required" }]}
      >
        <Input prefix={<NumberOutlined />} placeholder="EL-PRN-014" />
      </Form.Item>

      <Form.Item
        label="Category"
        name="category"
        rules={[{ required: true, message: "Category is required" }]}
      >
        <AutoComplete
          options={categoryOptions}
          placeholder="Electronics"
          filterOption={(inputValue, option) =>
            option.value.toLowerCase().includes(inputValue.toLowerCase())
          }
        >
          <Input prefix={<TagsOutlined />} />
        </AutoComplete>
      </Form.Item>

      <div className="form-grid">
        <Form.Item label="Stock" name="stock">
          <InputNumber min={0} precision={0} />
        </Form.Item>
        <Form.Item label="Minimum stock" name="minimumStock">
          <InputNumber min={0} precision={0} />
        </Form.Item>
      </div>

      <div className="form-grid">
        <Form.Item label="Unit" name="unit">
          <Select
            options={[
              { value: "pcs", label: "pcs" },
              { value: "box", label: "box" },
              { value: "roll", label: "roll" },
              { value: "rim", label: "rim" },
              { value: "unit", label: "unit" },
            ]}
          />
        </Form.Item>
        <Form.Item label="Price" name="price">
          <InputNumber min={0} step={1000} prefix="Rp" />
        </Form.Item>
      </div>

      <Form.Item label="Description" name="description">
        <Input.TextArea rows={4} placeholder="Short operational note" />
      </Form.Item>

      <Form.Item label="Image">
        <Upload.Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Drop product image here</p>
          <p className="ant-upload-hint">JPEG, PNG, JPG, WEBP up to 2 MB</p>
        </Upload.Dragger>
      </Form.Item>

      <Button block type="primary" htmlType="submit" loading={loading}>
        {submitLabel}
      </Button>
    </Form>
  );
}
