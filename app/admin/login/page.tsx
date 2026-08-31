import { adminLogin } from "../../actions";

export default function AdminLoginPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  return (
    <div className="page">
      <section className="form-surface">
        <h1>Admin login</h1>
        <p className="lead">Enter the admin access token configured in Vercel.</p>
        {searchParams?.error ? <p className="empty-state">Invalid admin token.</p> : null}
        <form className="stack" action={adminLogin}>
          <input
            className="input"
            name="token"
            placeholder="Admin access token"
            type="password"
            required
          />
          <button className="button" type="submit">Open admin</button>
        </form>
      </section>
    </div>
  );
}
