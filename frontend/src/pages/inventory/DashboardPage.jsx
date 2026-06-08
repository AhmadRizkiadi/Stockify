import { EmptyRow } from "../../components/ui/EmptyRow";
import { Metric } from "../../components/ui/Metric";
import { Notice } from "../../components/ui/Notice";
import { TableHeader } from "../../components/ui/TableHeader";
import { useApiResource } from "../../hooks/useApiResource";
import { useAuth } from "../../hooks/useAuth";
import { formatDate, formatMoney } from "../../utils/format";

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

  return (
    <section className="page-grid">
      <Notice error={error} loading={loading} />
      <div className="metric-strip">
        <Metric
          icon="package"
          label="Products"
          value={loading ? "-" : summary.totalProducts || 0}
          hint="Active product lines"
        />
        <Metric
          icon="tag"
          label="Categories"
          value={loading ? "-" : summary.totalCategories || 0}
          hint="Inventory groups"
        />
        <Metric
          icon="dashboard"
          label="Units on hand"
          value={loading ? "-" : summary.totalStock || 0}
          hint="Available quantity"
        />
        <Metric
          icon="history"
          label="Inventory value"
          value={loading ? "-" : formatMoney(summary.inventoryValue)}
          hint="Current stock valuation"
        />
      </div>

      <div className="dashboard-board">
        <section className="visual-ledger">
          <div>
            <p className="overline">Low stock watch</p>
            <h2>{summary.lowStockCount || 0} product lines need attention</h2>
          </div>
          <div className="stock-bars" aria-label="Low stock chart">
            {(lowStock.length
              ? lowStock
              : [{ name: "No low stock", stock: 0 }]
            ).map((product) => (
              <div key={product._id || product.name}>
                <span>{product.name}</span>
                <i
                  style={{
                    "--bar-size": `${Math.max(
                      8,
                      Math.min(100, product.stock || 8)
                    )}%`,
                  }}
                />
                <b>{product.stock || 0}</b>
              </div>
            ))}
          </div>
        </section>

        <section className="table-surface">
          <TableHeader
            title="Recent transactions"
            actionLabel="Refresh"
            onAction={reload}
          />
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((item) => (
                <tr key={item._id}>
                  <td>
                    <span className={`status ${item.type}`}>{item.type}</span>
                  </td>
                  <td>{item.product?.name || "-"}</td>
                  <td>{item.quantity}</td>
                  <td>{formatDate(item.createdAt)}</td>
                </tr>
              ))}
              {!recent.length && (
                <EmptyRow columns={4} label="No transactions yet" />
              )}
            </tbody>
          </table>
        </section>
      </div>
    </section>
  );
}
