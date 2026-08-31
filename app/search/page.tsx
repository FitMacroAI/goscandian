import { SlidersHorizontal } from "lucide-react";
import { BusinessCardView, ProductCardView } from "@/components/cards";
import { getBusinesses, getProducts } from "@/lib/data";

export default async function SearchPage({
  searchParams
}: {
  searchParams?: { q?: string };
}) {
  const query = searchParams?.q?.trim();
  const [businesses, products] = await Promise.all([getBusinesses(query), getProducts(query)]);

  return (
    <div className="page">
      <section className="section" style={{ marginTop: 0 }}>
        <h1>Search</h1>
        <form className="form-surface">
          <label>
            <span className="eyebrow">Business, product, city, province, barcode, or tag</span>
            <input
              className="input"
              name="q"
              placeholder="Try pantry, ON, coffee, or 100000000001"
              defaultValue={query}
            />
          </label>
          <div className="tabs" aria-label="Filters">
            <button className="tab" type="button">All</button>
            <button className="tab" type="button">Businesses</button>
            <button className="tab" type="button">Products</button>
            <button className="tab" type="button">Verified only</button>
            <button className="tab" type="button">Small business</button>
            <button className="tab" type="button">
              <SlidersHorizontal aria-hidden="true" size={16} /> Filters
            </button>
          </div>
        </form>
      </section>

      <section className="section">
        <h2>Businesses</h2>
        {businesses.length ? (
          <div className="grid">
            {businesses.map((business) => (
              <BusinessCardView key={business.slug} business={business} />
            ))}
          </div>
        ) : (
          <p className="empty-state">No businesses matched this search yet.</p>
        )}
      </section>

      <section className="section">
        <h2>Products</h2>
        {products.length ? (
          <div className="stack">
            {products.map((product) => (
              <ProductCardView key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <p className="empty-state">No products matched this search yet.</p>
        )}
      </section>
    </div>
  );
}
