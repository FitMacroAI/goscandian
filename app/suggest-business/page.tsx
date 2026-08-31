import { submitBusiness } from "../actions";

export default function SuggestBusinessPage() {
  return (
    <div className="page">
      <section className="section" style={{ marginTop: 0 }}>
        <h1>Suggest a Canadian business</h1>
        <p className="lead">
          Suggestions enter moderation so the directory stays evidence-aware and trustworthy.
        </p>
        <form className="form-surface" action={submitBusiness}>
          <input className="input" name="businessName" placeholder="Business name" required />
          <input className="input" name="websiteUrl" placeholder="Website" type="url" />
          <input className="input" name="province" placeholder="Province, e.g. ON" maxLength={2} required />
          <input className="input" name="category" placeholder="Category" required />
          <textarea
            className="input"
            name="whyItBelongs"
            placeholder="Why should this business be included?"
            rows={5}
            required
          />
          <input className="input" name="evidenceUrl" placeholder="Optional evidence link" type="url" />
          <button className="button" type="submit">Submit suggestion</button>
        </form>
      </section>
    </div>
  );
}
