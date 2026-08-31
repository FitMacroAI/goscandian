import Link from "next/link";

export default function ReportSuccessPage() {
  return (
    <div className="page">
      <section className="form-surface">
        <h1>Report received</h1>
        <p className="lead">Thanks. The record has been flagged for review.</p>
        <Link className="button" href="/">Back to Discover</Link>
      </section>
    </div>
  );
}
