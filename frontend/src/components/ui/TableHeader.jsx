import { Icon } from "./Icon";

export function TableHeader({ title, actionLabel, onAction }) {
  return (
    <div className="table-header">
      <h2>{title}</h2>
      {onAction && (
        <button type="button" onClick={onAction}>
          <Icon name="refresh" size={15} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
