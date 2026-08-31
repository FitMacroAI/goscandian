import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCardView } from "@/components/cards";
import { StatusBadge } from "@/components/status-badge";
import { getProductByRouteKey, getProducts } from "@/lib/data";

export default async function ProductProfilePage({ params }: { params: { slug: string } }) {
  const [product, products] = await Promise.all([
    getProductByRouteKey(params.slug),
    getProducts()
  ]);
  if (!product) notFound();

  const alternatives = products.filter((item) => item.slug !== product.slug).slice(0, 2);

  return (
    <div className="page">
      <section className="two-column">
        <div className="media-placeholder">{product.category.slice(0, 2)}</div>
        <div className="stack">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="lead">{product.brandName}</p>
          <p className="code">{product.barcode}</p>
          <div className="card card__body">
            <h2>Canadian status</h2>
            <p>{product.canadaStatus.replaceAll("_", " ")}</p>
            <StatusBadge verificationStatus={product.verificationStatus} confidence={product.confidence} />
            <p className="muted">Last checked: development fixture</p>
          </div>
          <div className="card card__body">
            <h2>Why we say this</h2>
            <p>
              This MVP fixture shows how evidence explanations will appear. Production records require source evidence before verified claims are shown.
            </p>
            <Link className="topbar__method" href="/methodology">How Canadian status works</Link>
          </div>
          <div className="actions">
            <button className="button" type="button">Save</button>
            <button className="button button--secondary" type="button">I chose Canadian</button>
            <Link className="button button--secondary" href="/report">Report incorrect information</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Canadian alternatives</h2>
        <div className="stack">
          {alternatives.map((alternative) => (
            <ProductCardView key={alternative.slug} product={alternative} />
          ))}
        </div>
      </section>
    </div>
  );
}
