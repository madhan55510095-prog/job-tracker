import { useState } from "react";
import { STAGES } from "../stages.js";

const empty = { company: "", role: "", jobUrl: "", location: "", source: "", notes: "", stage: "APPLIED" };

export default function ApplicationForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      // send only non-empty optional fields
      const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ""));
      await onSubmit(payload);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>New application</h2>

        <label>Company *<input value={form.company} onChange={set("company")} required /></label>
        <label>Role *<input value={form.role} onChange={set("role")} required /></label>
        <label>Job URL<input type="url" value={form.jobUrl} onChange={set("jobUrl")} placeholder="https://..." /></label>
        <label>Location<input value={form.location} onChange={set("location")} /></label>
        <label>Source<input value={form.source} onChange={set("source")} placeholder="LinkedIn, referral, ..." /></label>
        <label>Stage
          <select value={form.stage} onChange={set("stage")}>
            {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </label>
        <label>Notes<textarea rows={3} value={form.notes} onChange={set("notes")} /></label>

        {error && <p className="error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </div>
  );
}
