export default function ReportPage() {
  return (
    <div className="page">
      <section className="section" style={{ marginTop: 0 }}>
        <h1>Report incorrect information</h1>
        <form className="form-surface">
          <input className="input" name="reason" placeholder="Reason" />
          <textarea className="input" name="details" placeholder="Details or source links" rows={6} />
          <button className="button" type="button">Submit report</button>
        </form>
      </section>
    </div>
  );
}
