import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { EmptyRow } from "../../components/ui/EmptyRow";
import { Icon } from "../../components/ui/Icon";
import { Notice } from "../../components/ui/Notice";
import { TableHeader } from "../../components/ui/TableHeader";
import { useApiResource } from "../../hooks/useApiResource";
import { useAuth } from "../../hooks/useAuth";
import { formatMoney } from "../../utils/format";

export function ProductsPage() {
  const { api } = useAuth();
  const location = useLocation();
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    sort: "newest",
    stockStatus: "",
  });
  const endpoint = useMemo(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    return `/products${params.toString() ? `?${params.toString()}` : ""}`;
  }, [filters]);
  const {
    data: products,
    error,
    loading,
    reload,
  } = useApiResource(api, endpoint, []);
  const { data: categories } = useApiResource(api, "/categories", []);
  const [message, setMessage] = useState(location.state?.message || "");

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      search: "",
      sort: "newest",
      stockStatus: "",
    });
  };

  const remove = async (product) => {
    if (!confirm(`Delete ${product.name}?`)) return;

    try {
      await api.delete(`/products/${product._id}`);
      setMessage("Product deleted");
      reload();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to delete product");
    }
  };

  return (
    <section className="page-grid">
      <div className="table-surface">
        <TableHeader
          title="Product catalogue"
          actionLabel="Reload"
          onAction={reload}
        />
        <div className="toolbar">
          <Icon name="search" size={17} />
          <input
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            placeholder="Search name, SKU, or category"
          />
          <select
            value={filters.category}
            onChange={(event) => setFilter("category", event.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={filters.stockStatus}
            onChange={(event) => setFilter("stockStatus", event.target.value)}
            aria-label="Filter by stock status"
          >
            <option value="">All stock</option>
            <option value="available">Available</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
          <select
            value={filters.sort}
            onChange={(event) => setFilter("sort", event.target.value)}
            aria-label="Sort products"
          >
            <option value="newest">Newest</option>
            <option value="nameAsc">Name A-Z</option>
            <option value="stockAsc">Stock low-high</option>
            <option value="stockDesc">Stock high-low</option>
            <option value="priceAsc">Price low-high</option>
            <option value="priceDesc">Price high-low</option>
          </select>
          <button className="toolbar-reset" type="button" onClick={resetFilters}>
            Reset
          </button>
          <Link className="toolbar-action" to="/products/create">
            Add product
          </Link>
        </div>
        {message && <p className="notice">{message}</p>}
        <Notice error={error} loading={loading} />
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Value</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  <div className="product-cell">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt="" />
                    ) : (
                      <span />
                    )}
                    <strong>{product.name}</strong>
                  </div>
                </td>
                <td>{product.sku}</td>
                <td>{product.category}</td>
                <td>
                  <span
                    className={
                      product.stock <= product.minimumStock ? "stock-low" : ""
                    }
                  >
                    {product.stock} {product.unit}
                  </span>
                </td>
                <td>{formatMoney(product.price * product.stock)}</td>
                <td>
                  <div className="row-actions">
                    <Link to={`/products/${product._id}/edit`}>
                      Edit
                    </Link>
                    <button type="button" onClick={() => remove(product)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!products.length && (
              <EmptyRow columns={6} label="No products found" />
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
