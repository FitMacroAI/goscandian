import Link from "next/link";

export default function SubmitProductSuccessPage() {
  return (
    <div className="page">
      <section className="form-surface">
        <h1>Product submission received</h1>
        <p className="lead">Thanks. The product will be reviewed before any public verified claims are shown.</p>
        <div className="actions">
          <Link className="button" href="/scan">Back to Scan</Link>
          <Link className="button button--secondary" href="/submit-product">Submit another</Link>
        </div>
      </section>
    </div>
  );
}
