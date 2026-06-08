export function ProductForm({
  form,
  setForm,
  categories,
  onSubmit,
  onFile,
  submitLabel = "Save product",
}) {
  const set = (key, value) => setForm({ ...form, [key]: value });

  return (
    <form className="form-stack" onSubmit={onSubmit}>
      <label>
        <span>Name</span>
        <input
          value={form.name}
          onChange={(event) => set("name", event.target.value)}
          required
        />
      </label>
      <label>
        <span>SKU</span>
        <input
          value={form.sku}
          onChange={(event) => set("sku", event.target.value)}
          required
        />
      </label>
      <label>
        <span>Category</span>
        <input
          list="category-list"
          value={form.category}
          onChange={(event) => set("category", event.target.value)}
          required
        />
        <datalist id="category-list">
          {categories.map((category) => (
            <option key={category._id} value={category.name} />
          ))}
        </datalist>
      </label>
      <div className="field-pair">
        <label>
          <span>Stock</span>
          <input
            type="number"
            value={form.stock}
            onChange={(event) => set("stock", event.target.value)}
          />
        </label>
        <label>
          <span>Minimum</span>
          <input
            type="number"
            value={form.minimumStock}
            onChange={(event) => set("minimumStock", event.target.value)}
          />
        </label>
      </div>
      <div className="field-pair">
        <label>
          <span>Unit</span>
          <input
            value={form.unit}
            onChange={(event) => set("unit", event.target.value)}
          />
        </label>
        <label>
          <span>Price</span>
          <input
            type="number"
            value={form.price}
            onChange={(event) => set("price", event.target.value)}
          />
        </label>
      </div>
      <label>
        <span>Description</span>
        <textarea
          value={form.description}
          onChange={(event) => set("description", event.target.value)}
        />
      </label>
      <label>
        <span>Image</span>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => onFile(event.target.files[0])}
        />
      </label>
      <button className="primary-action" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
