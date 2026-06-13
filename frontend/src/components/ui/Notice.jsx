import { Alert, Progress } from "antd";

export function Notice({ error, loading }) {
  if (loading) {
    return <Progress percent={70} showInfo={false} status="active" />;
  }

  if (error) {
    return <Alert className="form-alert" type="error" message={error} showIcon />;
  }

  return null;
}
