import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { adminLogout, updateModerationStatus } from "../actions";
import { getAdminSessionState } from "@/lib/admin";
import { getModerationQueues } from "@/lib/moderation";

export default async function AdminPage({
  searchParams
}: {
  searchParams?: { updated?: string };
}) {
  const state = await getAdminSessionState();
  const queues = state.allowed ? await getModerationQueues() : null;

  return (
    <div className="page">
      <section className="section" style={{ marginTop: 0 }}>
        <div className="section__header">
          <h1>Admin</h1>
          {state.allowed ? (
            <form action={adminLogout}>
              <button className="button button--secondary" type="submit">Log out</button>
            </form>
          ) : null}
        </div>
        {!state.allowed ? (
          <div className="form-surface">
            <ShieldCheck aria-hidden="true" size={30} />
            <h2>Admin access required</h2>
            <p className="muted">{state.reason}</p>
            <Link className="button" href="/admin/login">Enter admin token</Link>
          </div>
        ) : (
          <div className="stack">
            {searchParams?.updated ? (
              <p className="success-state">Moderation status updated to {searchParams.updated}.</p>
            ) : null}
            {queues?.error ? <p className="empty-state">{queues.error}</p> : null}
            <QueueSection
              title="Product submissions"
              empty="No product submissions yet."
              rows={queues?.productSubmissions ?? []}
              render={(item) => (
                <>
                  <h3>{item.product_name ?? "Unnamed product"}</h3>
                  <p className="muted">{item.brand_name ?? "Unknown brand"} · {item.barcode ?? "No barcode"}</p>
                  <p>{item.claimed_origin ?? "No origin details provided."}</p>
                  {item.source_url ? <a className="topbar__method" href={item.source_url}>Source</a> : null}
                  <ModerationActions table="product_submissions" id={item.id} status={item.status} />
                </>
              )}
            />
            <QueueSection
              title="Business suggestions"
              empty="No business suggestions yet."
              rows={queues?.businessSubmissions ?? []}
              render={(item) => (
                <>
                  <h3>{item.business_name}</h3>
                  <p className="muted">{item.category ?? "Uncategorized"} · {item.province ?? "No province"}</p>
                  <p>{item.why_it_belongs ?? "No details provided."}</p>
                  <p className="status-badge status-badge--needs_review">
                    Score {item.moderation_score ?? "n/a"} · {item.moderation_decision ?? "not scored"}
                  </p>
                  {item.moderation_notes?.length ? (
                    <ul className="plain-list">
                      {item.moderation_notes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="actions">
                    {item.website_url ? <a className="button button--secondary" href={item.website_url}>Website</a> : null}
                    {item.evidence_url ? <a className="button button--secondary" href={item.evidence_url}>Evidence</a> : null}
                  </div>
                  <ModerationActions table="business_submissions" id={item.id} status={item.status} />
                </>
              )}
            />
            <QueueSection
              title="Reports"
              empty="No reports yet."
              rows={queues?.reports ?? []}
              render={(item) => (
                <>
                  <h3>{item.reason}</h3>
                  <p className="muted">{item.entity_type} · {item.entity_id}</p>
                  <p>{item.details ?? "No details provided."}</p>
                  <ModerationActions table="reports" id={item.id} status={item.status} report />
                </>
              )}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function QueueSection<T>({
  title,
  empty,
  rows,
  render
}: {
  title: string;
  empty: string;
  rows: T[];
  render: (item: T) => React.ReactNode;
}) {
  return (
    <section className="section">
      <div className="section__header">
        <h2>{title}</h2>
        <span className="muted">{rows.length} total</span>
      </div>
      {rows.length ? (
        <div className="grid">
          {rows.map((item, index) => (
            <article className="card card__body" key={index}>
              {render(item)}
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-state">{empty}</p>
      )}
    </section>
  );
}

function ModerationActions({
  table,
  id,
  status,
  report = false
}: {
  table: "product_submissions" | "business_submissions" | "reports";
  id: string;
  status: string;
  report?: boolean;
}) {
  const statuses = report ? ["reviewing", "resolved", "rejected"] : ["approved", "rejected"];

  return (
    <div className="stack">
      <p className="status-badge status-badge--needs_review">{status}</p>
      <div className="actions">
        {statuses.map((nextStatus) => (
          <form action={updateModerationStatus} key={nextStatus}>
            <input type="hidden" name="table" value={table} />
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value={nextStatus} />
            <button className="button button--secondary" type="submit">
              {nextStatus}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
