import { useMemo, useState } from "react";
import { EmptyRow } from "../../components/ui/EmptyRow";
import { Icon } from "../../components/ui/Icon";
import { Notice } from "../../components/ui/Notice";
import { TableHeader } from "../../components/ui/TableHeader";
import { useApiResource } from "../../hooks/useApiResource";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../../utils/format";

export function TransactionsPage() {
  const { api } = useAuth();
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    product: "",
    search: "",
    sort: "newest",
    type: "",
  });
  const endpoint = useMemo(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    return `/transactions${params.toString() ? `?${params.toString()}` : ""}`;
  }, [filters]);
  const { data, error, loading, reload } = useApiResource(
    api,
    endpoint,
    []
  );
  const { data: products } = useApiResource(api, "/products", []);

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      product: "",
      search: "",
      sort: "newest",
      type: "",
    });
  };

  return (
    <section className="table-surface">
      <TableHeader
        title="Stock movement history"
        actionLabel="Reload"
        onAction={reload}
      />
      <div className="toolbar filter-toolbar">
        <Icon name="search" size={17} />
        <input
          value={filters.search}
          onChange={(event) => setFilter("search", event.target.value)}
          placeholder="Search product, SKU, operator, or note"
        />
        <select
          value={filters.type}
          onChange={(event) => setFilter("type", event.target.value)}
          aria-label="Filter by transaction type"
        >
          <option value="">All types</option>
          <option value="IN">Stock in</option>
          <option value="OUT">Stock out</option>
        </select>
        <select
          value={filters.product}
          onChange={(event) => setFilter("product", event.target.value)}
          aria-label="Filter by product"
        >
          <option value="">All products</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(event) => setFilter("dateFrom", event.target.value)}
          aria-label="Filter from date"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(event) => setFilter("dateTo", event.target.value)}
          aria-label="Filter to date"
        />
        <select
          value={filters.sort}
          onChange={(event) => setFilter("sort", event.target.value)}
          aria-label="Sort transactions"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="quantityAsc">Quantity low-high</option>
          <option value="quantityDesc">Quantity high-low</option>
        </select>
        <button className="toolbar-reset" type="button" onClick={resetFilters}>
          Reset
        </button>
      </div>
      <Notice error={error} loading={loading} />
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Product</th>
            <th>SKU</th>
            <th>Quantity</th>
            <th>Operator</th>
            <th>Note</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item._id}>
              <td>
                <span className={`status ${item.type}`}>{item.type}</span>
              </td>
              <td>{item.product?.name || "-"}</td>
              <td>{item.product?.sku || "-"}</td>
              <td>{item.quantity}</td>
              <td>{item.createdBy?.name || "-"}</td>
              <td>{item.note || "-"}</td>
              <td>{formatDate(item.createdAt)}</td>
            </tr>
          ))}
          {!data.length && <EmptyRow columns={7} label="No movements yet" />}
        </tbody>
      </table>
    </section>
  );
}
