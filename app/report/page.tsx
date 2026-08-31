import { submitReport } from "../actions";

export default function ReportPage() {
  return (
    <div className="page">
      <section className="section" style={{ marginTop: 0 }}>
        <h1>Report incorrect information</h1>
        <form className="form-surface" action={submitReport}>
          <select className="input" name="entityType" defaultValue="product" required>
            <option value="product">Product</option>
            <option value="business">Business</option>
            <option value="evidence">Evidence</option>
          </select>
          <input className="input" name="entityId" placeholder="Optional record id" />
          <input className="input" name="reason" placeholder="Reason" required />
          <textarea className="input" name="details" placeholder="Details or source links" rows={6} required />
          <button className="button" type="submit">Submit report</button>
        </form>
      </section>
    </div>
  );
}
