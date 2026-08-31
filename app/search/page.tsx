import { SlidersHorizontal } from "lucide-react";
import { BusinessCardView, ProductCardView } from "@/components/cards";
import { businesses, products } from "@/lib/mock-data";

export default function SearchPage() {
  return (
    <div className="page">
      <section className="section" style={{ marginTop: 0 }}>
        <h1>Search</h1>
        <form className="form-surface">
          <label>
            <span className="eyebrow">Business, product, city, province, barcode, or tag</span>
            <input className="input" name="query" placeholder="Try pantry, ON, coffee, or 100000000001" />
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
        <div className="grid">
          {businesses.map((business) => (
            <BusinessCardView key={business.slug} business={business} />
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Products</h2>
        <div className="stack">
          {products.map((product) => (
            <ProductCardView key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
