import { copy } from "@/i18n/en";

const points = [
  "Ownership and manufacturing are separate. A Canadian-owned business can make products elsewhere, and a Canadian-made product can come from a foreign-owned company.",
  "Barcode prefixes are not proof of manufacturing location or ownership.",
  "Verified means reviewed evidence supports the claim. AI inference alone cannot verify a claim.",
  "Community submissions enter moderation before they affect public classification.",
  "Disputed records remain visible only with clear dispute labeling and supporting context."
];

export default function MethodologyPage() {
  return (
    <div className="page">
      <section className="section" style={{ marginTop: 0 }}>
        <h1>{copy.methodologyTitle}</h1>
        <p className="lead">
          Canadian status is evidence-based. When the app does not have enough evidence, it says so.
        </p>
        <div className="stack" style={{ marginTop: 24 }}>
          {points.map((point) => (
            <article className="card card__body" key={point}>
              <p>{point}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
