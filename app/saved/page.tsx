import { Bookmark } from "lucide-react";

export default function SavedPage() {
  return (
    <div className="page">
      <section className="section" style={{ marginTop: 0 }}>
        <h1>Saved</h1>
        <div className="tabs">
          <button className="tab" type="button">Businesses</button>
          <button className="tab" type="button">Products</button>
        </div>
        <div className="form-surface" style={{ marginTop: 18 }}>
          <Bookmark aria-hidden="true" size={28} />
          <h2>Saved items will work locally first.</h2>
          <p className="muted">
            Account sync comes after the anonymous session and auth milestone.
          </p>
        </div>
      </section>
    </div>
  );
}
