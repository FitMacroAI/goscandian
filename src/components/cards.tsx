import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { StatusBadge } from "./status-badge";
import type { BusinessCard, ProductCard } from "@/lib/mock-data";

export function BusinessCardView({ business }: { business: BusinessCard }) {
  return (
    <article className="card story-card">
      <div className="media-placeholder" aria-hidden="true">
        {business.province}
      </div>
      <div className="card__body">
        <p className="eyebrow">{business.category}</p>
        <h3>{business.name}</h3>
        <p className="muted">
          {business.city}, {business.province}
        </p>
        <p>{business.story}</p>
        <StatusBadge verificationStatus={business.verificationStatus} confidence={business.confidence} />
        <div className="actions">
          <Link className="button" href={`/businesses/${business.slug}`}>
            View
          </Link>
          <button className="icon-button" type="button" aria-label={`Visit ${business.name} website`}>
            <ExternalLink aria-hidden="true" size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductCardView({ product }: { product: ProductCard }) {
  return (
    <article className="card product-card">
      <div className="product-thumb" aria-hidden="true" />
      <div>
        <p className="eyebrow">{product.category}</p>
        <h3>{product.name}</h3>
        <p className="muted">{product.brandName}</p>
        <p className="code">{product.barcode}</p>
        <StatusBadge verificationStatus={product.verificationStatus} confidence={product.confidence} />
      </div>
      <Link className="button button--compact" href={`/products/${product.slug}`}>
        Open
      </Link>
    </article>
  );
}
