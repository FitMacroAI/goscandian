import { submitProduct } from "../actions";

export default function SubmitProductPage() {
  return (
    <div className="page">
      <section className="section" style={{ marginTop: 0 }}>
        <h1>Help identify a product</h1>
        <p className="lead">
          Submissions go into review first. They do not become verified claims automatically.
        </p>
        <form className="form-surface" action={submitProduct}>
          <input className="input" name="barcode" placeholder="Barcode" />
          <input className="input" name="productName" placeholder="Product name" required />
          <input className="input" name="brandName" placeholder="Brand" required />
          <input className="input" name="sourceUrl" placeholder="Optional website or source" type="url" />
          <textarea className="input" name="claimedOrigin" placeholder="What does the label say?" rows={5} />
          <button className="button" type="submit">Submit for review</button>
        </form>
      </section>
    </div>
  );
}
