import { useState } from "react";
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Drawer,
  Empty,
  Form,
  Input,
  Popconfirm,
  Space,
  Table,
  Typography,
} from "antd";
import { Notice } from "../../components/ui/Notice";
import { useApiResource } from "../../hooks/useApiResource";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../../utils/format";

const { Text, Title } = Typography;

export function CategoriesPage() {
  const { api } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, error, loading, pagination, reload } = useApiResource(
    api,
    `/categories?page=${page}&limit=${limit}`,
    []
  );
  const [editingId, setEditingId] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const submit = async (values) => {
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, values);
        message.success("Category updated");
      } else {
        await api.post("/categories", values);
        message.success("Category created");
      }

      closeDrawer();
      reload();
    } catch (err) {
      message.error(err.response?.data?.message || "Unable to save category");
    }
  };

  const edit = (category) => {
    setEditingId(category._id);
    form.setFieldsValue({
      name: category.name,
      description: category.description || "",
    });
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingId("");
    form.resetFields();
  };

  const remove = async (category) => {
    try {
      await api.delete(`/categories/${category._id}`);
      message.success("Category deleted");
      if (data.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        reload();
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Unable to delete category");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (value) => value || "-",
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      width: 180,
      render: formatDate,
    },
    {
      title: "Action",
      width: 130,
      render: (_, category) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => edit(category)} />
          <Popconfirm
            title={`Delete ${category.name}?`}
            description="Only unused categories can be deleted."
            okButtonProps={{ danger: true }}
            onConfirm={() => remove(category)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <section className="page-stack">
      <Card
        className="data-card"
        title="Category register"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={reload}>
              Reload
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsDrawerOpen(true)}
            >
              Add category
            </Button>
          </Space>
        }
      >
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
            onChange: (nextPage, nextLimit) => {
              setPage(nextPage);
              setLimit(nextLimit);
            },
          }}
          locale={{
            emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No categories yet" />,
          }}
          scroll={{ x: 700 }}
        />
      </Card>

      <Drawer
        title={editingId ? "Edit category" : "Add category"}
        placement="right"
        width={400}
        onClose={closeDrawer}
        open={isDrawerOpen}
        destroyOnClose
      >
        <Space direction="vertical" size={2} style={{ marginBottom: 16 }}>
          <Text className="eyebrow">Category control</Text>
          <Title level={4}>{editingId ? "Edit category" : "Add category"}</Title>
        </Space>
        <Form
          form={form}
          layout="vertical"
          onFinish={submit}
          className="inventory-form"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Category name is required" }]}
          >
            <Input placeholder="Packaging" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={4} placeholder="Boxes, wrap, and labels" />
          </Form.Item>
          <Space className="form-actions" style={{ width: "100%", justifyContent: "flex-end", marginTop: 24 }}>
            <Button onClick={closeDrawer}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Save category
            </Button>
          </Space>
        </Form>
      </Drawer>
    </section>
  );
}
