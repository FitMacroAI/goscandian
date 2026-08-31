import Link from "next/link";
import { BusinessCardView, ProductCardView } from "@/components/cards";
import { getBusinesses, getProducts } from "@/lib/data";

export default async function DiscoverPage() {
  const [businesses, products] = await Promise.all([getBusinesses(), getProducts()]);

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__copy">
          <h1>Discover Canadian small businesses before you shop.</h1>
          <p className="lead">
            Browse practical Canadian options, check product claims, and save trusted finds without needing an account.
          </p>
          <div className="actions">
            <Link className="button" href="/scan">
              Scan a barcode
            </Link>
            <Link className="button button--secondary" href="/search">
              Search products
            </Link>
          </div>
        </div>
        <div className="hero__panel">
          <strong>Trustworthy discovery with clear evidence, confidence, and verification status.</strong>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <h2>Featured small businesses</h2>
          <span className="muted">Evidence-aware listings</span>
        </div>
        {businesses.length ? (
          <div className="grid">
            {businesses.map((business) => (
              <BusinessCardView key={business.slug} business={business} />
            ))}
          </div>
        ) : (
          <p className="empty-state">No businesses have been published yet.</p>
        )}
      </section>

      <section className="section">
        <div className="section__header">
          <h2>Recently checked products</h2>
          <Link className="topbar__method" href="/methodology">
            How status works
          </Link>
        </div>
        {products.length ? (
          <div className="stack">
            {products.map((product) => (
              <ProductCardView key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <p className="empty-state">No products have been added yet.</p>
        )}
      </section>
    </div>
  );
}
