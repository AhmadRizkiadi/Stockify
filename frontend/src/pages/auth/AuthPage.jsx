import { useState } from "react";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const { Text, Title } = Typography;

export function AuthPage() {
  const { api, saveSession } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (values) => {
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", values);
      saveSession(data.data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to continue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-canvas">
      <section className="auth-panel" aria-label="Authentication">
        <div className="auth-intel">
          <div className="brand-plate auth-brand">
            <span className="brand-sigil">S</span>
            <span>
              <strong>Stockify</strong>
              <small>Inventory command surface</small>
            </span>
          </div>

          <div className="auth-statement">
            <Text className="eyebrow">Restricted access</Text>
            <Title level={1}>Sign in to the stockroom</Title>
            <p>
              Operators get product counts, stock movement controls, and
              exception lists without a public sign-up door.
            </p>
          </div>

          <div className="auth-ledger" aria-hidden="true">
            <span>SKU</span>
            <span>ON HAND</span>
            <span>REORDER</span>
            <strong>EL-PRN-014</strong>
            <strong>4</strong>
            <strong>6</strong>
          </div>
        </div>

        <div className="auth-form-surface">
          <Text className="eyebrow">Operator login</Text>
          <Title level={2}>Welcome back</Title>

          {error && (
            <Alert
              className="form-alert"
              type="error"
              message={error}
              showIcon
            />
          )}

          <Form layout="vertical" size="large" onFinish={submit}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Use a valid email address" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="admin@stockify.local"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Password is required" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="stockify123"
                autoComplete="current-password"
              />
            </Form.Item>

            <Button
              block
              type="primary"
              htmlType="submit"
              loading={loading}
              className="submit-button"
            >
              Login
            </Button>
          </Form>
        </div>
      </section>
    </main>
  );
}
