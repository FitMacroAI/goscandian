import Link from "next/link";

export default function SuggestBusinessSuccessPage() {
  return (
    <div className="page">
      <section className="form-surface">
        <h1>Business suggestion received</h1>
        <p className="lead">Thanks. It is now in the moderation queue for review.</p>
        <div className="actions">
          <Link className="button" href="/">Back to Discover</Link>
          <Link className="button button--secondary" href="/suggest-business">Suggest another</Link>
        </div>
      </section>
    </div>
  );
}
