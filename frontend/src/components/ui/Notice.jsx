export function Notice({ error, loading }) {
  if (loading) {
    return (
      <div className="loading-state" aria-label="Loading data">
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (error) return <p className="notice is-error">{error}</p>;
  return null;
}
