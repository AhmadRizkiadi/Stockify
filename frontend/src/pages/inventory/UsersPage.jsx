import { useState } from "react";
import { DeleteOutlined, ReloadOutlined, UserAddOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Drawer,
  Empty,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { Notice } from "../../components/ui/Notice";
import { useApiResource } from "../../hooks/useApiResource";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../../utils/format";

const { Text, Title } = Typography;

export function UsersPage() {
  const { api, session } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, error, loading, pagination, reload } = useApiResource(
    api,
    `/users?page=${page}&limit=${limit}`,
    []
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const create = async (values) => {
    try {
      await api.post("/users", values);
      closeDrawer();
      message.success("User created");
      reload();
    } catch (err) {
      message.error(err.response?.data?.message || "Unable to create user");
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    form.resetFields();
  };

  const updateRole = async (user, role) => {
    try {
      await api.put(`/users/${user._id}`, { role });
      message.success("User role updated");
      reload();
    } catch (err) {
      message.error(err.response?.data?.message || "Unable to update user");
    }
  };

  const remove = async (user) => {
    try {
      await api.delete(`/users/${user._id}`);
      message.success("User deleted");
      if (data.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        reload();
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Unable to delete user");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (value, user) => (
        <Space direction="vertical" size={0}>
          <Text strong>{value}</Text>
          <Text type="secondary">{user.email}</Text>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      width: 160,
      render: (role, user) => (
        <Select
          value={role}
          disabled={session.id === user._id}
          onChange={(value) => updateRole(user, value)}
          options={[
            { label: "Staff", value: "staff" },
            { label: "Admin", value: "admin" },
          ]}
        />
      ),
    },
    {
      title: "Status",
      width: 120,
      render: (_, user) =>
        session.id === user._id ? <Tag color="blue">Current user</Tag> : <Tag>Active</Tag>,
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      width: 180,
      render: formatDate,
    },
    {
      title: "Action",
      width: 100,
      render: (_, user) => (
        <Popconfirm
          title={`Delete ${user.name}?`}
          description="This account will no longer be able to sign in."
          okButtonProps={{ danger: true }}
          disabled={session.id === user._id}
          onConfirm={() => remove(user)}
        >
          <Button danger icon={<DeleteOutlined />} disabled={session.id === user._id} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <section className="page-stack">
      <Card
        className="data-card"
        title="User access"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={reload}>
              Reload
            </Button>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setIsDrawerOpen(true)}
            >
              Add user
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
            emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No users found" />,
          }}
          scroll={{ x: 780 }}
        />
      </Card>

      <Drawer
        title="Create user"
        placement="right"
        width={400}
        onClose={closeDrawer}
        open={isDrawerOpen}
        destroyOnClose
      >
        <Space direction="vertical" size={2} style={{ marginBottom: 16 }}>
          <Text className="eyebrow">Admin control</Text>
          <Title level={4}>Create user</Title>
        </Space>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ role: "staff" }}
          onFinish={create}
          className="inventory-form"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="Staff Gudang" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Use a valid email address" },
            ]}
          >
            <Input placeholder="staff@stockify.local" />
          </Form.Item>
          <Form.Item
            label="Temporary password"
            name="password"
            rules={[
              { required: true, message: "Password is required" },
              { min: 6, message: "Use at least 6 characters" },
            ]}
          >
            <Input.Password placeholder="secret123" />
          </Form.Item>
          <Form.Item label="Role" name="role">
            <Select
              options={[
                { label: "Staff", value: "staff" },
                { label: "Admin", value: "admin" },
              ]}
            />
          </Form.Item>
          <Space className="form-actions" style={{ width: "100%", justifyContent: "flex-end", marginTop: 24 }}>
            <Button onClick={closeDrawer} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" icon={<UserAddOutlined />} htmlType="submit">
              Create user
            </Button>
          </Space>
        </Form>
      </Drawer>
    </section>
  );
}
