import Link from "next/link";
import { featureFlags } from "@/config/feature-flags";

const items = [
  ["Account", "/login"],
  ["Suggest a Canadian business", "/suggest-business"],
  ["Submit an unknown product", "/submit-product"],
  ["Contribution history", "/more/contributions"],
  ["I chose Canadian history", "/more/choices"],
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
  ["Methodology", "/methodology"],
  ["Report issue", "/report"],
  ["About the project", "/about"]
];

export default function MorePage() {
  return (
    <div className="page">
      <section className="section" style={{ marginTop: 0 }}>
        <h1>More</h1>
        <div className="stack">
          {items.map(([label, href]) => (
            <Link className="card card__body" key={href} href={href}>
              <strong>{label}</strong>
            </Link>
          ))}
          {featureFlags.enableDeveloperSupport ? (
            <Link className="card card__body" href="/support">
              <strong>Support the Developer</strong>
              <span className="muted">
                This app is free for everyone. Optional support helps ongoing development.
              </span>
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
