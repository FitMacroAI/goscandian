import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { businesses, products } from "@/lib/mock-data";

export default function BusinessProfilePage({ params }: { params: { slug: string } }) {
  const business = businesses.find((item) => item.slug === params.slug);
  if (!business) notFound();

  return (
    <div className="page">
      <section className="two-column">
        <div className="media-placeholder">{business.province}</div>
        <div className="stack">
          <p className="eyebrow">{business.category}</p>
          <h1>{business.name}</h1>
          <p className="lead">
            {business.city}, {business.province}
          </p>
          <p>{business.story}</p>
          <StatusBadge verificationStatus={business.verificationStatus} confidence={business.confidence} />
          <div className="actions">
            <button className="button" type="button">Save</button>
            <button className="button button--secondary" type="button">Share</button>
            <button className="button button--secondary" type="button">Visit website</button>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Products</h2>
        <div className="stack">
          {products.slice(0, 2).map((product) => (
            <Link className="card card__body" key={product.slug} href={`/products/${product.slug}`}>
              <strong>{product.name}</strong>
              <span className="muted">{product.brandName}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
