import Link from "next/link";
import { Keyboard, ScanLine, Zap } from "lucide-react";

export default function ScanPage() {
  return (
    <div className="page">
      <section className="two-column">
        <div className="stack">
          <h1>Scan</h1>
          <p className="lead">
            Camera scanning will be connected in the scanner milestone. Manual lookup is available first so barcode flows can be tested on any device.
          </p>
          <div className="scan-box" role="img" aria-label="Barcode scanner preview placeholder">
            <ScanLine aria-hidden="true" size={56} />
            <strong>Barcode scanner area</strong>
            <span>Use manual entry if camera access is unavailable.</span>
          </div>
          <div className="actions">
            <button className="icon-button" type="button" aria-label="Toggle flashlight">
              <Zap aria-hidden="true" size={19} />
            </button>
            <button className="icon-button" type="button" aria-label="Enter barcode manually">
              <Keyboard aria-hidden="true" size={19} />
            </button>
          </div>
        </div>
        <form className="form-surface" action="/search">
          <h2>Manual barcode lookup</h2>
          <label>
            <span className="eyebrow">UPC or EAN</span>
            <input className="input" name="q" inputMode="numeric" placeholder="100000000001" />
          </label>
          <button className="button" type="submit">Look up barcode</button>
          <Link className="button button--secondary" href="/submit-product">
            Help identify a product
          </Link>
        </form>
      </section>
    </div>
  );
}
