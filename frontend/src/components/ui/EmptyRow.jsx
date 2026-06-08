export function EmptyRow({ columns, label }) {
  return (
    <tr>
      <td colSpan={columns} className="empty-cell">
        {label}
      </td>
    </tr>
  );
}
