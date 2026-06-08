import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProductForm } from "../../components/products/ProductForm";
import { Notice } from "../../components/ui/Notice";
import { useApiResource } from "../../hooks/useApiResource";
import { useAuth } from "../../hooks/useAuth";

const emptyProduct = {
  name: "",
  sku: "",
  category: "",
  stock: 0,
  minimumStock: 5,
  unit: "pcs",
  price: 0,
  description: "",
};

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const isEdit = Boolean(id);
  const [message, setMessage] = useState("");
  const { data: categories } = useApiResource(api, "/categories", []);
  const {
    data: product,
    error,
    loading,
  } = useApiResource(api, isEdit ? `/products/${id}` : null, null);

  const title = isEdit ? "Edit product" : "Create product";

  const canSubmit = useMemo(() => !isEdit || product, [isEdit, product]);

  return (
    <section className="form-page">
      <div className="form-panel">
        <div className="form-heading">
          <div>
            <p className="overline">Products</p>
            <h2>{title}</h2>
          </div>
          <Link className="toolbar-action is-secondary" to="/products">
            Back
          </Link>
        </div>
        <Notice error={error} loading={isEdit && loading} />
        {canSubmit && (
          <ProductEditor
            key={id || "create"}
            api={api}
            categories={categories}
            id={id}
            isEdit={isEdit}
            navigate={navigate}
            product={product}
            setMessage={setMessage}
          />
        )}
        {message && <p className="notice is-error">{message}</p>}
      </div>
    </section>
  );
}

function toProductForm(product) {
  if (!product) return emptyProduct;

  return {
    name: product.name || "",
    sku: product.sku || "",
    category: product.category || "",
    stock: product.stock || 0,
    minimumStock: product.minimumStock || 0,
    unit: product.unit || "pcs",
    price: product.price || 0,
    description: product.description || "",
  };
}

function ProductEditor({
  api,
  categories,
  id,
  isEdit,
  navigate,
  product,
  setMessage,
}) {
  const [form, setForm] = useState(() => toProductForm(product));
  const [file, setFile] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      if (file) payload.append("image", file);

      if (isEdit) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post("/products", payload);
      }

      navigate("/products", {
        replace: true,
        state: { message: isEdit ? "Product updated" : "Product created" },
      });
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to save product");
    }
  };

  return (
    <ProductForm
      form={form}
      setForm={setForm}
      categories={categories}
      onSubmit={submit}
      onFile={setFile}
      submitLabel={isEdit ? "Update product" : "Create product"}
    />
  );
}
