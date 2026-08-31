import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getAdminSessionState } from "@/lib/admin";

const adminAreas = [
  ["Businesses", "Review profiles, verification state, and categories."],
  ["Products", "Review barcode records, evidence, and alternatives."],
  ["Submissions", "Moderate product and business suggestions."],
  ["Reports", "Resolve disputed or incorrect information."],
  ["Evidence", "Attach source links and review extracted claims."],
  ["Feed", "Publish and order discovery story cards."],
  ["Community stats", "Review Canadian-choice anomalies."]
];

export default async function AdminPage() {
  const state = await getAdminSessionState();

  return (
    <div className="page">
      <section className="section" style={{ marginTop: 0 }}>
        <h1>Admin</h1>
        {!state.allowed ? (
          <div className="form-surface">
            <ShieldCheck aria-hidden="true" size={30} />
            <h2>Admin access required</h2>
            <p className="muted">{state.reason}</p>
            <Link className="button" href="/login">Go to account</Link>
          </div>
        ) : (
          <div className="grid">
            {adminAreas.map(([title, description]) => (
              <article className="card card__body" key={title}>
                <h2>{title}</h2>
                <p className="muted">{description}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
