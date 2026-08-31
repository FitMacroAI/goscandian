export default function SubmitProductPage() {
  return (
    <div className="page">
      <section className="section" style={{ marginTop: 0 }}>
        <h1>Help identify a product</h1>
        <form className="form-surface">
          <input className="input" name="barcode" placeholder="Barcode" />
          <input className="input" name="productName" placeholder="Product name" />
          <input className="input" name="brandName" placeholder="Brand" />
          <input className="input" name="sourceUrl" placeholder="Optional website or source" />
          <textarea className="input" name="claimedOrigin" placeholder="What does the label say?" rows={5} />
          <button className="button" type="button">Submit for review</button>
        </form>
      </section>
    </div>
  );
}
