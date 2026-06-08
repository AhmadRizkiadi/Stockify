import { Icon } from "./Icon";

export function Metric({ icon, label, value, hint }) {
  return (
    <article className="metric-card">
      <div className="metric-icon">
        <Icon name={icon} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
    </article>
  );
}
